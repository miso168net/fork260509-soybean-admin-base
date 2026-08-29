// [rev5-inline BASE-WEB-ADAPT+ 007-user-password-admin] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-user-center.md；同軌先例＝rev5-user-admin.d.ts／rev5-role-admin.d.ts）。
declare namespace Api {
  /**
   * 個人中心自助面（`/userCenter/*` 兩端點；contracts/wire-user-center.md §1～§2）
   *
   * ★兩支皆 `Protection::Authed`——**登入即可用、不進 casbin**，標的恆＝`claims.uid`
   * （body 不帶 id）⇒ 本命名空間結構性沒有「標的 id」欄，也不該補回來：補了就等於在型面上
   * 開一條「替別人改密碼」的路，而那條路在 `Api.UserAdmin.ResetPasswordReq` 已另有其家。
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（沿 rev5-user-admin.d.ts 拍板理由）：
   * demo 殼的同名家族仍住在凍結的 system-manage.d.ts，獨立命名空間讓消費端寫
   * `Api.UserCenter.PasswordPolicyView`、前綴由命名空間本身承擔。
   * rev4: 承 rev4-user-center.d.ts 的**端點分組**，但 rev4 該命名空間另有 profile 三卡的讀寫型
   * （`ProfileRes`／`UpdateProfileReq`／信箱與手機驗證面）＝rev5 差異點不帶回——本刀個人中心
   * 只掛改密卡、其餘卡位留白（spec FR-037），零 profile 端點 ⇒ 型面同步只留兩支。
   * ★rev4 之 `PasswordPolicyItem[]`（settingKey／settingValue 的 KV 清單）亦不帶回：rev5 後端
   * 回的是**具名七欄投影**（見 `PasswordPolicyView`），前端因此不必再做一次字串鍵查表。
   */
  namespace UserCenter {
    /**
     * 密碼政策投影（`GET /userCenter/getPasswordPolicy` 之 `data`；contracts §1 逐欄、恰七鍵）
     *
     * - ★**恰七欄、不含 `password_change_min_interval`**（設密冷卻秒數）：後端該投影型的欄集
     *   本身即「哪些設定會下發」的答案，冷卻是端點固有規則、不是密碼形制政策——下發它等於把
     *   「多久之內不能再改」變成前端可繞過的提示。此處補一欄即與後端 wire 不同源。
     * - `minLength`／`maxLength` ★以**字元數**計；後端另有一道位元組上限（512 bytes）**不在本
     *   投影內**——那是防禦性硬界、非可調政策，前端不預判（FR-019 同精神）。
     * - 四個 `require*` 與 `forbidUsername` 皆為布林：後端政策鍵的 `'on'`／`'off'` 字面已在
     *   後端收斂完畢，前端拿到的是判定結果、不再解析字串。
     * - ★**取不到時的處置寫在消費端**（`hooks/business/pwd-policy.ts`）：靜默降 required、
     *   不彈錯亦不擋送出——後端是唯一裁判（FR-031 末句）。
     */
    type PasswordPolicyView = {
      /** 密碼長度下限（字元數） */
      minLength: number;
      /** 密碼長度上限（字元數） */
      maxLength: number;
      /** 須含數字 `[0-9]` */
      requireDigit: boolean;
      /** 須含小寫字母 `[a-z]` */
      requireLowercase: boolean;
      /** 須含大寫字母 `[A-Z]` */
      requireUppercase: boolean;
      /** 須含特殊符號 `[^A-Za-z0-9]` */
      requireSpecial: boolean;
      /** 密碼不得與帳號名大小寫不敏感相等（★相等、非子串——鏡像後端違規碼語意） */
      forbidUsername: boolean;
    };

    /**
     * 自助改密請求（`POST /userCenter/changePassword`；contracts §2 逐欄）
     *
     * ★**三欄全為明文上行、結構性無標的 id**：標的恆＝`claims.uid`。
     * 後端守門步序（任一步拒即零寫入）＝帳號活性→兩次一致→節流 precheck（在舊密驗證**前**）→
     * 舊密正確→新≠舊→政策（攜參 `{violations}`）→冷卻（攜參 `{remainingSeconds}`）；
     * 成功後 `revoke_others_of_user(keep=當前 sid)` ⇒ 其他裝置下一次請求得 8888、當前裝置不受影響。
     * ★拒因一律由 service/request 共用攔截層轉譯 `backend.biz.user.*` 後 toast，呼叫端零加工。
     */
    type ChangePasswordReq = {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
  }
}
