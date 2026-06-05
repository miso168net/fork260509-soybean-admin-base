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

/** get soft-deleted menu list (025 US1, 回收桶, Super-only). */
export function fetchGetDeletedMenus() {
  return request<Api.SystemManage.MenuList>({ url: '/systemManage/getDeletedMenus', method: 'get' });
}

/** restore a soft-deleted menu (025 US1, Super-only). */
export function fetchRestoreMenu(id: Api.SystemManage.Menu['id']) {
  return request<null>({ url: '/systemManage/restoreMenu', method: 'post', data: { id } });
}

/** get a role's visible menu ids for the menu-auth-modal tree preload (021, Super-only). Returns menu id[] (number). */
export function fetchGetRoleMenu(roleId: number) {
  return request<number[]>({ url: '/systemManage/getRoleMenu', method: 'get', params: { roleId } });
}

/** set a role's visible menu set (021, Super-only, hard-replace). menuIds = checked menu ids (number[]). */
export function fetchUpdateRoleMenu(roleId: number, menuIds: number[]) {
  return request<null>({ url: '/systemManage/updateRoleMenu', method: 'post', data: { roleId, menuIds } });
}

/** get a role's granted button codes for the button-auth-modal preload (022, Super-only). Returns code[] (字典序). */
export function fetchGetRoleButton(roleId: number) {
  return request<string[]>({ url: '/systemManage/getRoleButton', method: 'get', params: { roleId } });
}

/** set a role's granted button set (022, Super-only, hard-replace). codes = checked button codes (string[]). */
export function fetchUpdateRoleButton(roleId: number, codes: string[]) {
  return request<null>({ url: '/systemManage/updateRoleButton', method: 'post', data: { roleId, codes } });
}

/** get the available-button registry — all active menus' buttons, deduped, 字典序 (022, Super-only). For the button-auth-modal tree. */
export function fetchGetAllButtons() {
  return request<Api.SystemManage.MenuButton[]>({ url: '/systemManage/getAllButtons', method: 'get' });
}

/** get a role's granted endpoints for the endpoint-auth-modal preload (023, Super-only). Returns Endpoint[]. Super → full registry. */
export function fetchGetRoleEndpoints(roleId: number) {
  return request<Api.SystemManage.Endpoint[]>({ url: '/systemManage/getRoleEndpoints', method: 'get', params: { roleId } });
}

/** set a role's granted endpoint set (023, Super-only, hard-replace). endpoints = checked Endpoint[]. */
export function fetchUpdateRoleEndpoints(roleId: number, endpoints: Api.SystemManage.Endpoint[]) {
  return request<null>({ url: '/systemManage/updateRoleEndpoints', method: 'post', data: { roleId, endpoints } });
}

/** get the available-endpoint registry — all enforce_mw-protected endpoints, 字典序 (023, Super-only). For the endpoint-auth-modal tree. */
export function fetchGetAllEndpoints() {
  return request<Api.SystemManage.Endpoint[]>({ url: '/systemManage/getAllEndpoints', method: 'get' });
}

/** get a role's landing-page route name (021, Super-only). Defaults to "home" server-side. */
export function fetchGetRoleHome(roleId: number) {
  return request<string>({ url: '/systemManage/getRoleHome', method: 'get', params: { roleId } });
}

/** set a role's landing-page route name (021, Super-only). */
export function fetchUpdateRoleHome(roleId: number, home: string) {
  return request<null>({ url: '/systemManage/updateRoleHome', method: 'post', data: { roleId, home } });
}

/** get all system settings KV rows (029 US1, Super-only). */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({ url: '/systemManage/getSystemSettings', method: 'get' });
}

/** update one system setting by key (029 US1, Super-only). value is the stored string form. */
export function fetchUpdateSystemSetting(data: { key: string; value: string }) {
  return request<null>({ url: '/systemManage/updateSystemSetting', method: 'post', data });
}

/** set a user's per-account single-session policy (029 US2, Super-only). policy ∈ "inherit" | "on" | "off". */
export function fetchUpdateUserSessionPolicy(data: { userId: string; policy: string }) {
  return request<null>({ url: '/systemManage/updateUserSessionPolicy', method: 'post', data });
}
