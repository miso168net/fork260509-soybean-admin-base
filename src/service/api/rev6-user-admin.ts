// [rev6-inline BASE-WEB-WRAPPER+ 007-user-password-admin] 使用者管理十端點＋既有 unlockLogin 的請求包裝新檔（§III.1 WRAPPER 軌道；specs/007-user-password-admin/contracts/wire-user-admin.md）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端以直接路徑 import，同 `rev6-role-admin.ts`／`rev6-menu-admin.ts`。upstream barrel 的同 URL
// `fetchGetUserList`（`system-manage.ts`、回 `Api.SystemManage.UserList`）一行不動、與本檔並存——本檔回 rev6 wire 型
// （`Api.UserAdmin`），兩型之欄差由偏離帳機器釘住（ADR-00083）。
// 十一支皆不加工失敗原因：業務拒絕（`2222` 家族，含攜明細之 `biz.user.passwordPolicy`／`biz.user.pwdSetTooFrequent`）、包含規則之
// `5003` 與 HTTP 層拒絕，一律由 `service/request` 的 onError 鏈轉譯後統一出 toast，呼叫端只判回傳的 `error` 有無。
// `fetchUnlockLogin` 打 004 刀既有端點：同屬 `/systemManage/*`、同為政策保護、畫面入口落使用者頁與 IP 規則頁，故家在本檔；
// `rev6-user-center.ts` 那兩支是登入即可用之自助端點、族不同。
// 出處：rev5:src/service/api/rev5-user-admin.ts（十一支同名、動詞同形）。rev6 差異：請求體一律以具名型組（`{id}`／`{ids}` 亦然）；
// addUser 回 `null`（rev5 回新 id）；兩支清單之 query 型分立（現役六篩選欄、回收桶只收分頁兩欄）。
import { request } from '../request';

/**
 * 讀現役使用者清單（`GET /systemManage/getUserList`；契約端點 1）。域＝未軟刪（含停用）、列序由伺服器固定為 id 升冪；六篩選欄
 * 彼此 AND、不收排序參數。
 */
export function fetchGetUserList(params?: Api.UserAdmin.UserListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.UserAdmin.UserRecord>>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** 讀回收桶（`GET /systemManage/getDeletedUsers`；契約端點 2）。只收分頁兩欄；列序為刪除時間降冪、每列 `roles` 恆空。 */
export function fetchGetDeletedUsers(params?: Api.UserAdmin.DeletedUserListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.UserAdmin.UserRecord>>({
    url: '/systemManage/getDeletedUsers',
    method: 'get',
    params
  });
}

/** 新增使用者（`POST /systemManage/addUser`；契約端點 3）。成功回 `null`（不回新 id）、前端重拉清單。 */
export function fetchAddUser(data: Api.UserAdmin.AddReq) {
  return request<null>({
    url: '/systemManage/addUser',
    method: 'post',
    data
  });
}

/**
 * 更新使用者（`POST /systemManage/updateUser`；契約端點 4）。部分更新；★body 不得帶 `userName`（出現即拒），且逐欄顯式構造、
 * 不散開整列 record。
 */
export function fetchUpdateUser(data: Api.UserAdmin.UpdateReq) {
  return request<null>({
    url: '/systemManage/updateUser',
    method: 'post',
    data
  });
}

/** 軟刪使用者（契約端點 5）。★動詞為 DELETE 且 `id` 走 JSON body、不走 query。 */
export function fetchDeleteUser(id: number) {
  const data: Api.UserAdmin.UserIdReq = { id };

  return request<null>({
    url: '/systemManage/deleteUser',
    method: 'delete',
    data
  });
}

/** 批次軟刪使用者（契約端點 6）。★動詞為 DELETE 且 `ids` 走 JSON body；任一標的違規即整批拒、零變更。 */
export function fetchBatchDeleteUser(ids: number[]) {
  const data: Api.UserAdmin.UserBatchDeleteReq = { ids };

  return request<null>({
    url: '/systemManage/batchDeleteUser',
    method: 'delete',
    data
  });
}

/** 自回收桶復原使用者（`POST /systemManage/restoreUser`；契約端點 7）。狀態保留、角色零回灌（復原後須重新指派）。 */
export function fetchRestoreUser(id: number) {
  const data: Api.UserAdmin.UserIdReq = { id };

  return request<null>({
    url: '/systemManage/restoreUser',
    method: 'post',
    data
  });
}

/** 踢除使用者全部登入（`POST /systemManage/kickUser`；契約端點 8）。回本次實際撤下之有效票數。 */
export function fetchKickUser(id: number) {
  const data: Api.UserAdmin.UserIdReq = { id };

  return request<Api.UserAdmin.KickRes>({
    url: '/systemManage/kickUser',
    method: 'post',
    data
  });
}

/** 重設他人密碼（`POST /systemManage/resetUserPassword`；契約端點 9）。後端不回傳密碼；本人須走個人中心改密。 */
export function fetchResetUserPassword(data: Api.UserAdmin.ResetPasswordReq) {
  return request<null>({
    url: '/systemManage/resetUserPassword',
    method: 'post',
    data
  });
}

/** 更新使用者會話政策（`POST /systemManage/updateUserSessionPolicy`；契約端點 10）。改為 `single` 於下次登入生效。 */
export function fetchUpdateUserSessionPolicy(data: Api.UserAdmin.UpdateSessionPolicyReq) {
  return request<null>({
    url: '/systemManage/updateUserSessionPolicy',
    method: 'post',
    data
  });
}

/**
 * 手動解鎖登入（既有 `POST /systemManage/unlockLogin`；契約端點 11）。帳號維帶 `userName`、來源維帶 `target`；對未鎖或不存在之
 * 標的照回成功——成功只表「已解除鎖定」、不表標的原本有鎖。
 */
export function fetchUnlockLogin(data: Api.UserAdmin.UnlockReq) {
  return request<null>({
    url: '/systemManage/unlockLogin',
    method: 'post',
    data
  });
}
