import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

// [rev5-inline BASE-WEB-I18N-WIRING(i)+ 003-auth-session START] 後端 msg 轉譯 helpers（rev4: 同形
// 機制重寫；契約＝specs/003-auth-session/contracts/msg-keys.md）。後端 msg 載穩定 i18n key（語言
// 無關；憲法 §I.3），顯示端經 `$t(`backend.${msg}`, msg)` 譯為使用者語言；★查不到鍵時 vue-i18n
// 落第二參的原文 fallback＝顯示後端原文，恆不顯示空字串或裸 `backend.*` 鍵（graceful fallback、
// 亦不吞錯——憲法 §III.2 (i) 收窄條件）。
// 明細通道：信封 data 為 plain object（如 {remainingSeconds}）→ 走 $t(key, named, msg) 三參
// named 插值；值為陣列且 msg 登記於 DETAIL_LIST_ITEM_KEY → 逐碼經對應子鍵樹譯為人話、以
// backend.common.listSeparator 在地化分隔符 join 成 scalar 才進 $t；未登記 msg 的明細值原樣通過。
// ★003 期後端恆不發攜明細 msg（passwordPolicy 歸 rev4:011-user-admin 射程）——本表暫零活躍鍵、
// 僅為 22 鍵契約中九支前端內部白名單鍵（passwordViolation 八碼＋listSeparator）的既定消費點；
// 後續攜陣列明細的新 key 須同步①建逐碼譯文子鍵②於此登記。
const DETAIL_LIST_ITEM_KEY: Record<string, string> = {
  'biz.user.passwordPolicy': 'backend.biz.user.passwordViolation'
};

function translateDetailValue(msg: string, value: unknown) {
  const prefix = DETAIL_LIST_ITEM_KEY[msg];
  if (!prefix || !Array.isArray(value)) return value;
  return value
    .map(item => $t(`${prefix}.${String(item)}` as App.I18n.I18nKey, String(item)))
    .join($t('backend.common.listSeparator'));
}

function translateBackendMsg(msg: string, detail: unknown) {
  const key = `backend.${msg}` as App.I18n.I18nKey;
  const isPlainObject = typeof detail === 'object' && detail !== null && !Array.isArray(detail);
  if (!isPlainObject) return $t(key, msg);
  const named = Object.fromEntries(
    Object.entries(detail as Record<string, unknown>).map(([k, v]) => [k, translateDetailValue(msg, v)])
  );
  return $t(key, named, msg);
}
// [rev5-inline BASE-WEB-I18N-WIRING(i)+ 003-auth-session END]

export const request = createFlatRequest(
  {
    baseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    defaultState: {
      errMsgStack: [],
      refreshTokenPromise: null
    } as RequestInstanceState,
    transform(response: AxiosResponse<App.Service.Response<any>>) {
      return response.data.data;
    },
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "0000"(default), it means the request is success
      // to change this logic by yourself, you can modify the `VITE_SERVICE_SUCCESS_CODE` in `.env` file
      return String(response.data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
    },
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const responseCode = String(response.data.code);

      function handleLogout() {
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);

        request.state.errMsgStack = request.state.errMsgStack.filter(msg => msg !== response.data.msg);
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = import.meta.env.VITE_SERVICE_LOGOUT_CODES?.split(',') || [];
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(response.data.msg)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), response.data.msg];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          // [rev5-inline BASE-WEB-I18N-WIRING(i) 003-auth-session] 7777 modal 內文改走轉譯（顯人話非裸鍵）；原行: content: response.data.msg,
          content: translateBackendMsg(response.data.msg, response.data.data),
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });

        return null;
      }

      // when the backend response code is in `expiredTokenCodes`, it means the token is expired, and refresh token
      // the api `refreshToken` can not return error code in `expiredTokenCodes`, otherwise it will be a dead loop, should return `logoutCodes` or `modalLogoutCodes`
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;
      let backendErrorCode = '';

      // get backend error message and code
      if (error.code === BACKEND_ERROR_CODE) {
        // [rev5-inline BASE-WEB-I18N-WIRING(i) 003-auth-session] showErrorMsg 鏈改走轉譯（後端 msg 有值才譯、原文 fallback）；原行: message = error.response?.data?.msg || message;
        const backendMsg = error.response?.data?.msg;
        message = backendMsg ? translateBackendMsg(backendMsg, error.response?.data?.data) : message;
        backendErrorCode = String(error.response?.data?.code || '');
      }

      // [rev5-inline BASE-WEB-I18N-WIRING(i)+ maint-b083-b106-b108-b111-b116-other START] 真 HTTP 層錯誤的信封 msg
      // 也走轉譯（B-117）：上一段只在 `BACKEND_ERROR_CODE`（HTTP 200＋業務碼）分支譯，真 4xx／5xx 走 axios 原生
      // message ⇒ toast 顯「Request failed with status code 403」，而 `backend.system.forbidden` 譯文早已在兩語
      // locale 就位卻永遠打不到。守法＝只譯「回應帶信封 msg」者；無信封（網路中斷／逾時／非 JSON 回應）維持
      // axios 原文，未命中鍵仍由 translateBackendMsg 的原文 fallback 兜住（憲法 §III.2 (i) 收窄條件不變）。
      // ★不動 backendErrorCode ⇒ 下方 modalLogout／expiredToken 兩道判斷面零影響（那兩碼恆走 HTTP 200 業務碼分支）。
      if (error.code !== BACKEND_ERROR_CODE) {
        const httpBackendMsg = error.response?.data?.msg;
        if (typeof httpBackendMsg === 'string' && httpBackendMsg) {
          message = translateBackendMsg(httpBackendMsg, error.response?.data?.data);
        }
      }
      // [rev5-inline BASE-WEB-I18N-WIRING(i)+ maint-b083-b106-b108-b111-b116-other END]

      // the error message is displayed in the modal
      const modalLogoutCodes = import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES?.split(',') || [];
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // when the token is expired, refresh token and retry request, so no need to show error message
      const expiredTokenCodes = import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES?.split(',') || [];
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message);
    }
  }
);

export const demoRequest = createRequest(
  {
    baseURL: otherBaseURL.demo
  },
  {
    transform(response: AxiosResponse<App.Service.DemoResponse>) {
      return response.data.result;
    },
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
