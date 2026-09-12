import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 003-auth-session] 登入出口改走 wrapper fetchLoginWithCaptcha（upstream fetchLogin 兩參、呼叫端擴不了 captcha 欄）；原行: import { fetchGetUserInfo, fetchLogin } from '@/service/api';
import { fetchGetUserInfo } from '@/service/api';
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：wrapper 以直接路徑 import（避 barrel 於 vite HMR 殘留舊 export、沿 rev6-settings.ts 先例）
import { fetchLoginWithCaptcha } from '@/service/api/rev6-auth';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref('');

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: []
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   * [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下兩行 doc 為純新增（captcha 入參＋失敗 msg 回傳）
   * @param [captcha] 軟區圖形驗證碼（captchaId／captchaCode；contracts/wire-auth.md §login 的兩個 optional 欄）
   * @returns 失敗時回後端 msg（biz.auth.captchaRequired／biz.auth.locked 同碼 2222、只靠 msg 分）；成功＝undefined
   */
  // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 003-auth-session] 簽名加第四參 captcha?（additive optional；三處既有呼叫端零改）；原行: async function login(userName: string, password: string, redirect = true) {
  async function login(
    userName: string,
    password: string,
    redirect = true,
    captcha?: { captchaId: string; captchaCode: string }
  ) {
    startLoading();

    // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 003-auth-session] 改呼 wrapper（未帶 captcha 時 wire 形與 fetchLogin 全等＝非軟區零行為變更）；原行: const { data: loginToken, error } = await fetchLogin(userName, password);
    const { data: loginToken, error } = await fetchLoginWithCaptcha(userName, password, captcha);

    // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：失敗 msg 暫存——locked／captchaRequired 同碼 2222、wire 上只有 msg 可辨
    let failMsg: string | undefined;

    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      resetStore();
      // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：直讀 error.response.data.msg（createFlatRequest 恆回 { data, error }、error 為 AxiosError 且附 response；onBackendFail 的 toast 照常）
      failMsg = error.response?.data?.msg;
    }

    endLoading();

    // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：回傳失敗 msg 供 pwd-login.vue 決定顯欄與換題（成功＝undefined）
    return failMsg;
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.token);
    localStg.set('refreshToken', loginToken.refreshToken);

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store
      Object.assign(userInfo, info);

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo
  };
});
