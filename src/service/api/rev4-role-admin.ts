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
