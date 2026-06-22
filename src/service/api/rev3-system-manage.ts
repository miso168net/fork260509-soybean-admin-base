// [rev3-inline 009-user-management WRAPPER §III.1] 使用者寫端 wrapper（addUser/updateUser/deleteUser/batchDeleteUser）
// fork-delta：不改既有 system-manage.ts（讀端 getUserList/getAllRoles 仍用之）；本檔僅新增寫端
// view 走【直接路徑】import（不經 service/api/index.ts barrel）
import { request } from '../request';

/**
 * add user
 *
 * @param model user upsert model（無 id）
 */
export function fetchAddUser(model: Api.SystemManage.UserUpsertModel) {
  return request<null>({
    url: '/systemManage/addUser',
    method: 'post',
    data: model
  });
}

/**
 * update user
 *
 * wire 事實：後端 UserUpsertReq.id 走【字串】；前端 table id 是 number → 送出時 String(id) 轉字串，
 * 否則 serde 反序列化 String 欄失敗 → 落 2222 notFound
 *
 * @param model user upsert model（含 id）
 */
export function fetchUpdateUser(model: Api.SystemManage.UserUpsertModel) {
  return request<null>({
    url: '/systemManage/updateUser',
    method: 'post',
    data: { ...model, id: String(model.id) }
  });
}

/**
 * delete user（soft-delete）
 *
 * @param id user id（number → String 轉字串對齊後端 String 欄）
 */
export function fetchDeleteUser(id: number) {
  return request<null>({
    url: '/systemManage/deleteUser',
    method: 'delete',
    data: { id: String(id) }
  });
}

/**
 * batch delete user（soft-delete）
 *
 * @param ids user id 集（number → String 轉字串對齊後端 String 欄）
 */
export function fetchBatchDeleteUser(ids: (number | string)[]) {
  return request<null>({
    url: '/systemManage/batchDeleteUser',
    method: 'delete',
    data: { ids: ids.map(String) }
  });
}

// [rev3-inline 010-menu-management WRAPPER §5/§9] 選單寫端 wrapper（addMenu/updateMenu/deleteMenu/batchDeleteMenu/restoreMenu）
// fork-delta：不改既有 system-manage.ts（讀端 getMenuList/v2·getMenuTree·getAllPages 仍用之）；本檔僅新增寫端
// wire 事實（contract §5.1/§7）：管理域 Menu.id＝number；後端寫端 id/parentId 走【字串/number→i64】、
//   updateMenu 沿 009 ⚠️o 將 id 以 String(id) 送出對齊後端 String 欄；delete/batchDelete=DELETE、add/update/restore=POST

/**
 * add menu
 *
 * @param model menu upsert model（無 id）
 */
export function fetchAddMenu(model: Api.SystemManage.MenuUpsertModel) {
  return request<null>({
    url: '/systemManage/addMenu',
    method: 'post',
    data: model
  });
}

/**
 * update menu（含搬移父層 re-parent）
 *
 * wire 事實（沿 009 ⚠️o）：後端 MenuUpsertReq.id 走【字串】；前端 table id 是 number → 送出時 String(id) 轉字串
 *
 * @param model menu upsert model（含 id）
 */
export function fetchUpdateMenu(model: Api.SystemManage.MenuUpsertModel) {
  return request<null>({
    url: '/systemManage/updateMenu',
    method: 'post',
    data: { ...model, id: String(model.id) }
  });
}

/**
 * delete menu（soft-delete）
 *
 * @param id menu id（number → String 轉字串對齊後端 String 欄）
 */
export function fetchDeleteMenu(id: number) {
  return request<null>({
    url: '/systemManage/deleteMenu',
    method: 'delete',
    data: { id: String(id) }
  });
}

/**
 * batch delete menu（soft-delete；逐項獨立驗證、整批拒）
 *
 * @param ids menu id 集（number → String 轉字串對齊後端 String 欄）
 */
export function fetchBatchDeleteMenu(ids: (number | string)[]) {
  return request<null>({
    url: '/systemManage/batchDeleteMenu',
    method: 'delete',
    data: { ids: ids.map(String) }
  });
}

/**
 * restore menu（軟刪除復原；父已刪→復原至頂層）
 *
 * @param id menu id（number → String 轉字串對齊後端 String 欄）
 */
export function fetchRestoreMenu(id: number) {
  return request<null>({
    url: '/systemManage/restoreMenu',
    method: 'post',
    data: { id: String(id) }
  });
}

