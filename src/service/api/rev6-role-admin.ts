// [rev6-inline BASE-WEB-WRAPPER+ 005-role-menu-crud] 角色管理八端點的請求包裝新檔（§III.1 WRAPPER 軌道；specs/005-role-menu-crud/contracts/wire-role-admin.md）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端以直接路徑 import，同 `rev6-ip-rule.ts`／`rev6-settings.ts`。upstream barrel 的同名
// `fetchGetRoleList`／`fetchGetAllRoles`（`system-manage.ts`）一行不動、與本檔並存——本檔清單回 rev6 wire 型（`Api.RoleAdmin`）。
// 八支皆不加工失敗原因：業務拒絕（`2222` 家族）與 HTTP 層拒絕的提示由 `service/request` 的 onError 鏈轉譯後統一出 toast，
// 呼叫端只判回傳的 `error` 有無。刪除家族需要時由後端於 commit 後自行同步判定面、前端不需追加任何「生效」請求。
// 出處：rev5:src/service/api/rev5-role-admin.ts（角色六支＋首頁讀寫兩支同名、動詞同形；該檔之三維授權與授權回收桶諸支不帶）。
import { request } from '../request';

/** 讀角色清單（`GET /systemManage/getRoleList`；契約 §1）。僅未刪角色、列序由伺服器固定為 id 升冪。 */
export function fetchGetRoleList(params?: Api.RoleAdmin.RoleListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.RoleAdmin.RoleRecord>>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/** 讀角色下拉（`GET /systemManage/getAllRoles`；契約 §2）。僅活性且啟用、id 升冪；項形恰三欄、與 upstream `AllRole` 同形。 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** 新增角色（`POST /systemManage/addRole`；契約 §3）。新角色零授權。 */
export function fetchAddRole(data: Api.RoleAdmin.RoleAddReq) {
  return request<null>({
    url: '/systemManage/addRole',
    method: 'post',
    data
  });
}

/** 更新角色（`POST /systemManage/updateRole`；契約 §4）。部分更新；★body 不得帶 `roleCode`（出現即拒）。 */
export function fetchUpdateRole(data: Api.RoleAdmin.RoleUpdateReq) {
  return request<null>({
    url: '/systemManage/updateRole',
    method: 'post',
    data
  });
}

/** 刪除角色（契約 §5）。★動詞為 DELETE 且 `id` 走 JSON body、不走 query。 */
export function fetchDeleteRole(id: number) {
  const data: Api.RoleAdmin.RoleIdReq = { id };

  return request<null>({
    url: '/systemManage/deleteRole',
    method: 'delete',
    data
  });
}

/** 批次刪除角色（契約 §6）。★動詞為 DELETE 且 `ids` 走 JSON body；任一標的違規即整批拒、零變更。 */
export function fetchBatchDeleteRole(ids: number[]) {
  const data: Api.RoleAdmin.RoleBatchDeleteReq = { ids };

  return request<null>({
    url: '/systemManage/batchDeleteRole',
    method: 'delete',
    data
  });
}

/** 讀角色首頁（`GET /systemManage/getRoleHome`；契約 §7）。`id` 走查詢串。 */
export function fetchGetRoleHome(id: number) {
  const params: Api.RoleAdmin.RoleHomeQuery = { id };

  return request<Api.RoleAdmin.RoleHomeRes>({
    url: '/systemManage/getRoleHome',
    method: 'get',
    params
  });
}

/** 更新角色首頁（`POST /systemManage/updateRoleHome`；契約 §8）。非部分更新：`home` 為 null 或空字串＝清空。 */
export function fetchUpdateRoleHome(data: Api.RoleAdmin.RoleHomeUpdateReq) {
  return request<null>({
    url: '/systemManage/updateRoleHome',
    method: 'post',
    data
  });
}
