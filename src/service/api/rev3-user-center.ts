// [rev3-inline 025-user-center ★] 個人中心 self-service wrapper（3 auth-only 端點）
// fork-delta：view 走直接路徑 import（不經 barrel src/service/api/index.ts、避免 vite stale-export）
import { request } from '../request';

/** 讀自己 profile（auth-only、operator=claims.uid、含角色唯讀＋created/updated 語意） */
export function fetchGetProfile() {
  return request<Api.UserCenter.GetProfileRes>({
    url: '/userCenter/getProfile',
    method: 'get'
  });
}

/** 改自己 gender/nick/phone/email（auth-only、不信 body id、各卡保存共用送全 model） */
export function fetchUpdateProfile(model: Api.UserCenter.UpdateProfileReq) {
  return request<null>({
    url: '/userCenter/updateProfile',
    method: 'post',
    data: model
  });
}

/** 讀密碼政策（auth-only、任一登入者可讀、僅 7 個 password_* KV；改密頁即時提示用、避 super-only getSystemSettings 的 403） */
export function fetchGetPasswordPolicy() {
  return request<Api.UserCenter.PasswordPolicyItem[]>({
    url: '/userCenter/getPasswordPolicy',
    method: 'get'
  });
}

/** 改自己密碼（auth-only、舊密 verify → 套 024 政策 → hash → 窄寫 password） */
export function fetchChangePassword(model: Api.UserCenter.ChangePwdReq) {
  return request<null>({
    url: '/userCenter/changePassword',
    method: 'post',
    data: model
  });
}
