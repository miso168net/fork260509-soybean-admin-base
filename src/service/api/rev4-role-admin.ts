// BASE-WEB-WRAPPER (009-role-admin)：新增 service 檔，不改凍結 system-manage.ts（4 讀 fetcher 沿 barrel 復用）。
// 本 US1 寫端 4 fetcher（addRole/updateRole＝POST；deleteRole/batchDeleteRole＝★DELETE、動詞逐條對齊 contracts P1）；
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

/** 新增角色（POST addRole；成功 0000｜2222 biz.role.codeExists／codeInvalid） */
export function fetchAddRole(data: Api.SystemManage.AddRoleReq) {
  return request<null>({
    url: '/systemManage/addRole',
    method: 'post',
    data
  });
}

/** 更新角色（POST updateRole；roleCode 不可變、全 None→no-op；2222 codeImmutable／cannotDisableSelfRole／superCannotDisable） */
export function fetchUpdateRole(data: Api.SystemManage.UpdateRoleReq) {
  return request<null>({
    url: '/systemManage/updateRole',
    method: 'post',
    data
  });
}

/** 刪除角色（★DELETE deleteRole；三層守門｜2222 seededProtected／inUse〔data{userCount}〕／cannotDeleteSelfRole） */
export function fetchDeleteRole(id: number) {
  return request<null>({
    url: '/systemManage/deleteRole',
    method: 'delete',
    data: { id }
  });
}

/** 批次刪除角色（★DELETE batchDeleteRole；逐項驗證整批拒 no-partial、一項違規整批零變更） */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteRole',
    method: 'delete',
    data: { ids }
  });
}

// ── US2 三維授權讀寫（6）＋支撐讀（2）＝8 fetcher（contracts P2 #7~#12、#15~#16）──
// ★getMenuTree/getAllPages（menu 樹／頁面全集）沿凍結 system-manage.ts barrel 復用、絕不於此重建（防雙源）。

/** 讀角色 menu 授權（GET getRoleMenu；回 menu id 集、route_name 反查、FR-023 讀端反向） */
export function fetchGetRoleMenu(roleId: number) {
  return request<number[]>({
    url: '/systemManage/getRoleMenu',
    method: 'get',
    params: { roleId }
  });
}

/** 更新角色 menu 授權（POST updateRoleMenu；Applied→reload｜2222 protectedRevoke〔data{blocked[]}〕） */
export function fetchUpdateRoleMenu(data: Api.SystemManage.UpdateRoleMenuReq) {
  return request<null>({
    url: '/systemManage/updateRoleMenu',
    method: 'post',
    data
  });
}

/** 讀角色 button 授權（GET getRoleButton；回 button code 集） */
export function fetchGetRoleButton(roleId: number) {
  return request<string[]>({
    url: '/systemManage/getRoleButton',
    method: 'get',
    params: { roleId }
  });
}

/** 更新角色 button 授權（POST updateRoleButton；null｜2222 protectedRevoke） */
export function fetchUpdateRoleButton(data: Api.SystemManage.UpdateRoleButtonReq) {
  return request<null>({
    url: '/systemManage/updateRoleButton',
    method: 'post',
    data
  });
}

/** 讀角色 endpoint 授權（GET getRoleEndpoints；回 (path,method)[] 現況） */
export function fetchGetRoleEndpoints(roleId: number) {
  return request<Api.SystemManage.Endpoint[]>({
    url: '/systemManage/getRoleEndpoints',
    method: 'get',
    params: { roleId }
  });
}

/** 更新角色 endpoint 授權（POST updateRoleEndpoints；null｜2222 protectedRevoke） */
export function fetchUpdateRoleEndpoints(data: Api.SystemManage.UpdateRoleEndpointsReq) {
  return request<null>({
    url: '/systemManage/updateRoleEndpoints',
    method: 'post',
    data
  });
}

/** 讀全 button 候選（GET getAllButtons；sys_menu.buttons 聯集去重、button-auth-modal 候選源） */
export function fetchGetAllButtons() {
  return request<string[]>({
    url: '/systemManage/getAllButtons',
    method: 'get'
  });
}

/** 讀全 endpoint 候選（GET getAllEndpoints；ROUTES const 濾 Policy 級、registry 真源 FR-025、endpoint-auth-modal 候選源） */
export function fetchGetAllEndpoints() {
  return request<Api.SystemManage.Endpoint[]>({
    url: '/systemManage/getAllEndpoints',
    method: 'get'
  });
}

// ── US6 roleHome 讀寫（2）＝2 fetcher（contracts P2 #17~#18）──

/** 讀角色首頁（GET getRoleHome；回 role_home 路由名） */
export function fetchGetRoleHome(roleId: number) {
  return request<string>({
    url: '/systemManage/getRoleHome',
    method: 'get',
    params: { roleId }
  });
}

/** 更新角色首頁（POST updateRoleHome；op-log 同交易；寫端不驗一致性、讀端兜底 FR-039） */
export function fetchUpdateRoleHome(data: Api.SystemManage.UpdateRoleHomeReq) {
  return request<null>({
    url: '/systemManage/updateRoleHome',
    method: 'post',
    data
  });
}

// ── US4 回收桶（2）＝2 fetcher（contracts P3 #19~#20；★消費 U9 後端 getArchivedPolicies／restorePolicy）──

/** 讀歸檔政策列表（GET getArchivedPolicies；roleCode／dimension 雙濾＋分頁；archived_at desc、restorable 隨列下發） */
export function fetchGetArchivedPolicies(params?: Api.SystemManage.ArchivedPolicySearchParams) {
  return request<Api.SystemManage.ArchivedPolicyList>({
    url: '/systemManage/getArchivedPolicies',
    method: 'get',
    params
  });
}

/** 復原歸檔政策（POST restorePolicy；null Applied→reload｜0000 已 live NoOp、歸檔列仍消費｜2222 notRestorable） */
export function fetchRestorePolicy(id: number) {
  return request<null>({
    url: '/systemManage/restorePolicy',
    method: 'post',
    data: { id }
  });
}
