// [rev3-inline 025-user-center ADAPT ★] 個人中心 self-service DTO 型（新 namespace Api.UserCenter；declaration-merge）
// fork-delta：add-only 新檔；不改既有 typings。3 端點 wire：getProfile/updateProfile/changePassword。
// ★ 3 端型對齊：rust serde camelCase ↔ 此 typings ↔ component state。
// ★ GetProfileRes ＝ US1 子集 6 欄 ＋ US3 created/updated 語意 3 欄（createdAt/createdBy/adminUpdatedAt）。
declare namespace Api {
  namespace UserCenter {
    /** GET /userCenter/getProfile 回（US1 子集 6 欄 ＋ US3 created/updated 語意 3 欄） */
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
      /** 管理員更新時間（rfc3339）；本人更新/未更新→null（前端隱藏更新列） */
      adminUpdatedAt?: string | null;
    }

    /** POST /userCenter/updateProfile 收（各卡保存共用、送全 model；不含 user_name/roles/password/status） */
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
     * 個人中心前端 canonical model（index.vue 持、3 卡共綁；US1）。
     * nick/phone/email coalesce '' 便於 NInput 綁定（消 null type-lie）；userGender number（對齊 i16 wire）。
     */
    interface ProfileModel {
      userName: string;
      roles: string[];
      userGender: number | null;
      nickName: string | null;
      userPhone: string | null;
      userEmail: string | null;
      /** US3 唯讀顯示欄（basic-info-card 資訊列用；**不**納入 updateProfile 送出） */
      createdAt: string;
      createdBy: 'system' | 'self' | 'admin';
      adminUpdatedAt: string | null;
    }
  }
}
