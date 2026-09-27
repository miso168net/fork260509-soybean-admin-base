// [rev6-inline BASE-WEB-WRAPPER+ 005-role-menu-crud] 選單管理端點的請求包裝新檔（§III.1 WRAPPER 軌道；specs/005-role-menu-crud/contracts/wire-menu-admin.md）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端以直接路徑 import，同 `rev6-ip-rule.ts`／`rev6-settings.ts`。頁面下拉 getAllPages 不在本檔：
// 走 upstream barrel 既有的 `fetchGetAllPages`（回 `string[]`）。upstream barrel 的同名 `fetchGetMenuList`／`fetchGetMenuTree`
// （`system-manage.ts`）一行不動、與本檔並存——本檔回 rev6 wire 型（`Api.MenuAdmin`）。
// 八支皆不加工失敗原因：業務拒絕（`2222` 家族）與 HTTP 層拒絕的提示由 `service/request` 的 onError 鏈轉譯後統一出 toast，
// 呼叫端只判回傳的 `error` 有無。更新與刪除家族需要時由後端於 commit 後自行同步判定面、前端不需追加任何「生效」請求。
// 出處：rev5:src/service/api/rev5-menu-admin.ts（八支同名、動詞同形）。rev6 差異：治理清單 `size` 未帶改回全部頂層（rev5 取 100）。
import { request } from '../request';

/**
 * 讀治理清單（★`GET /systemManage/getMenuList/v2`——路徑字面帶 `/v2`；契約 §1）。治理域＝未刪（含停用）；`records`＝頂層
 * 切片、各帶全深 `children`。`size` 未帶＝回全部頂層及其全深子樹（回應 `current`＝1、`size`＝實得頂層數）。
 */
export function fetchGetMenuList(params?: Api.MenuAdmin.MenuListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.MenuAdmin.MenuRecord>>({
    url: '/systemManage/getMenuList/v2',
    method: 'get',
    params
  });
}

/** 讀治理域輕量樹（`GET /systemManage/getMenuTree`；契約 §2）。節點形與 upstream `MenuTree` 同形；同層序同治理清單。 */
export function fetchGetMenuTree() {
  return request<Api.MenuAdmin.MenuTreeRecord[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}

/** 新增選單（`POST /systemManage/addMenu`；契約 §4）。新選單零授權。 */
export function fetchAddMenu(data: Api.MenuAdmin.MenuAddReq) {
  return request<null>({
    url: '/systemManage/addMenu',
    method: 'post',
    data
  });
}

/** 更新選單（`POST /systemManage/updateMenu`；契約 §5）。部分更新；★body 不得帶 `routeName`／`menuType`（出現即拒）。 */
export function fetchUpdateMenu(data: Api.MenuAdmin.MenuUpdateReq) {
  return request<null>({
    url: '/systemManage/updateMenu',
    method: 'post',
    data
  });
}

/** 軟刪選單（契約 §6）。★動詞為 DELETE 且 `id` 走 JSON body、不走 query。 */
export function fetchDeleteMenu(id: number) {
  const data: Api.MenuAdmin.MenuIdReq = { id };

  return request<null>({
    url: '/systemManage/deleteMenu',
    method: 'delete',
    data
  });
}

/** 批次軟刪選單（契約 §7）。★動詞為 DELETE 且 `ids` 走 JSON body；任一標的違規即整批拒、零變更。 */
export function fetchBatchDeleteMenu(ids: number[]) {
  const data: Api.MenuAdmin.MenuBatchDeleteReq = { ids };

  return request<null>({
    url: '/systemManage/batchDeleteMenu',
    method: 'delete',
    data
  });
}

/** 讀已刪清單（`GET /systemManage/getDeletedMenus`；契約 §8）。平面（`children` 恆缺席）、通則分頁、列序由伺服器固定為刪除時間降冪。 */
export function fetchGetDeletedMenus(params?: Api.MenuAdmin.MenuListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.MenuAdmin.MenuRecord>>({
    url: '/systemManage/getDeletedMenus',
    method: 'get',
    params
  });
}

/** 自已刪清單復原選單（`POST /systemManage/restoreMenu`；契約 §9）。原啟停狀態保留、不回灌任何授權。 */
export function fetchRestoreMenu(id: number) {
  const data: Api.MenuAdmin.MenuIdReq = { id };

  return request<null>({
    url: '/systemManage/restoreMenu',
    method: 'post',
    data
  });
}
