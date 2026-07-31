// BASE-WEB-ADAPT (014-user-center)：新增 typings 檔，個人中心自助端點家族 wire 形。
// 透過 TS 跨檔 declaration merging 併入全域 Api（014 全新 Api.UserCenter 命名空間）；
// 逐欄對齊 contracts §fetcher 對帳＋data-model §3：
//   id＝number（2^53 守衛後端擔保）；createdAt/updatedAt＝RFC3339 帶 offset 字串或 null；
//   createdByType/updatedByType＝classify_operator 三態折疊（不回 operator uid、隱私）。
// 020-email-verify-smtp：信箱驗證流 4 DTO（C1~C3）＋ProfileRes 加欄 emailVerifiedAt（C6 additive）
//   ＋UpdateProfileReq 移 userEmail（C5——信箱改走發碼→回填驗證一步寫入、不再經 updateProfile）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace UserCenter {
    /** 性別 wire 值域（"1"=男／"2"=女；wire_enum12 範式、與凍結 Api.SystemManage.UserGender 同字面） */
    type UserGender = '1' | '2';

    /** created/updated 操作者三態折疊值域（None→system／==本人→self／else→admin；data-model §3.1） */
    type OperatorType = 'system' | 'self' | 'admin';

    /**
     * 本人 profile wire 形（GET getProfile；data-model §3.1 逐欄 11 欄＋020 C6 additive 加欄＝12 欄）
     *
     * nickName／userPhone／userEmail null＝未設（前端 coalesce ''）；updatedAt null＝「未修改」；
     * roles＝role code 字串陣列（前端全形逗號 join 展示）；零密碼零會話識別欄。
     */
    type ProfileRes = {
      id: number;
      userName: string;
      nickName: string | null;
      userPhone: string | null;
      userEmail: string | null;
      userGender: UserGender | null;
      roles: string[];
      createdAt: string | null;
      updatedAt: string | null;
      createdByType: OperatorType | null;
      updatedByType: OperatorType | null;
      /** 020 C6 additive 加欄：信箱驗證時刻（RFC3339 帶 offset；null＝未驗證） */
      emailVerifiedAt: string | null;
    };

    /**
     * 更新本人 profile 請求（POST updateProfile；data-model §3.2）
     *
     * 三欄全可選——帶欄才寫（Some 才 Set）、全缺＝提前 no-op；清欄回 NULL 不做（空字串存 ''）；
     * 020 C5 移 userEmail——信箱改走驗證流一步寫入（sendEmailCode→verifyEmailCode）、不再經本端點；
     * ★DTO 無 id／userName／roles／password／status 欄（結構性防身分滲入、標的恆＝claims.uid）。
     */
    type UpdateProfileReq = {
      nickName?: string;
      userGender?: UserGender;
      userPhone?: string;
    };

    /** 密碼政策投影列（GET getPasswordPolicy；7 鍵 password_* allowlist、兩欄投影；data-model §3.3） */
    type PasswordPolicyItem = {
      settingKey: string;
      settingValue: string;
    };

    /** 自助改密請求（POST changePassword；三欄全必填、後端 Debug 遮蔽永不入 log；data-model §3.4） */
    type ChangePwdReq = {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    };

    /** 信箱驗證 captcha challenge（GET emailCaptcha 回應 data；020 C1——與 loginCaptcha 同欄名、captchaImg＝data:image/png;base64, 完整 URI；ctx=email、TTL 300s） */
    type EmailCaptchaRes = {
      captchaId: string;
      captchaImg: string;
    };

    /** 發送信箱驗證碼請求（POST sendEmailCode；020 C2——captcha 先驗、challenge 提交即消耗） */
    type SendEmailCodeReq = {
      newEmail: string;
      captchaId: string;
      captchaAnswer: string;
    };

    /** 發送信箱驗證碼回應 data（020 C2——僅 verifyToken、絕不含驗證碼明文；憑據 TTL 600s） */
    type SendEmailCodeRes = {
      verifyToken: string;
    };

    /** 回填驗證請求（POST verifyEmailCode；020 C3——成功 data:null、前端隨後以 saved 事件重拉 getProfile） */
    type VerifyEmailCodeReq = {
      verifyToken: string;
      code: string;
    };
  }
}
