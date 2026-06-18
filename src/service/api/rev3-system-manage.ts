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
