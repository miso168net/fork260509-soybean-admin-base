declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      /**
       * user id (rust-api `UserInfoOutput.user_id: String`).
       *
       * This is the rust internal ULID identity (JWT subject, audit log
       * actor, internal references). Distinct from `User.id: number`
       * (i64 from `display_id`, wire-friendly numeric id used in CRUD
       * endpoints). Two id representations coexist by-design (rust SoT
       * = ULID, wire = display_id i64).
       */
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }
}
