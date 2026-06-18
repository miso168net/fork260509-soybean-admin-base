// [rev3-inline 009-user-management ADAPT §III.1] 使用者寫端 DTO 型（declaration-merge 進 Api.SystemManage）
// fork-delta：不改既有 system-manage.d.ts；本檔僅【新增】寫端 write DTO
declare namespace Api {
  namespace SystemManage {
    /**
     * user upsert model（addUser/updateUser write DTO）
     *
     * - id 可選：add 無 id、update 有 id
     * - id 型用 number 對齊 component（User.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - 無 password（後端 UserUpsertReq 不含 password）
     * - userRoles wire＝sys_role.code[]（讀寫皆 code）
     */
    type UserUpsertModel = Pick<
      User,
      'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
    > & { id?: number };
  }
}
