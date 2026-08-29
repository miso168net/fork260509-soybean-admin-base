// [rev5-inline BASE-WEB-WRAPPER+ 007-user-password-admin] user 管理 service 接線層新檔（§III.1 預設軌道；contracts/wire-user-admin.md §1~§10）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/manage/user/）以直接路徑
// import 本模組——沿 rev5-role-admin.ts／rev5-ip-rule.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// ★demo 殼之 fetchGetUserList（system-manage.ts、走 apifox mock 形）一行不動：user 頁自本刀改消費
// 本檔，demo 版自此僅剩 demo 面引用（該檔去留＝B-018，不在本刀射程）。
//
// ★十支動詞逐條對齊 contracts：讀端兩支 GET（各自帶 params）、寫端 add／update／restore／kick／
// resetUserPassword／updateUserSessionPolicy 走 POST＋JSON body、★deleteUser／batchDeleteUser 走
// **DELETE 動詞＋JSON body**（沿 rev5-role-admin deleteRole／rev5-ip-rule deleteIpRule 先例；
// 動詞不符→4040＝ADR 0031）。使用者鍵一律 `id`（rev4 之 `userId` 不帶回）。
// ★拒因一律不在此處加工：`2222` 家族（notFound／userNameExists／userNameInvalid／userNameImmutable／
// userEmailExists／userEmailInvalid／seededProtected／superCannotDisable／cannotDeleteSelf／
// cannotKickSelf／cannotEditSelfRoleOrStatus／roleNotFound／cannotResetSelfPassword／
// sessionPolicyInvalid／攜參之 passwordPolicy／pwdSetTooFrequent）與 `5003`（no-escalation）由
// service/request 共用攔截層轉譯 `backend.biz.user.*` 後 toast，呼叫端只看 `error` 是否為真
// （頁內零拒因專屬 UI＝FR-039）。
// ★契約整套落齊、勿因暫無呼叫端而剪掉：本刀 U6 as-shipped 時 UI 只消費前七支，後三支（kick／
// resetUserPassword／updateUserSessionPolicy）的端點自 U3～U5 起即在線、UI 消費者當時尚缺。
// ★as-built（本刀 U7 接線後）：契約十支**已全數有 UI 消費者**——kick／resetUserPassword 在
// views/manage/user/index.vue、updateUserSessionPolicy 在 modules/user-operate-drawer.vue；
// 三支皆為上線路徑，非無人呼叫的預留件。當初不剪是對的：剪掉它們，本刀就得回頭再改這支
// WRAPPER 檔（同 rev5-role-admin.ts 之 fetchGetAllRoles 既有先例）。
// ★★本檔自本刀 U7 起共 **11 支**：契約 §1~§10 之外，末尾另有 `fetchUnlockLogin`——它打的是 004 建的
// **既有**端點 `POST /systemManage/unlockLogin`（契約末節「既有 …（004；本刀接 UI＋帳號維套規則）」）。
// 端點雖非本刀新建，其前端 wrapper 與請求型在本刀之前全樹零命中，且該端點同屬 `/systemManage/*`、
// 同為 `Protection::Policy` super-only、UI 掛載點同為 user 管理頁 ⇒ 家在本檔（★不入 rev5-user-center.*：
// 那支的兩支端點皆 `Protection::Authed`、族不同）。
import { request } from '../request';

/**
 * 讀現役使用者清單（`GET /systemManage/getUserList`；契約＝contracts §1）
 *
 * 回 `{current, size, total, records}` 分頁形、穩定排序 `id ASC`；`userName`／`nickName` 模糊、
 * `status`／`userGender` 等值（值域外沉默＝不濾）。★域＝未軟刪（含 status 停用者）、已刪不含。
 * 授權＝R_SUPER＋R_ADMIN（seed 政策列）。
 * rev4: 承 rev4-user-admin.ts 同名形；rev4 型取 `Api.SystemManage.*`＝差異點不帶回（R2#13）。
 */
