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

/** update role (018 US2, Super-only). `id` locates the row; roleCode is immutable (ignored server-side). */
export function fetchUpdateRole(data: RoleWriteModel & { id: Api.SystemManage.Role['id'] }) {
  return request<null>({ url: '/systemManage/updateRole', method: 'post', data });
}

/** delete one role (018 US3, Super-only, soft-delete). */
export function fetchDeleteRole(id: Api.SystemManage.Role['id']) {
  return request<null>({ url: '/systemManage/deleteRole', method: 'delete', data: { id } });
}

/** batch delete roles (018 US3, Super-only, soft-delete). ids come from checkedRowKeys (string[] at runtime). */
export function fetchBatchDeleteRole(ids: string[]) {
  return request<null>({ url: '/systemManage/batchDeleteRole', method: 'delete', data: { ids } });
}

/** the menu write model (mirrors the menu-operate-modal Model business fields, minus layout/page/pathParam, no id) */
type MenuWriteModel = Pick<
  Api.SystemManage.Menu,
  | 'menuType'
  | 'menuName'
  | 'routeName'
  | 'routePath'
  | 'component'
  | 'order'
  | 'i18nKey'
  | 'icon'
  | 'iconType'
  | 'status'
  | 'parentId'
  | 'keepAlive'
  | 'constant'
  | 'href'
  | 'hideInMenu'
  | 'activeMenu'
  | 'multiTab'
  | 'fixedIndexInTab'
> & {
  query: NonNullable<Api.SystemManage.Menu['query']>;
  buttons: NonNullable<Api.SystemManage.Menu['buttons']>;
};

/** add menu (020 US1, Super-only). routeName/menuType immutable-on-edit handled server-side. */
export function fetchAddMenu(data: MenuWriteModel) {
  return request<null>({ url: '/systemManage/addMenu', method: 'post', data });
}

/** update menu (020 US2, Super-only). `id` locates the row; routeName/menuType/parentId ignored server-side. */
export function fetchUpdateMenu(data: MenuWriteModel & { id: Api.SystemManage.Menu['id'] }) {
  return request<null>({ url: '/systemManage/updateMenu', method: 'post', data });
}

/** delete one menu (020 US3, Super-only, soft-delete + seed/parent guards). */
export function fetchDeleteMenu(id: Api.SystemManage.Menu['id']) {
  return request<null>({ url: '/systemManage/deleteMenu', method: 'delete', data: { id } });
}

/** batch delete menus (020 US3, Super-only, soft-delete + atomic seed/parent reject). */
export function fetchBatchDeleteMenu(ids: string[]) {
  return request<null>({ url: '/systemManage/batchDeleteMenu', method: 'delete', data: { ids } });
}

/** get a role's visible menu ids for the menu-auth-modal tree preload (021, Super-only). Returns menu id[] (number). */
export function fetchGetRoleMenu(roleId: number) {
  return request<number[]>({ url: '/systemManage/getRoleMenu', method: 'get', params: { roleId } });
}

/** set a role's visible menu set (021, Super-only, hard-replace). menuIds = checked menu ids (number[]). */
export function fetchUpdateRoleMenu(roleId: number, menuIds: number[]) {
  return request<null>({ url: '/systemManage/updateRoleMenu', method: 'post', data: { roleId, menuIds } });
}

/** get a role's landing-page route name (021, Super-only). Defaults to "home" server-side. */
export function fetchGetRoleHome(roleId: number) {
  return request<string>({ url: '/systemManage/getRoleHome', method: 'get', params: { roleId } });
}

/** set a role's landing-page route name (021, Super-only). */
export function fetchUpdateRoleHome(roleId: number, home: string) {
  return request<null>({ url: '/systemManage/updateRoleHome', method: 'post', data: { roleId, home } });
}
