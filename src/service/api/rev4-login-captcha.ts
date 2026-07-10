// BASE-WEB-WRAPPER (007-login-throttle)：不改既有 auth.ts（upstream Api.Auth 凍結）。
// loginCaptcha 取題與附掛 captcha 的登入出口走直接路徑 import（不經 barrel src/service/api/index.ts、
// 避 vite stale-export）；★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 之最小 service 接线（ADR 0040）。
import { request } from '../request';

/** 取圖形驗證碼題（軟區觸發後才呼叫；challenge 綁定帳號名、產題對後端零狀態寫入） */
export function fetchLoginCaptcha(userName: string) {
  return request<Api.Auth.LoginCaptcha>({
    url: '/auth/loginCaptcha',
    method: 'get',
    params: { userName }
  });
}

/**
 * 登入（LoginReq additive 兩 optional 欄——契約 §1）
 *
 * 未附 captcha 時 `captchaId`/`captchaCode` 為 undefined、JSON 序列化即省略 ⇒ wire 形與 upstream
 * `fetchLogin` 完全相同；附掛時走軟區 captcha gate（提交即消耗）。
 */
export function fetchLoginWithCaptcha(
  userName: string,
  password: string,
  captcha?: { captchaId: string; captchaCode: string }
) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      captchaId: captcha?.captchaId,
      captchaCode: captcha?.captchaCode
    }
  });
}
