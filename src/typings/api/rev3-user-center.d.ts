// [rev3-inline 025-user-center ADAPT ★] 個人中心 self-service DTO 型（新 namespace Api.UserCenter；declaration-merge）
// fork-delta：add-only 新檔；不改既有 typings。3 端點 wire：getProfile/updateProfile/changePassword。
// ★ 3 端型對齊：rust serde camelCase ↔ 此 typings ↔ component state。
// ★ GetProfileRes ＝ profile 子集 ＋ createdAt/createdBy（來源語意）＋ updatedAt（最後修改時間、不分本人/管理員）。
declare namespace Api {
  namespace UserCenter {
    /** GET /userCenter/getProfile 回（profile 子集 ＋ 來源語意 ＋ 最後修改時間） */
    interface GetProfileRes {
      userName: string;
      roles: string[];
      userGender?: number | null;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      /** 建立時間（rfc3339）；always 回 */
      createdAt: string;
      /** 建立來源語意類別（不洩露 operator 身分） */
      createdBy: 'system' | 'self' | 'admin';
      /** 最後修改時間（rfc3339）；從未修改→null（前端顯示「未修改」） */
      updatedAt?: string | null;
      /** 修改來源語意類別（不洩露 operator 身分；updatedAt 有值時前端才顯示其 origin） */
      updatedBy: 'system' | 'self' | 'admin';
    }

    /** POST /userCenter/updateProfile 收（各區塊只送自己欄位、部分更新；不含 user_name/roles/password/status） */
    interface UpdateProfileReq {
      userGender?: number | null;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
    }

    /** POST /userCenter/changePassword 收（password 永不上 wire） */
    interface ChangePwdReq {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }

    /** GET /userCenter/getPasswordPolicy 回（單一密碼政策 KV；改密頁提示用、僅 7 個 password_* 鍵） */
    interface PasswordPolicyItem {
      settingKey: string;
      settingValue: string;
    }

    /**
     * 個人中心前端 canonical model（index.vue 持、各卡共綁；各區塊只送自己欄位＝部分更新）。
     * nick/phone/email coalesce '' 便於 NInput 綁定（消 null type-lie）；userGender number（對齊 i16 wire）。
     */
    interface ProfileModel {
      userName: string;
      roles: string[];
      userGender: number | null;
      nickName: string | null;
      userPhone: string | null;
      userEmail: string | null;
      /** 唯讀顯示欄（basic-info-card 資訊列用；**不**納入 updateProfile 送出） */
      createdAt: string;
      createdBy: 'system' | 'self' | 'admin';
      /** 最後修改時間；null→前端顯示「未修改」 */
      updatedAt: string | null;
      /** 修改來源語意（system/self/admin）；self→無標註、updatedAt null→未修改 */
      updatedBy: 'system' | 'self' | 'admin';
    }
  }
}
