// BASE-WEB-ADAPT (007-login-throttle)：新增 typings 檔，不改既有 auth.d.ts（upstream Api.Auth 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.Auth；loginCaptcha 取題回應形（camelCase wire、契約 §2）。
declare namespace Api {
  namespace Auth {
    /** 圖形驗證碼 challenge（GET /auth/loginCaptcha 回應 data；captchaImg＝data:image/png;base64, 完整 URI） */
    interface LoginCaptcha {
      captchaId: string;
      captchaImg: string;
    }
  }
}
