// BASE-WEB-WRAPPER (005-auth-login)：不改既有 auth.ts（upstream Api.Auth 凍結）。
// 4 個替代登入 stub 出口走直接路徑 import（不經 barrel src/service/api/index.ts、避 vite stale-export）；
// 一律打 POST /auth/*、後端 stub 恆回 2222 biz.auth.notSupported（ADR 0029）、toast 由攔截器 onError 自動顯示。
import { request } from '../request';

/** 發送驗證碼（stub、恆回 2222 not-supported） */
export function fetchSendCaptcha(data: Api.Auth.SendCaptchaReq) {
  return request<void>({
    url: '/auth/sendCaptcha',
    method: 'post',
    data
  });
}

/** 驗證碼登入（stub、恆回 2222 not-supported） */
export function fetchCodeLogin(data: Api.Auth.CodeLoginReq) {
  return request<void>({
    url: '/auth/codeLogin',
    method: 'post',
    data
  });
}

/** 註冊（stub、恆回 2222 not-supported） */
export function fetchRegister(data: Api.Auth.RegisterReq) {
  return request<void>({
    url: '/auth/register',
    method: 'post',
    data
  });
}

/** 重設密碼（stub、恆回 2222 not-supported） */
export function fetchResetPwd(data: Api.Auth.ResetPwdReq) {
  return request<void>({
    url: '/auth/resetPwd',
    method: 'post',
    data
  });
}
