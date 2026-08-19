// [rev5-inline BASE-WEB-WRAPPER+ 005-role-menu-crud] role 管理 service 接線層新檔（§III.1 預設軌道；contracts/wire-role-admin.md §1~§6）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/manage/role/）以直接路徑
// import 本模組——沿 rev5-ip-rule.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// ★demo 殼之 fetchGetRoleList／fetchGetAllRoles（system-manage.ts、走 apifox mock 形）一行不動：
// role 頁自本刀改消費本檔，demo 版自此僅剩 user／menu demo 頁引用（該兩頁的接真歸各自的刀）。
//
// ★六支動詞逐條對齊 contracts：讀端兩支 GET（清單帶 params）、寫端 add/update POST＋JSON body、
// ★deleteRole／batchDeleteRole 走 **DELETE 動詞＋JSON body**（沿 rev5-ip-rule deleteIpRule 先例）。
// ★拒因一律不在此處加工：`2222` 九鍵（codeInvalid／codeExists／codeImmutable／notFound／
// seededProtected／inUse／cannotDeleteSelfRole／cannotDisableSelfRole／superCannotDisable）由
// service/request 共用攔截層轉譯 `backend.biz.role.*` 後 toast，呼叫端只看 `error` 是否為真
// （頁內零拒因專屬 UI）。
import { request } from '../request';

/**
 * 讀角色清單（`GET /systemManage/getRoleList`；契約＝contracts §1）
 *
 * 回 `{current, size, total, records}` 分頁形、穩定排序 `id ASC`；`roleName`／`roleCode` 模糊、
 * `status` 等值。★本端點帶 `roleMemo`（R_ADMIN 可見）。授權＝R_SUPER＋R_ADMIN（seed 政策列）。
 * rev4: 承 rev4 demo 凍結 fetchGetRoleList 同名形；rev5 改自持 wrapper（讀端 wire 欄名已依拍板重開）。
 */
export function fetchGetRoleList(params?: Api.RoleAdmin.ListQuery) {
  return request<Api.RoleAdmin.ListRes>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * 讀全量活性啟用角色（`GET /systemManage/getAllRoles`；契約＝contracts §2）
 *
 * 恰三欄白名單（id／roleCode／roleName——★無 memo）；`id ASC`。授權＝三角色皆可。
 * ★本刀 as-shipped **零 UI 消費者**（契約 §2 已知態；user 頁角色指派的消費歸刀 B）——
 * fetcher 隨六端點契約整套落齊，勿因暫無呼叫端而剪掉（剪了刀 B 就得回頭改本 WRAPPER 檔）。
 * rev4: 承 rev4 demo 凍結 fetchGetAllRoles 同名形。
 */
export function fetchGetAllRoles() {
  return request<Api.RoleAdmin.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/**
 * 新增角色（`POST /systemManage/addRole`；契約＝contracts §3）
 *
 * 守門序＝code 形制→活性唯一（先驗＋23505 兜底同鍵）；`status` 缺席（或 null）＝預設啟用；
 * 成功 `data: null`、★新角色零授權（授權另走兩步流、歸授權治理刀）。
 * rev4: 承 rev4-role-admin.ts fetchAddRole 同名形。
 */
export function fetchAddRole(data: Api.RoleAdmin.AddReq) {
  return request<null>({
    url: '/systemManage/addRole',
    method: 'post',
    data
  });
}

/**
 * 更新角色（`POST /systemManage/updateRole`；契約＝contracts §4）
 *
 * ★`roleCode` 出現即 `2222 codeImmutable`（值不比對）——請求型已結構性無此欄、呼叫端勿散開
 * 整列 record 組 body。三態語意（ADR 0023）；全 None 提前 no-op；停用過雙護欄
 * （自身所屬拒 cannotDisableSelfRole／R_SUPER 恆禁 superCannotDisable）。
 * rev4: 承 rev4-role-admin.ts fetchUpdateRole 同名形；rev4 收 roleCode 等值放行＝差異點不帶回。
 */
export function fetchUpdateRole(data: Api.RoleAdmin.UpdateReq) {
  return request<null>({
    url: '/systemManage/updateRole',
    method: 'post',
    data
  });
}

/**
 * 刪除角色（★`DELETE /systemManage/deleteRole` ＋ JSON body；契約＝contracts §5）
 *
 * 三層守門固定序 seeded→in-use→self-role；通過＝軟刪＋全三維歸檔＋稽核（單 txn）。
 * ★成功後**前端零追加「生效」呼叫**（免 reload＝ADR 0050 §2），本層只需讓呼叫端刷新清單。
 * rev4: 承 rev4-role-admin.ts fetchDeleteRole 同名形（散參 id、body 由本層組）。
 */
export function fetchDeleteRole(id: number) {
  return request<null>({
    url: '/systemManage/deleteRole',
    method: 'delete',
    data: { id }
  });
}

/**
 * 批次刪除角色（★`DELETE /systemManage/batchDeleteRole` ＋ JSON body；契約＝contracts §6）
 *
 * id 升冪逐項全套守門、任一違規**整批拒**（no-partial、單 txn）；空陣列＝提前 no-op 成功。
 * rev4: 承 rev4-role-admin.ts fetchBatchDeleteRole 同名形。
 */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteRole',
    method: 'delete',
    data: { ids }
  });
}
