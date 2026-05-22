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

/** add role */
export function fetchAddRole(
  data: Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>
) {
  return request({ url: '/systemManage/addRole', method: 'post', data });
}

/** update role */
export function fetchUpdateRole(
  data: Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'> & {
    id: Api.SystemManage.Role['id'];
  }
) {
  return request({ url: '/systemManage/updateRole', method: 'post', data });
}

/** delete role */
export function fetchDeleteRole(data: { id: Api.SystemManage.Role['id'] }) {
  return request({ url: '/systemManage/deleteRole', method: 'delete', data });
}

/** batch delete roles */
export function fetchBatchDeleteRole(data: { ids: string[] }) {
  return request({ url: '/systemManage/batchDeleteRole', method: 'delete', data });
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
  > & { password?: string }
) {
  return request({ url: '/systemManage/addUser', method: 'post', data });
}

/** update user */
export function fetchUpdateUser(
  data: Pick<
    Api.SystemManage.User,
    'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
  > & { id: Api.SystemManage.User['id']; password?: string }
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

/** add menu */
export function fetchAddMenu(data: Partial<Api.SystemManage.Menu>) {
  return request({ url: '/systemManage/addMenu', method: 'post', data });
}

/** update menu */
export function fetchUpdateMenu(data: Partial<Api.SystemManage.Menu> & { id: Api.SystemManage.Menu['id'] }) {
  return request({ url: '/systemManage/updateMenu', method: 'post', data });
}

/** delete menu */
export function fetchDeleteMenu(data: { id: number }) {
  return request({ url: '/systemManage/deleteMenu', method: 'delete', data });
}

/** batch delete menus */
export function fetchBatchDeleteMenu(data: { ids: number[] }) {
  return request({ url: '/systemManage/batchDeleteMenu', method: 'delete', data });
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

/** get role menu ids */
export function fetchGetRoleMenuIds(roleId: Api.SystemManage.Role['id']) {
  return request<number[]>({
    url: `/systemManage/getRoleMenuIds/${roleId}`,
    method: 'get'
  });
}

/** assign role menus */
export function fetchAssignRoleMenus(data: { roleId: Api.SystemManage.Role['id']; menuIds: number[] }) {
  return request({ url: '/systemManage/assignRoleMenus', method: 'post', data });
}
