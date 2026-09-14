// [rev6-inline BASE-WEB-ADAPT+ 003-auth-session] wire 契約錨點新檔——經 declaration merging 把本型掛進 Api.Auth，既有 auth.d.ts 一字未動（contracts/wire-auth.md §loginCaptcha）
declare namespace Api {
  namespace Auth {
    /**
     * 圖形驗證碼題（`GET /auth/loginCaptcha` 回應 data；camelCase wire——對齊後端 `LoginCaptchaData` 序列化輸出）
     *
     * `captchaId`＝無狀態簽題 token：軟區登入時連同答案以 `captchaId`／`captchaCode` 附掛在 `POST /auth/login`；
     * 後端提交即消耗、答錯即作廢，任何失敗後都得重取新題。`captchaImg`＝完整 `data:image/png;base64,` data URI
     * （220×120），可直接當 `<img src>`。
     * rev5:rev5-auth.d.ts 之 LoginCaptcha 同名同形（rev6 只換檔名前綴與標記 token）。
     */
    interface LoginCaptcha {
      captchaId: string;
      captchaImg: string;
    }
  }
}
