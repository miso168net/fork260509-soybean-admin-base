import { request } from '../request';

/** the user write model (mirrors the user-operate-drawer Model: business fields, no id/password) */
type UserWriteModel = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
>;

/** add user (017 US1, Super-only). Default password assigned server-side. */
export function fetchAddUser(data: UserWriteModel) {
  return request<null>({ url: '/systemManage/addUser', method: 'post', data });
}

/** update user (017 US2, Super-only). `id` locates the row; userName is immutable (ignored server-side). */
export function fetchUpdateUser(data: UserWriteModel & { id: Api.SystemManage.User['id'] }) {
  return request<null>({ url: '/systemManage/updateUser', method: 'post', data });
}

/** delete one user (017 US3, Super-only, soft-delete). */
export function fetchDeleteUser(id: Api.SystemManage.User['id']) {
  return request<null>({ url: '/systemManage/deleteUser', method: 'delete', data: { id } });
}

/** batch delete users (017 US3, Super-only, soft-delete). ids come from checkedRowKeys (string[] at runtime). */
export function fetchBatchDeleteUser(ids: string[]) {
  return request<null>({ url: '/systemManage/batchDeleteUser', method: 'delete', data: { ids } });
}

/** the role write model (mirrors the role-operate-drawer Model: business fields, no id) */
type RoleWriteModel = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;

/** add role (018 US1, Super-only). */
export function fetchAddRole(data: RoleWriteModel) {
  return request<null>({ url: '/systemManage/addRole', method: 'post', data });
}