/**
 * get menu list v2（統一清單、含已刪除節點＋deleted flag）
 *
 * wire 事實（contract §4.1/curl 實證）：rust 回【裸陣列樹】（非 PaginatingQueryRecord 分頁包）；
 *   既有 system-manage.ts 的 fetchGetMenuList 宣告型為 MenuList（分頁包）＝型謊 → rev3 改用本 wrapper 回裸陣列、
 *   index.vue 配 custom transform 包成 PaginationData（不改既有 system-manage.ts/.d.ts、消型謊）
 */
export function fetchGetMenuListV2() {
  return request<Api.SystemManage.MenuListItem[]>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

// [rev3-inline 011-role-management WRAPPER §10/§7] 角色寫端＋角色×選單授權＋角色首頁 wrapper
// fork-delta：不改既有 system-manage.ts（讀端 getRoleList/getAllRoles 仍用之）；本檔僅新增寫端
// wire 事實（contract §5、⚠️r）：管理域 Role.id＝number；單 body id→String(id)（沿 009 ⚠️o，addRole 無 id）；
//   ★ getRoleMenu/updateRoleMenu 的 roleId/menuIds【維持 number、不轉 String】（獨立參數、與單 body id 非對稱、刻意 ⚠️r）

/**
 * add role
 *
 * @param model role upsert model（無 id）
 */
export function fetchAddRole(model: Api.SystemManage.RoleUpsertModel) {
  return request<null>({
    url: '/systemManage/addRole',
    method: 'post',
    data: model
  });
}

/**
 * update role
 *
 * wire 事實（沿 009 ⚠️o）：後端 RoleUpsertReq.id 走【字串】；前端 table id 是 number → 送出時 String(id) 轉字串
 *
 * @param model role upsert model（含 id）
 */
export function fetchUpdateRole(model: Api.SystemManage.RoleUpsertModel) {
  return request<null>({
    url: '/systemManage/updateRole',
    method: 'post',
    data: { ...model, id: String(model.id) }
  });
}

/**
 * delete role（soft-delete；delete guards：seeded/in-use/self → 2222）
 *
 * @param id role id（number → String 轉字串對齊後端 String 欄）
 */
export function fetchDeleteRole(id: number) {
  return request<null>({
    url: '/systemManage/deleteRole',
    method: 'delete',
    data: { id: String(id) }
  });
}

/**
 * batch delete role（soft-delete；逐項獨立驗證、整批拒）
 *
 * @param ids role id 集（number → String 轉字串對齊後端 String 欄）
 */
export function fetchBatchDeleteRole(ids: (number | string)[]) {
  return request<null>({
    url: '/systemManage/batchDeleteRole',
    method: 'delete',
    data: { ids: ids.map(String) }
  });
}

/**
 * get role menu（角色已授權選單 id 集；讀端復用 010 menu_routes_for_roles）
 *
 * ★ wire 事實（⚠️r）：roleId【維持 number、不轉 String】（query 獨立參數）；回 number[]（menu id、orphan route_name skip）
 *
 * @param roleId role id（number）
 */
export function fetchGetRoleMenu(roleId: number) {
  return request<number[]>({
    url: '/systemManage/getRoleMenu',
    method: 'get',
    params: { roleId }
  });
}

/**
 * update role menu（★ DB-first casbin policy WRITE、constitution §I.7 §4.2）
 *
 * ★ wire 事實（⚠️r）：roleId/menuIds【維持 number/number[]、不轉 String】；移除受保護選單→後端 2222 menuProtected
 *
 * @param roleId role id（number）
 * @param menuIds 授權選單 id 集（number[]）
 */
export function fetchUpdateRoleMenu(roleId: number, menuIds: number[]) {
  return request<null>({
    url: '/systemManage/updateRoleMenu',
    method: 'post',
    data: { roleId, menuIds }
  });
}

/**
 * get role home（角色登入導向首頁 route_name；entity 讀、default "home"）
 *
 * ★ wire 事實（⚠️r）：roleId【維持 number、不轉 String】（query 獨立參數）；回 string
 *
 * @param roleId role id（number）
 */
export function fetchGetRoleHome(roleId: number) {
  return request<string>({
    url: '/systemManage/getRoleHome',
    method: 'get',
    params: { roleId }
  });
}

/**
 * update role home（角色登入導向首頁；entity 寫、原子 op-log）
 *
 * ★ wire 事實（⚠️r）：roleId【維持 number、不轉 String】；home 選項來自 010 getAllPages
 *
 * @param roleId role id（number）
 * @param home 首頁 route_name（string）
 */
export function fetchUpdateRoleHome(roleId: number, home: string) {
  return request<null>({
    url: '/systemManage/updateRoleHome',
    method: 'post',
    data: { roleId, home }
  });
}

// [rev3-inline 012-audit-log-query WRAPPER] 審計查詢 3 唯讀讀端 wrapper（鏡像 fetchGetRoleList 形）
// fork-delta：不改既有 system-manage.ts；本檔僅新增讀端；皆 R_SUPER GET、回 PageRes 分頁包
// filter query 參數 camelCase、皆 optional；rust handler 空字串守門→當未設、畸形日期→2222（biz.audit.invalidDateRange）

/**
 * 剔除未設 filter（null/undefined/空字串）後再送出。
 *
 * 必要性（CDP smoke 接住、curl≠modal）：axios 用 qs.stringify 序列化、null 值會變成 `key=` 空字串送出。
 * 多數 string 欄後端有空字串守門（當未設），但 op-log 的【數字欄 entity_id＝Option<i64> 直接 serde】
 * 對 `entityId=` 空字串會 deserialize 失敗 → HTTP 400（cannot parse integer from empty string、整頁掛掉）。
 * 在 wrapper 端把未設 filter 剔除（= 乾淨 query、對齊「未設＝參數缺席」語意），3 端點一致處理。
 */
function pruneNullParams<T extends Record<string, unknown>>(params?: T): Partial<T> | undefined {
  if (!params) {
    return params;
  }

  const result: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  });

  return result as Partial<T>;
}

