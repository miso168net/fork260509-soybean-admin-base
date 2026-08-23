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
// ★006-authz-governance 追加授權回收桶兩支（讀端 GET＋params、復原 POST＋JSON body；
// contracts/wire-policy-archive.md）：拒因 `biz.policy.notRestorable` 同樣由攔截層轉譯、此處不加工；
// 型住 `Api.PolicyArchive` 獨立命名空間（rev5-role-admin.d.ts）、消費端＝views/manage/policy-archive/。
// ★006-authz-governance 追加三維授權治理十支（三維讀寫六支＋支撐讀 getAllButtons／getAllEndpoints＋
// roleHome 既判二支；contracts/wire-authz-governance.md＋005 contracts/wire-role-admin.md §7／§8）：
// 讀端 GET＋`params: { id }`、寫端 POST＋JSON body、角色鍵一律 `id`（FR-003；rev4 `roleId` 不帶回）；
// 拒因 `biz.role.{protectedRevoke,protectedGrant,notFound}` 同樣由攔截層轉譯、此處不加工（FR-042）；
// 型住 `Api.RoleAdmin` 追加（R2#16）、消費端＝views/manage/role/modules/ 三顆授權 modal。
// ★`fetchGetAllPages`／`fetchGetMenuTree` 沿 system-manage.ts barrel 既有、本檔**不重建**（防雙源）。
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

/**
 * 讀授權回收桶清單（`GET /systemManage/getArchivedPolicies`；契約＝contracts/wire-policy-archive.md §1）
 *
 * 回 `{current, size, total, records}` 分頁形、穩定排序 `archived_at DESC, id DESC`；`roleCode` 等值濾
 * 來源角色（空字串忽略）、`dimension` 等值（未知值靜默不濾）。每列隨帶後端派生之 `restorable` 旗標
 * （前端據此切停用態、後端為最終防線）。授權＝R_SUPER（seed 政策列、protected）。
 * rev4: 承 rev4-role-admin.ts fetchGetArchivedPolicies 同名形；rev4 型取 `Api.SystemManage.*`＝差異點不帶回。
 */
export function fetchGetArchivedPolicies(params?: Api.PolicyArchive.ArchivedPolicyListQuery) {
  return request<Api.PolicyArchive.ArchivedPolicyListRes>({
    url: '/systemManage/getArchivedPolicies',
    method: 'get',
    params
  });
}

/**
 * 復原歸檔授權（`POST /systemManage/restorePolicy`；契約＝contracts/wire-policy-archive.md §2）
 *
 * 三態：Applied→`data: null`（判定面同步）／NoOp（標的已在現役）→`data: null`、歸檔列仍消費移除／
 * NotRestorable→`2222 biz.policy.notRestorable`（攔截層 toast）。★前端不可區分 Applied／NoOp
 * （沿 rev4、已知態）；成功後**零追加「生效」呼叫**，呼叫端只需刷新清單。
 * rev4: 承 rev4-role-admin.ts fetchRestorePolicy 同名形（散參 id、body 由本層組）。
 */
export function fetchRestorePolicy(id: number) {
  return request<null>({
    url: '/systemManage/restorePolicy',
    method: 'post',
    data: { id }
  });
}

/**
 * 讀角色選單維授權現況（`GET /systemManage/getRoleMenu`；契約＝contracts/wire-authz-governance.md §1）
 *
 * 回 `{id, protected}[]`（治理域反向映射之選單 id、歷史孤兒不反射）；`protected`＝受保護授權、
 * 前端據此預標鎖定（FR-004／FR-041）。角色不存在／已刪→`2222 biz.role.notFound`（攔截層 toast）。
 * 授權＝R_SUPER（seed 政策列、protected）。
 * rev4: 承 rev4-role-admin.ts fetchGetRoleMenu 同名形；rev4 query 鍵 `roleId`、回裸 `number[]`＝差異點不帶回。
 */
export function fetchGetRoleMenu(id: number) {
  return request<Api.RoleAdmin.RoleMenuItem[]>({
    url: '/systemManage/getRoleMenu',
    method: 'get',
    params: { id }
  });
}

/**
 * 全量替換角色選單維授權（`POST /systemManage/updateRoleMenu`；契約＝contracts §2）
 *
 * body `{id, menuIds}`＝期望全集（★含 protected 項須原樣帶回）；候選＝治理域、界外 id 靜默略過；
 * 撤銷集觸及 protected→`2222 biz.role.protectedRevoke` 整批零變更（攔截層 toast、頁內零專屬 UI）。
 * 成功回 `GrantResult<number>`（Applied 即判定面同步、含空 diff）；★成功後前端零追加「生效」呼叫。
 * rev4: 承 rev4-role-admin.ts fetchUpdateRoleMenu 同名形；rev4 回 `null`＝差異點不帶回。
 */
export function fetchUpdateRoleMenu(data: Api.RoleAdmin.UpdateRoleMenuReq) {
  return request<Api.RoleAdmin.RoleMenuGrantRes>({
    url: '/systemManage/updateRoleMenu',
    method: 'post',
    data
  });
}

/**
 * 讀角色按鈕維授權現況（`GET /systemManage/getRoleButton`；契約＝contracts §3）
 *
 * 回 `{code, protected}[]`；語意同 `fetchGetRoleMenu`。
 * rev4: 承 rev4-role-admin.ts fetchGetRoleButton 同名形；rev4 query 鍵 `roleId`、回裸 `string[]`＝差異點不帶回。
 */
