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

    // [rev3-inline 010-menu-management ADAPT §9 L1/L2] 選單寫端 DTO 型＋統一清單 deleted flag（declaration-merge、不改既有 Menu/Api.Route）
    /**
     * menu upsert model（addMenu/updateMenu write DTO）
     *
     * - id 可選：add 無 id、update 有 id（含搬移父層）
     * - id 型用 number 對齊 component（Menu.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - parentId number：0=頂層（後端寫端 0→None）；reparent 由後端 3+1 guard 守門
     * - Pick 鍵與既有 Menu 實際欄一致（menu-operate-modal Model 子集）
     */
    type MenuUpsertModel = Pick<
      Menu,
      | 'parentId'
      | 'menuType'
      | 'menuName'
      | 'routeName'
      | 'routePath'
      | 'component'
      | 'icon'
      | 'iconType'
      | 'i18nKey'
      | 'status'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
      | 'buttons'
    > & { id?: number };

    /**
     * 統一清單列型（getMenuList/v2 回 list_all、含已軟刪除節點）
     *
     * - 既有 Menu 為 `type`（非 interface）無法 declaration-merge → 以 Menu 為基底擴 deleted flag
     * - deleted:bool（後端 deleted_at.is_some()）；側欄/動態選單/getMenuTree 恆不含已刪
     * - children 收斂為 MenuListItem（樹遞迴）
     */
    type MenuListItem = Omit<Menu, 'children'> & {
      /** 是否已軟刪除（統一清單回收桶用） */
      deleted?: boolean;
      children?: MenuListItem[] | null;
    };

    // [rev3-inline 011-role-management ADAPT §10 L1/L2] 角色寫端 DTO 型（declaration-merge、不改既有 Role）
    /**
     * role upsert model（addRole/updateRole write DTO）
     *
     * - id 可選：add 無 id、update 有 id
     * - id 型用 number 對齊 component（Role.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - Pick 鍵與既有 Role 實際欄一致（role-operate-drawer Model 子集）
     */
    type RoleUpsertModel = Pick<Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'> & { id?: number };
  }
}
