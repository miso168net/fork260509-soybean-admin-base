import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i)] 改走 wrapper 之 fetchLoginWithCaptcha（additive captcha 兩欄）；原行: import { fetchGetUserInfo, fetchLogin } from '@/service/api';
import { fetchGetUserInfo } from '@/service/api';
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 登入出口 wrapper import（直接路徑、避 barrel stale-export）：下一行為純新增（rev4: rev4-login-captcha.ts、rev5 合一進 rev5-auth.ts）。
import { fetchLoginWithCaptcha } from '@/service/api/rev5-auth';
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
   * [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下兩行 doc＝captcha 入參＋失敗 msg 回傳擴充（純新增）
   * @param [captcha] 軟區圖形驗證碼（captchaId/captchaCode；additive optional——wire-auth §login）
   * @returns 失敗時回傳後端 msg（biz.auth.locked／biz.auth.captchaRequired 兩態同碼 2222、僅 msg 相異）；成功＝undefined
   */
  // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i)] 簽名加 captcha 入參＋失敗 msg 回傳鏈（rev4: 同形接線、msg key 改 rev5 新名 biz.auth.*）；原行: async function login(userName: string, password: string, redirect = true) {
  async function login(
    userName: string,
    password: string,
    redirect = true,
    captcha?: { captchaId: string; captchaCode: string }
  ) {
    startLoading();

    // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i)] 改走 wrapper（未附 captcha 時 wire 形與 fetchLogin 完全相同）；原行: const { data: loginToken, error } = await fetchLogin(userName, password);
    const { data: loginToken, error } = await fetchLoginWithCaptcha(userName, password, captcha);

    // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 失敗 msg 暫存（下一行為純新增）：locked／captchaRequired 同碼 2222、wire 上僅 msg 可辨。
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
      // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 直讀 error.response.data.msg（下一行為純新增；flat 形 error 為 AxiosError 且必附 response——packages/axios createFlatRequest 恆回 {data, error}、永不 reject）。
      failMsg = error.response?.data?.msg;
    }

    endLoading();

    // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 回傳失敗 msg 供 pwd-login 區分兩態（下一行為純新增；成功＝undefined）。
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
