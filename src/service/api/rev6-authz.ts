// [rev6-inline BASE-WEB-WRAPPER+ 006-authz-governance] 授權治理十端點的請求包裝新檔（§III.1 WRAPPER 軌道；specs/006-authz-governance/contracts/wire-authz-governance.md＝下稱授權契約、wire-policy-archive.md＝下稱回收桶契約）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端（角色頁的三顆授權彈窗、授權回收桶頁）以直接路徑 import，同 `rev6-role-admin.ts`。
// 型別一律取 `Api.Authz`（`typings/api/rev6-authz.d.ts`）；query 與 body 先以具名型組好再交出，型別檢查即能擋下錯鍵名。
// 十支皆不加工失敗原因：業務拒絕（`2222` 家族）與 HTTP 層拒絕的提示由 `service/request` 的 onError 鏈轉譯後統一出 toast，
// 呼叫端只判回傳的 `error` 有無。寫端回成功時判定面同步已由後端於 commit 後跑過（同步成敗不影響回應），前端不需追加任何「生效」請求。
// 出處：rev5:src/service/api/rev5-role-admin.ts（三維讀寫、兩支候選讀與回收桶兩支，同名、動詞同形）。rev6 差異：十支自成
// 一檔；讀端的 `{ id }` 與復原 body 改以具名型組；清單回應直接實例化既有分頁泛型、不另立別名。
import { request } from '../request';

/** 讀角色的選單維授權現況（`GET /systemManage/getRoleMenu`；授權契約 §1）。`id` 走查詢串；每項帶受保護旗標。 */
export function fetchGetRoleMenu(id: number) {
  const params: Api.Authz.RoleIdQuery = { id };

  return request<Api.Authz.RoleMenuItem[]>({
    url: '/systemManage/getRoleMenu',
    method: 'get',
    params
  });
}

/** 全量替換角色的選單維授權（`POST /systemManage/updateRoleMenu`；授權契約 §2）。期望全集須原樣帶回受保護項。 */
export function fetchUpdateRoleMenu(data: Api.Authz.UpdateRoleMenuReq) {
  return request<Api.Authz.RoleMenuGrantRes>({
    url: '/systemManage/updateRoleMenu',
    method: 'post',
    data
  });
}

/** 讀角色的按鈕維授權現況（`GET /systemManage/getRoleButton`；授權契約 §3）。`id` 走查詢串；每項帶受保護旗標。 */
export function fetchGetRoleButton(id: number) {
  const params: Api.Authz.RoleIdQuery = { id };

  return request<Api.Authz.RoleButtonItem[]>({
    url: '/systemManage/getRoleButton',
    method: 'get',
    params
  });
}

/** 全量替換角色的按鈕維授權（`POST /systemManage/updateRoleButton`；授權契約 §4）。期望全集＝按鈕碼。 */
export function fetchUpdateRoleButton(data: Api.Authz.UpdateRoleButtonReq) {
  return request<Api.Authz.RoleButtonGrantRes>({
    url: '/systemManage/updateRoleButton',
    method: 'post',
    data
  });
}

/** 讀角色的端點維授權現況（`GET /systemManage/getRoleEndpoints`；授權契約 §5）。`id` 走查詢串；每項帶受保護旗標。 */
export function fetchGetRoleEndpoints(id: number) {
  const params: Api.Authz.RoleIdQuery = { id };

  return request<Api.Authz.RoleEndpointItem[]>({
    url: '/systemManage/getRoleEndpoints',
    method: 'get',
    params
  });
}

/**
 * 全量替換角色的端點維授權（`POST /systemManage/updateRoleEndpoints`；授權契約 §6）。期望全集＝（路徑, 方法）；替 R_SUPER
 * 以外的角色授予受保護端點即整批拒、零變更。
 */
export function fetchUpdateRoleEndpoints(data: Api.Authz.UpdateRoleEndpointsReq) {
  return request<Api.Authz.RoleEndpointGrantRes>({
    url: '/systemManage/updateRoleEndpoints',
    method: 'post',
    data
  });
}

/** 讀按鈕碼候選（`GET /systemManage/getAllButtons`；授權契約 §7）。治理域各選單按鈕碼的聯集、首見序去重。 */
export function fetchGetAllButtons() {
  return request<string[]>({
    url: '/systemManage/getAllButtons',
    method: 'get'
  });
}

/** 讀端點候選（`GET /systemManage/getAllEndpoints`；授權契約 §8）。受政策管制的端點全集、照路由註冊序。 */
export function fetchGetAllEndpoints() {
  return request<Api.Authz.Endpoint[]>({
    url: '/systemManage/getAllEndpoints',
    method: 'get'
  });
}

/**
 * 讀授權回收桶清單（`GET /systemManage/getArchivedPolicies`；回收桶契約 §1）。列序由伺服端固定（歸檔時間新到舊、同刻者
 * id 大者先）；每列的 `restorable` 只供切換復原鈕停用態。
 */
export function fetchGetArchivedPolicies(params?: Api.Authz.ArchivedPolicyListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.Authz.ArchivedPolicy>>({
    url: '/systemManage/getArchivedPolicies',
    method: 'get',
    params
  });
}

/**
 * 復原一筆歸檔授權（`POST /systemManage/restorePolicy`；回收桶契約 §2）。`id` 走 JSON body；標的已在現役時同樣回成功
 * （只消費該歸檔列），前端不區分兩者、成功後重取清單即可。
 */
export function fetchRestorePolicy(id: number) {
  const data: Api.Authz.RestorePolicyReq = { id };

  return request<null>({
    url: '/systemManage/restorePolicy',
    method: 'post',
    data
  });
}
