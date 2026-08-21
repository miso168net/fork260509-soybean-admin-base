// [rev5-inline BASE-WEB-WRAPPER+ 005-role-menu-crud] menu 管理 service 接線層新檔（§III.1 預設軌道；contracts/wire-menu-admin.md §1~§6）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/manage/menu/）以直接路徑
// import 本模組——沿 rev5-role-admin.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// ★demo 殼之 fetchGetMenuList／fetchGetMenuTree（system-manage.ts、走 apifox mock 形）一行不動：
// menu 頁自本刀改消費本檔；demo 版 fetchGetMenuTree 尚餘 role 頁授權 modal（檔級硬邊界、
// 授權治理刀射程）引用、demo 版 fetchGetMenuList 自此零消費者（凍結檔照留）。
//
// ★八支動詞逐條對齊 contracts：讀端三支 GET（清單／已刪清單帶 params）、寫端
// add/update/restore POST＋JSON body、★deleteMenu／batchDeleteMenu 走 **DELETE 動詞＋
// JSON body**（沿 rev5-role-admin 先例）。
// ★拒因一律不在此處加工：`2222` 十二鍵（notFound／routeNameExists／routeNameImmutable／
// menuTypeImmutable／parentNotFound／cycleDetected／hasChildren／protectedMenu／
// constantParent／nameRequired／routeNameInvalid／restoreConflict）由 service/request
// 共用攔截層轉譯 `backend.biz.menu.*` 後 toast，呼叫端只看 `error` 是否為真（頁內零拒因
// 專屬 UI）。
import { request } from '../request';

/**
 * 讀選單樹清單（★`GET /systemManage/getMenuList/v2`——路徑字面帶 `/v2`、逐字對齊 seed 25；
 * 契約＝contracts §1）
 *
 * 回 `{current, size, total, records}` 分頁形（★分頁以頂層計；records＝頂層列＋全深子樹）。
 * 治理域語意（未刪含停用、不含已刪）；`menuMemo` 欄列表帶。無參呼叫＝後端預設
 * current 1／size 100 一次取全樹（clamp 常數[1,100]＝rev4 as-built、與 hook 無參呼叫形對齊）。
 * rev4: 承 rev4 demo 凍結 fetchGetMenuList 同名同路徑形；rev5 改自持 wrapper（讀端 wire 欄集
 * 依拍板重開：protected／menuMemo／deleted 三欄 demo 型皆無）。
 */
export function fetchGetMenuList(params?: Api.MenuAdmin.ListQuery) {
  return request<Api.MenuAdmin.ListRes>({
    url: '/systemManage/getMenuList/v2',
    method: 'get',
    params
  });
}

/**
 * 讀父選擇器輕量樹（`GET /systemManage/getMenuTree`；契約＝contracts §2）
 *
 * `{id, label, pId, children?}` 治理域全樹（未刪含停用、不含已刪）；menu modal 父選擇器消費。
 * rev4: 承 rev4 demo 凍結 fetchGetMenuTree 同名形（rev4 modal 經 barrel 復用 demo 版；
 * rev5 統一走本 wrapper、型別切 Api.MenuAdmin 命名空間）。
 */
export function fetchGetMenuTree() {
  return request<Api.MenuAdmin.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}

/**
 * 新增選單（`POST /systemManage/addMenu`；契約＝contracts §3）
 *
 * 守門序＝parent 驗證（存在未刪、停用不擋、頂層豁免）→防環→routeName 活性唯一（雙層）→
 * constant 父鏈→形制；成功 `data: null`、★零 casbin 寫（新選單零授權、側欄不現＝已知態③、
 * 授權另走授權治理刀）。
 * rev4: 承 rev4-menu-admin.ts fetchAddMenu 同名形。
 */
export function fetchAddMenu(data: Api.MenuAdmin.AddReq) {
  return request<null>({
    url: '/systemManage/addMenu',
    method: 'post',
    data
  });
}

