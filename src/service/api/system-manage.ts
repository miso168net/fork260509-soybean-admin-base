import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** add user */
export function fetchAddUser(
  data: Pick<
    Api.SystemManage.User,
    'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
  >
) {
  return request({ url: '/systemManage/addUser', method: 'post', data });
}

/** update user */
export function fetchUpdateUser(
  data: Pick<
    Api.SystemManage.User,
    'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
  > & { id: Api.SystemManage.User['id'] }
) {
  return request({ url: '/systemManage/updateUser', method: 'post', data });
}

/** delete user */
export function fetchDeleteUser(data: { id: Api.SystemManage.User['id'] }) {
  return request({ url: '/systemManage/deleteUser', method: 'delete', data });
}

/** batch delete users */
export function fetchBatchDeleteUser(data: { ids: string[] }) {
  return request({ url: '/systemManage/batchDeleteUser', method: 'delete', data });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}
