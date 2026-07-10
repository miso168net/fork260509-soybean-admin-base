import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 原行: import { fetchGetUserInfo, fetchLogin } from '@/service/api';
import { fetchGetUserInfo } from '@/service/api';
import { fetchLoginWithCaptcha } from '@/service/api/rev4-login-captcha';
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
   * [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 下兩行 doc＝captcha 入參＋失敗 msg 回傳擴充
   * @param [captcha] 軟區圖形驗證碼（captchaId/captchaCode，additive optional——契約 §1）
   * @returns 失敗時回傳後端 msg（如 auth.login.locked / auth.login.captchaRequired）；成功＝undefined
   */
  // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 原行: async function login(userName: string, password: string, redirect = true) {
  // 最小 store 接线（ADR 0040／research R12 (b) 形）：擴 captcha 入參＋失敗回傳後端 msg
  async function login(
    userName: string,
    password: string,
    redirect = true,
    captcha?: { captchaId: string; captchaCode: string }
  ) {
    startLoading();

    // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 原行: const { data: loginToken, error } = await fetchLogin(userName, password);
    const { data: loginToken, error } = await fetchLoginWithCaptcha(userName, password, captcha);

    // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 失敗 msg 暫存（locked／captchaRequired 兩態同碼 2222、僅 msg 相異）
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
      // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 直讀 error.response.data.msg（R12 (c) 先驗：flat 形 error 為 AxiosError 且必附 response——packages/axios/src/index.ts:68-78,164-166）
      failMsg = error.response?.data?.msg;
    }

    endLoading();

    // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 回傳失敗 msg 供 pwd-login 區分兩態（成功＝undefined）
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
