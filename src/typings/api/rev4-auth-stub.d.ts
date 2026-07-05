// BASE-WEB-ADAPT (005-auth-login)：新增 typings 檔，不改既有 auth.d.ts（upstream Api.Auth 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.Auth；4 個替代登入 stub 請求形（camelCase wire ↔ 三表單／captcha model 欄位）。
declare namespace Api {
  namespace Auth {
    /** 發送驗證碼請求（對齊 captcha getCaptcha 的 phone） */
    interface SendCaptchaReq {
      phone: string;
    }

    /** 驗證碼登入請求（對齊 code-login.vue model） */
    interface CodeLoginReq {
      phone: string;
      code: string;
    }

    /** 註冊請求（對齊 register.vue model） */
    interface RegisterReq {
      phone: string;
      code: string;
      password: string;
      confirmPassword: string;
    }

    /** 重設密碼請求（對齊 reset-pwd.vue model） */
    interface ResetPwdReq {
      phone: string;
      code: string;
      password: string;
      confirmPassword: string;
    }
  }
}
