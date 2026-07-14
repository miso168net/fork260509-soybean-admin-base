// BASE-WEB-WRAPPER (011-user-admin)：新增 service 檔，不改凍結 system-manage.ts
// （★getUserList 複用凍結 fetchGetUserList 不重建、getAllRoles 沿 barrel 復用＝009 已真通）。
// 9 新端點 fetcher（delete 類★DELETE 動詞、動詞逐條對齊 contracts／casbin seed act）
// ＋unlockLogin 薄 wrapper（007 既有端點復用；007 僅落後端、前端 fetcher 隨解鎖 modal 補建——grep 全 src 無既有 wrapper）；
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

// ── US1 使用者 CRUD 寫端（4）＝contracts #2~#5（getUserList #1 複用凍結 fetchGetUserList）──

/** 新增使用者（POST addUser；0000｜2222 userNameInvalid／passwordPolicy〔data 帶違規清單〕／userNameExists／roleNotFound） */
export function fetchAddUser(data: Api.SystemManage.AddUserReq) {
  return request<null>({
    url: '/systemManage/addUser',
    method: 'post',
    data
  });
}

/** 更新使用者（POST updateUser；userName 不可變、diff 全等 no-op；2222 userNameImmutable／superCannotDisable／cannotDisableSelf／superRoleProtected／cannotChangeSelfRoles／roleNotFound／userNotFound） */
export function fetchUpdateUser(data: Api.SystemManage.UpdateUserReq) {
  return request<null>({
    url: '/systemManage/updateUser',
    method: 'post',
    data
  });
}

/** 刪除使用者（★DELETE deleteUser；軟刪＋同交易硬刪指派＋撤 session；2222 seededProtected／cannotDeleteSelf／userNotFound） */
export function fetchDeleteUser(id: number) {
  return request<null>({
    url: '/systemManage/deleteUser',
    method: 'delete',
    data: { id }
  });
}

/** 批次刪除使用者（★DELETE batchDeleteUser；逐項驗證 fail-fast、一項違規整批拒零變更〔含已刪 id〕） */
export function fetchBatchDeleteUser(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteUser',
    method: 'delete',
    data: { ids }
  });
}

// ── US2/US3 維運動作（2）＝contracts #6~#7 ──

/** 踢除使用者（POST kickUser；全撤 session〔帳號仍活、可重登〕、7777 阻斷體驗；2222 cannotKickSelf／userNotFound） */
export function fetchKickUser(id: number) {
  return request<null>({
    url: '/systemManage/kickUser',
    method: 'post',
    data: { id }
  });
}

/** 重設使用者密碼（POST resetUserPassword；改密撤 session〔operator 自重設保留當前 session〕、★不解登入節流鎖定；2222 passwordPolicy〔data 帶違規清單〕／userNotFound） */
export function fetchResetUserPassword(data: Api.SystemManage.ResetUserPasswordReq) {
  return request<null>({
    url: '/systemManage/resetUserPassword',
    method: 'post',
    data
  });
}

// ── US4 使用者回收桶（2）＝contracts #8~#9 ──

/** 讀已刪使用者列表（GET getDeletedUsers；deleted_at DESC、userRoles 空〔指派已硬刪〕；回應形同 UserList、無 deletedAt 欄） */
export function fetchGetDeletedUsers(params?: Api.SystemManage.DeletedUserListReq) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getDeletedUsers',
    method: 'get',
    params
  });
}

/** 復原使用者（POST restoreUser；零回灌＝復原後零角色、status 保留刪除前原值；2222 userNameExists〔活性同名衝突〕／userNotFound） */
export function fetchRestoreUser(id: number) {
  return request<null>({
    url: '/systemManage/restoreUser',
    method: 'post',
    data: { id }
  });
}

// ── US5 會話策略（1）＝contracts #10 ──

/** 更新使用者會話策略（POST updateUserSessionPolicy；值域驗＋no-op、改 single 不即時踢＝下次登入依 006 階層收斂；2222 sessionPolicyInvalid／userNotFound） */
export function fetchUpdateUserSessionPolicy(data: Api.SystemManage.UpdateUserSessionPolicyReq) {
  return request<null>({
    url: '/systemManage/updateUserSessionPolicy',
    method: 'post',
    data
  });
}

// ── US6 解鎖登入（1）＝contracts 複用端點 R1（007 既有端點、m002 已埋政策；user:unlock 按鈕碼←m008）──

/** 手動解鎖登入（POST unlockLogin；帳號維 userName／IP 源維 target、解鎖冪等；2222 unlock.invalidTarget／invalidDimension） */
export function fetchUnlockLogin(data: Api.SystemManage.UnlockLoginReq) {
  return request<null>({
    url: '/systemManage/unlockLogin',
    method: 'post',
    data
  });
}