/**
 * 更新選單（`POST /systemManage/updateMenu`；契約＝contracts §4）
 *
 * ★`routeName`／`menuType` 出現即 `2222 *Immutable`（值不比對）——請求型已結構性無此兩欄、
 * 呼叫端勿散開整列 record 組 body。三態語意（ADR 0023）；buttons 移除且絕版（未刪含停用
 * 聯集）⇒ 絕版歸檔（`menu_button_removed`）＋判定面同步（後端 commit 後 reload、前端零追加
 * 「生效」呼叫）。
 * rev4: 承 rev4-menu-admin.ts fetchUpdateMenu 同名形；rev4 收 routeName／menuType 等值放行
 * ＝差異點不帶回。
 */
export function fetchUpdateMenu(data: Api.MenuAdmin.UpdateReq) {
  return request<null>({
    url: '/systemManage/updateMenu',
    method: 'post',
    data
  });
}

/**
 * 刪除選單（★`DELETE /systemManage/deleteMenu` ＋ JSON body；契約＝contracts §5）
 *
 * 守門固定序 protected→存在未刪子項（不論啟停）；通過＝軟刪＋menu 維跨角色＋獨有碼歸檔
 * （皆 `menu_soft_delete`）＋判定面同步＋稽核（單 txn）。本層只需讓呼叫端刷新清單。
 * rev4: 承 rev4-menu-admin.ts fetchDeleteMenu 同名形（散參 id、body 由本層組）。
 */
export function fetchDeleteMenu(id: number) {
  return request<null>({
    url: '/systemManage/deleteMenu',
    method: 'delete',
    data: { id }
  });
}

/**
 * 批次刪除選單（★`DELETE /systemManage/batchDeleteMenu` ＋ JSON body；契約＝contracts §6）
 *
 * child-first 拓撲序逐項全套守門、任一違規**整批拒**（no-partial、單 txn＋一次收尾同步）；
 * 空陣列＝提前 no-op 成功。
 * rev4: 承 rev4-menu-admin.ts fetchBatchDeleteMenu 同名形。
 */
export function fetchBatchDeleteMenu(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteMenu',
    method: 'delete',
    data: { ids }
  });
}

/**
 * 讀已刪選單清單（`GET /systemManage/getDeletedMenus`；契約＝contracts §7、U12）
 *
 * 回收桶資料源（「顯示已刪除」toggle 開＝清單換打本端點）：僅已刪列、★平面不組樹
 * （`children` 恆缺席）、穩定排序 `deleted_at DESC, id DESC`；列形同 `MenuRecord`
 * （`deleted` 恆 true）、★契約定案**無 restorable 旗標**——復原守門（restoreMenu 重驗）
 * 即唯一權威、清單不預判。分頁 query 與回應形沿 `ListQuery`／`ListRes`（§1 同 clamp 語意）。
 * rev4: 承 rev4-menu-admin.ts fetchGetDeletedMenus 同名同路徑形；rev5 型別切 Api.MenuAdmin
 * 命名空間（rev4 復用 demo MenuList 型＝差異點不帶回）。
 */
export function fetchGetDeletedMenus(params?: Api.MenuAdmin.ListQuery) {
  return request<Api.MenuAdmin.ListRes>({
    url: '/systemManage/getDeletedMenus',
    method: 'get',
    params
  });
}

/**
 * 復原已刪選單（`POST /systemManage/restoreMenu`；契約＝contracts §8、U12）
 *
 * 域內鎖列重驗（已刪存在→同鍵活性衝突 `restoreConflict`→父未刪 `parentNotFound`）→
 * 成對清空軟刪欄＋★原 status 保留；★復原現役列＝`2222 notFound` 業務錯誤（非冪等成功）；
 * ★零授權回灌（歸檔列不動、可見性經授權治理刀重勾）、後端零判定面同步——前端零追加
 * 「生效」呼叫。
 * rev4: 承 rev4-menu-admin.ts fetchRestoreMenu 同名形（散參 id、body 由本層組）。
 */
export function fetchRestoreMenu(id: number) {
  return request<null>({
    url: '/systemManage/restoreMenu',
    method: 'post',
    data: { id }
  });
}