export function fetchGetRoleButton(id: number) {
  return request<Api.RoleAdmin.RoleButtonItem[]>({
    url: '/systemManage/getRoleButton',
    method: 'get',
    params: { id }
  });
}

/**
 * 全量替換角色按鈕維授權（`POST /systemManage/updateRoleButton`；契約＝contracts §4）
 *
 * body `{id, buttons}`＝期望全集（按鈕碼）；候選＝治理域 buttons 聯集、界外碼靜默略過；protected 守門同選單維。
 * 成功回 `GrantResult<string>`。
 * rev4: 承 rev4-role-admin.ts fetchUpdateRoleButton 同名形。
 */
export function fetchUpdateRoleButton(data: Api.RoleAdmin.UpdateRoleButtonReq) {
  return request<Api.RoleAdmin.RoleButtonGrantRes>({
    url: '/systemManage/updateRoleButton',
    method: 'post',
    data
  });
}

/**
 * 讀角色端點維授權現況（`GET /systemManage/getRoleEndpoints`；契約＝contracts §5）
 *
 * 回 `{path, method, protected}[]`（以 HTTP 方法白名單辨識端點維列）；語意同 `fetchGetRoleMenu`。
 * rev4: 承 rev4-role-admin.ts fetchGetRoleEndpoints 同名形；rev4 query 鍵 `roleId`、回裸 `Endpoint[]`＝差異點不帶回。
 */
export function fetchGetRoleEndpoints(id: number) {
  return request<Api.RoleAdmin.RoleEndpointItem[]>({
    url: '/systemManage/getRoleEndpoints',
    method: 'get',
    params: { id }
  });
}

/**
 * 全量替換角色端點維授權（`POST /systemManage/updateRoleEndpoints`；契約＝contracts §6）
 *
 * body `{id, endpoints}`＝期望全集（雙鍵）；候選＝路由註冊表受政策管制端點全集、界外靜默略過；
 * 守門固定序＝protected 整批拒（`protectedRevoke`）→★結構性封死（非 R_SUPER 授 protected 端點
 * →`2222 biz.role.protectedGrant`、零變更）。成功回 `GrantResult<Endpoint>`；不入選單序列化域。
 * rev4: 承 rev4-role-admin.ts fetchUpdateRoleEndpoints 同名形；封死為 rev5 專屬新條（ADR 0054）。
 */
export function fetchUpdateRoleEndpoints(data: Api.RoleAdmin.UpdateRoleEndpointsReq) {
  return request<Api.RoleAdmin.RoleEndpointGrantRes>({
    url: '/systemManage/updateRoleEndpoints',
    method: 'post',
    data
  });
}

/**
 * 讀按鈕碼候選全集（`GET /systemManage/getAllButtons`；契約＝contracts §8）
 *
 * 回 `string[]`＝治理域 `sys_menu.buttons` 聯集、去重、首見序（含停用選單碼）；button-auth-modal 候選源。
 * rev4: 承 rev4-role-admin.ts fetchGetAllButtons 同名形。
 */
export function fetchGetAllButtons() {
  return request<string[]>({
    url: '/systemManage/getAllButtons',
    method: 'get'
  });
}

/**
 * 讀端點候選全集（`GET /systemManage/getAllEndpoints`；契約＝contracts §9）
 *
 * 回 `Endpoint[]`＝路由註冊表 `Protection::Policy` 全集（照註冊序、隨註冊表成長）；endpoint-auth-modal
 * 候選源（依 path 群組呈現）。
 * rev4: 承 rev4-role-admin.ts fetchGetAllEndpoints 同名形。
 */
export function fetchGetAllEndpoints() {
  return request<Api.RoleAdmin.Endpoint[]>({
    url: '/systemManage/getAllEndpoints',
    method: 'get'
  });
}

/**
 * 讀角色首頁（`GET /systemManage/getRoleHome`；契約＝005 contracts/wire-role-admin.md §7）
 *
 * 回 `{home: string | null}`（★誠實 null、不摺疊空字串）；候選源＝`fetchGetAllPages`（barrel 既有）。
 * 本刀為 005 既判二支的首個 UI 消費者（FR-043 閉合零消費者窗）。
 * rev4: 承 rev4-role-admin.ts fetchGetRoleHome 同名形；rev4 query 鍵 `roleId`、回裸 `string`＝差異點不帶回（R2#9）。
 */
export function fetchGetRoleHome(id: number) {
  return request<Api.RoleAdmin.RoleHomeRes>({
    url: '/systemManage/getRoleHome',
    method: 'get',
    params: { id }
  });
}

/**
 * 更新角色首頁（`POST /systemManage/updateRoleHome`；契約＝005 contracts §8）
 *
 * body `{id, home}`；`home` 顯式 `null`／缺席／空字串三形同義＝清空；落庫不驗可見樹一致性（讀端兜底）、稽核。
 * rev4: 承 rev4-role-admin.ts fetchUpdateRoleHome 同名形；rev4 body 鍵 `roleId`＝差異點不帶回。
 */
export function fetchUpdateRoleHome(data: Api.RoleAdmin.UpdateRoleHomeReq) {
  return request<null>({
    url: '/systemManage/updateRoleHome',
    method: 'post',
    data
  });
}
