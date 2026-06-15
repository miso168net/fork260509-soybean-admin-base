// [rev3-inline WRAPPER]
// rev3 user-management WRITE wrappers (addUser / updateUser / deleteUser / batchDeleteUser).
// 各 fn 於後續任務 T018 / T023 / T028 逐步加入；此骨架檔為 fork-delta 佔位。

import { request } from '../request';

/** add user (rev3 write wrapper → rust-api POST /systemManage/addUser) */
export function fetchAddUser(
  model: Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'>
) {
  return request<null>({ url: '/systemManage/addUser', method: 'post', data: model });
}

/** update user (rev3 write wrapper → rust-api POST /systemManage/updateUser) */
export function fetchUpdateUser(
  model: Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'> & { id: number }
) {
  return request<null>({ url: '/systemManage/updateUser', method: 'post', data: model });
}

/** delete one user (rev3 → rust-api DELETE /systemManage/deleteUser?id=) */
export function fetchDeleteUser(id: number) {
  return request<null>({ url: '/systemManage/deleteUser', method: 'delete', params: { id } });
}

/** batch delete users (rev3 → rust-api DELETE /systemManage/batchDeleteUser?ids=1,2,3) */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<null>({ url: '/systemManage/batchDeleteUser', method: 'delete', params: { ids: ids.join(',') } });
}

// [rev3-inline WRAPPER]
// rev3 role-management WRITE wrappers (009; addRole 此單元 / updateRole / deleteRole / batchDeleteRole 後續單元逐步加入)。

/** add role (rev3 write wrapper → rust-api POST /systemManage/addRole) */
export function fetchAddRole(
  model: Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>
) {
  return request<null>({ url: '/systemManage/addRole', method: 'post', data: model });
}

/** update role (rev3 write wrapper → rust-api POST /systemManage/updateRole)；roleCode 提交但 server 端不可變、靜默忽略 */
export function fetchUpdateRole(
  model: Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'> & { id: number }
) {
  return request<null>({ url: '/systemManage/updateRole', method: 'post', data: model });
}

/** delete one role (rev3 → rust-api DELETE /systemManage/deleteRole?id=) */
export function fetchDeleteRole(id: number) {
  return request<null>({ url: '/systemManage/deleteRole', method: 'delete', params: { id } });
}

/** batch delete roles (rev3 → rust-api DELETE /systemManage/batchDeleteRole?ids=1,2,3) */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<null>({ url: '/systemManage/batchDeleteRole', method: 'delete', params: { ids: ids.join(',') } });
}
