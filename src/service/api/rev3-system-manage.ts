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