export function fetchGetUserList(params?: Api.UserAdmin.ListQuery) {
  return request<Api.UserAdmin.ListRes>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/**
 * 讀回收桶（已軟刪）使用者清單（`GET /systemManage/getDeletedUsers`；契約＝contracts §2）
 *
 * 只收分頁參（無過濾欄）；`deleted_at DESC, id DESC`；★每列 `roles` 恆 `[]`——刪除交易已硬刪
 * 全部指派列，復原零回灌（故回收桶的角色欄一定是空的、不是「還沒載到」）。
 * rev4: 承 rev4-user-admin.ts fetchGetDeletedUsers 同名形。
 */
export function fetchGetDeletedUsers(params?: Api.UserAdmin.DeletedListQuery) {
  return request<Api.UserAdmin.ListRes>({
    url: '/systemManage/getDeletedUsers',
    method: 'get',
    params
  });
}

/**
 * 新增使用者（`POST /systemManage/addUser`；契約＝contracts §3）
 *
 * 守門序＝形制→現役唯一（帳號名／信箱，含 23505 兜底）→信箱格式→`roleIds` 存在且未軟刪→
 * no-escalation（`N ⊆ A`、違反回 5003）→密碼政策（攜參）→冷卻；通過即單交易 INSERT＋指派＋
 * 密碼經手時戳＋稽核 `add`。成功回 `{id}`。
 * rev4: 承 rev4-user-admin.ts fetchAddUser 同名形；rev4 以 `userRoles`（角色 code）指派＝rev5 差異點
 * ——rev5 收 `roleIds`（角色 id、R2#25 期望全集拍板）。
 */
export function fetchAddUser(data: Api.UserAdmin.AddReq) {
  return request<Api.UserAdmin.AddRes>({
    url: '/systemManage/addUser',
    method: 'post',
    data
  });
}

/**
 * 更新使用者（`POST /systemManage/updateUser`；契約＝contracts §4）
 *
 * ★`userName` 出現即 `2222 userNameImmutable`（值不比對）——請求型已結構性無此欄、呼叫端勿散開
 * 整列 record 組 body。三態語意（缺席不動／null 清空／有值設值）；全缺席或無變更＝no-op 0000
 * 零寫入零稽核。守門序＝notFound→seed 保護→self 五不→no-escalation（`T ⊆ A ∧ N ⊆ A`）→
 * 唯一／格式→值 diff。副作用：停用即撤該帳號全部 active 票、角色集實際變更即重載判定面。
 * rev4: 承 rev4-user-admin.ts fetchUpdateUser 同名形；rev4 收 `userName` 等值放行＝差異點不帶回（R2#2）。
 */
export function fetchUpdateUser(data: Api.UserAdmin.UpdateReq) {
  return request<null>({
    url: '/systemManage/updateUser',
    method: 'post',
    data
  });
}

/**
 * 刪除使用者（★`DELETE /systemManage/deleteUser` ＋ JSON body；契約＝contracts §5）
 *
 * 守門序＝notFound→seed 保護（id 1／2／3）→self（`cannotDeleteSelf`）→no-escalation；通過即
 * 軟刪＋硬刪指派＋撤全 active 票（事件 `user_deleted`）＋稽核 `delete`＋重載判定面（單 txn）。
 * ★成功後前端零追加「生效」呼叫，本層只需讓呼叫端刷新清單。
 * rev4: 承 rev4-user-admin.ts fetchDeleteUser 同名形（散參 id、body 由本層組）。
 */
export function fetchDeleteUser(id: number) {
  return request<null>({
    url: '/systemManage/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/**
 * 批次刪除使用者（★`DELETE /systemManage/batchDeleteUser` ＋ JSON body；契約＝contracts §6）
 *
 * ids 去重後依 id 升序逐一取鎖、逐筆全套守門，任一違規**整批 rollback**（no-partial）、拒因＝
 * 該筆之純 key（不帶 id）；空陣列＝提前 no-op 成功。
 * rev4: 承 rev4-user-admin.ts fetchBatchDeleteUser 同名形。
 */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteUser',
    method: 'delete',
    data: { ids }
  });
}

/**
 * 復原已刪使用者（`POST /systemManage/restoreUser`；契約＝contracts §7）
 *
 * 鎖已刪列（查無→`notFound`）→no-escalation→同帳號名活性重驗（`userNameExists`）→同信箱活性
 * 重驗（`userEmailExists`）→成對清軟刪標記；★**零回灌**＝復原後該帳號零角色、須重新指派，
 * `status` 保留刪除前原值。稽核 `restore`。
 * rev4: 承 rev4-user-admin.ts fetchRestoreUser 同名形。
 */
export function fetchRestoreUser(id: number) {
  return request<null>({
    url: '/systemManage/restoreUser',
    method: 'post',
    data: { id }
  });
}

/**
 * 踢除使用者全部登入（`POST /systemManage/kickUser`；契約＝contracts §8）
 *
 * 守門序＝notFound→self（`cannotKickSelf`）→no-escalation；撤全 active 票（rotated 不動）、
 * 事件 `admin_kick`、denylist `admin_kick`（對方下一次請求得 7777）、稽核 `kick`。停用帳號可踢。
 * 成功回 `{revoked}`＝本次撤銷數。★UI 消費者＝views/manage/user/index.vue 之 handleKick
 * （列上操作下拉；本刀 U7 接線）。
 * rev4: 承 rev4-user-admin.ts fetchKickUser 同名形。
 */
export function fetchKickUser(id: number) {
  return request<Api.UserAdmin.KickRes>({
    url: '/systemManage/kickUser',
    method: 'post',
    data: { id }
  });
}

/**
 * 重設他人密碼（`POST /systemManage/resetUserPassword`；契約＝contracts §9）
 *
 * 守門序＝notFound→self（`cannotResetSelfPassword`＝請走個人中心）→no-escalation→密碼政策
 * （攜參 `{violations}`）→冷卻（攜參 `{remainingSeconds}`）；通過即改密＋密碼經手時戳＋撤全
 * active 票（事件 `password_reset`）＋稽核 `reset_password`。★後端不回傳密碼。
 * ★UI 消費者＝views/manage/user/index.vue 之 handleResetPwd（本刀 U7 接線）。
 * rev4: 承 rev4-user-admin.ts fetchResetUserPassword 同名形。
 */
export function fetchResetUserPassword(data: Api.UserAdmin.ResetPasswordReq) {
  return request<null>({
    url: '/systemManage/resetUserPassword',
    method: 'post',
    data
  });
}

/**
 * 更新使用者會話政策（`POST /systemManage/updateUserSessionPolicy`；契約＝contracts §10）
 *
 * 三值收斂（值域外→`sessionPolicyInvalid`）；守門序＝notFound→no-escalation→與現值相同即 no-op。
 * ★改 `single` **不**即時踢除（下次登入才生效）；本端點為 protected（super-only、結構性）。
 * ★UI 消費者＝modules/user-operate-drawer.vue 之 handleSubmit 內的第二呼叫（抽屜的會話政策欄；
 * 本刀 U7 接線）。
 * rev4: 承 rev4-user-admin.ts fetchUpdateUserSessionPolicy 同名形。
 */
export function fetchUpdateUserSessionPolicy(data: Api.UserAdmin.UpdateSessionPolicyReq) {
  return request<null>({
    url: '/systemManage/updateUserSessionPolicy',
    method: 'post',
    data
  });
}

/**
 * 手動解鎖登入（既有 `POST /systemManage/unlockLogin`；004 建、本刀 U7 接 UI——契約末節）
 *
 * 雙維、`dimension` **必給**（缺席→後端落空字串→維度不明→`2222`；rev5 拍板無預設維度、R2#17）：
 * 帳號維帶 `userName`（標的存在時套 no-escalation `T ⊆ A`、違反 5003）、來源維帶 `target`
 * （位址字面；該維**不套**包含規則——標的是計數桶不是使用者）。
 * ★**解鎖冪等**：對未被鎖定（甚至不存在）的標的解鎖照回 `0000`——後端刻意不以異碼洩漏標的狀態，
 * 否則本端點就成了「這個帳號在不在、有沒有被鎖」的枚舉面。⇒ 前端的成功 toast 語意是
 * 「已解除鎖定」而非「原本有鎖」，呼叫端勿據回應推斷標的先前狀態。
 * 拒因 `2222 biz.throttle.invalidUnlockTarget`（維度不明／該維標的缺席或不可解析）與 `5003`
 * 由共用攔截層轉譯後 toast，本層零加工。
 * rev4: 承 rev4-user-admin.ts fetchUnlockLogin 同名形；rev4 型取 `Api.SystemManage.UnlockLoginReq`
 * ＝rev5 獨立命名空間差異點不帶回（R2#13）。
 */
export function fetchUnlockLogin(data: Api.UserAdmin.UnlockReq) {
  return request<null>({
    url: '/systemManage/unlockLogin',
    method: 'post',
    data
  });
}
