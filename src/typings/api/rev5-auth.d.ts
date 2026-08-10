// [rev5-inline BASE-WEB-ADAPT+ 003-auth-session] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api.Auth、不改既有 auth.d.ts（upstream Api.Auth 凍結；contracts/wire-auth.md §loginCaptcha、ADR 0018 同軌先例＝rev5-settings.d.ts）。
declare namespace Api {
  namespace Auth {
    /**
     * 圖形驗證碼 challenge（`GET /auth/loginCaptcha` 回應 data；camelCase wire）
     *
     * `captchaId`＝無狀態簽名 token（軟區登入時以 `captchaId`/`captchaCode` 附掛——
     * 提交即消耗、答錯即失效須重取新題）；`captchaImg`＝`data:image/png;base64,`
     * 完整 data URI（220×120）。
     * rev4: 承 rev4-login-captcha.d.ts 之 LoginCaptcha 同名 interface，二欄形不變。
     */
    interface LoginCaptcha {
      captchaId: string;
      captchaImg: string;
    }
  }
}