/**
 * get operation log（操作異動稽核；GET、R_SUPER）
 *
 * @param params operation log search params（filter + 分頁，皆 optional）
 */
export function fetchGetOperationLog(params?: Api.SystemManage.OperationLogSearchParams) {
  return request<Api.SystemManage.OperationLogList>({
    url: '/systemManage/getOperationLog',
    method: 'get',
    params: pruneNullParams(params)
  });
}

/**
 * get access log（API 存取稽核；GET、R_SUPER）
 *
 * @param params access log search params（filter + 分頁，皆 optional）
 */
export function fetchGetAccessLog(params?: Api.SystemManage.AccessLogSearchParams) {
  return request<Api.SystemManage.AccessLogList>({
    url: '/systemManage/getAccessLog',
    method: 'get',
    params: pruneNullParams(params)
  });
}

/**
 * get login attempt（登入嘗試稽核；GET、R_SUPER）
 *
 * @param params login attempt search params（filter + 分頁，皆 optional）
 */
export function fetchGetLoginAttempt(params?: Api.SystemManage.LoginAttemptSearchParams) {
  return request<Api.SystemManage.LoginAttemptList>({
    url: '/systemManage/getLoginAttempt',
    method: 'get',
    params: pruneNullParams(params)
  });
}

// [rev3-inline 015-policy-governance WRAPPER MODAL-WIRING(e)] 授權回收桶讀端+復原 wrapper
// fork-delta：不改既有 system-manage.ts；本檔僅新增；getArchivedPolicies GET R_SUPER 回 PageRes、restorePolicy POST
// wire 事實：restorePolicy id 走【字串】（沿 009 ⚠️o）；Applied/NoOp→0000、NotFound→2222（biz.policy.notFound）

/**
 * get archived policies（授權回收桶；GET、R_SUPER）
 *
 * @param params archived policy search params（filter + 分頁，皆 optional）
 */
export function fetchGetArchivedPolicies(params?: Api.SystemManage.ArchivedPolicySearchParams) {
  return request<Api.SystemManage.ArchivedPolicyList>({
    url: '/systemManage/getArchivedPolicies',
    method: 'get',
    params: pruneNullParams(params)
  });
}

/**
 * restore policy（從回收桶復原至現役；POST、R_SUPER）
 *
 * wire 事實：後端 id 走【字串】→ String(id) 轉字串；Applied/NoOp→0000（復原成功）、NotFound→2222
 *
 * @param id archived policy id（number → String 轉字串對齊後端 String 欄）
 */
export function fetchRestorePolicy(id: number) {
  return request<null>({
    url: '/systemManage/restorePolicy',
    method: 'post',
    data: { id: String(id) }
  });
}
