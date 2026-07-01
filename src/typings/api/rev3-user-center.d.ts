// [rev3-inline 025-user-center ADAPT ★] 個人中心 self-service DTO 型（新 namespace Api.UserCenter；declaration-merge）
// fork-delta：add-only 新檔；不改既有 typings。3 端點 wire：getProfile/updateProfile/changePassword。
// ★ 3 端型對齊：rust serde camelCase ↔ 此 typings ↔ component state。
// ★ U0 GetProfileRes 只 6 欄（createdAt/createdBy/adminUpdatedAt 由 US3 擴）。
declare namespace Api {
  namespace UserCenter {
    /** GET /userCenter/getProfile 回（U0 子集 6 欄；created/updated 由 US3 擴） */
    interface GetProfileRes {
      userName: string;
      roles: string[];
      userGender?: number | null;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
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
    }
  }
}
