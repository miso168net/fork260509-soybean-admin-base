// BASE-WEB-WRAPPER (014-user-center)：新增 service 檔，不改凍結 system-manage.ts。
// 個人中心自助四 fetcher＝讀端二（getProfile／getPasswordPolicy 皆 GET 無參）＋寫端二（updateProfile／changePassword POST）；
// 端點逐條對齊 contracts §fetcher 對帳表；皆 Protection::Authed（operator＝claims.uid、req 不含任何身分欄）。
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

/** 讀本人 profile（GET getProfile；ProfileRes 11 欄＝data-model §3.1、零密碼零會話識別；標的消失→Internal 5000） */
export function fetchGetProfile() {
  return request<Api.UserCenter.ProfileRes>({
    url: '/userCenter/getProfile',
    method: 'get'
  });
}

/** 更新本人 profile（POST updateProfile；四欄全可選部分更新——帶欄才寫、全缺＝no-op 零時戳 bump；2222 userNotFound） */
export function fetchUpdateProfile(data: Api.UserCenter.UpdateProfileReq) {
  return request<null>({
    url: '/userCenter/updateProfile',
    method: 'post',
    data
  });
}

/** 讀密碼政策（GET getPasswordPolicy；7 鍵 password_* allowlist 投影、任一登入者可讀；改密表單動態 rules 資料源） */
export function fetchGetPasswordPolicy() {
  return request<Api.UserCenter.PasswordPolicyItem[]>({
    url: '/userCenter/getPasswordPolicy',
    method: 'get'
  });
}

/** 自助改密（POST changePassword；三欄必填；成功即撤他裝置 session〔keep-sid〕；2222 passwordMismatch／oldPasswordMismatch／passwordSameAsOld／passwordPolicy〔data 帶違規清單〕／userNotFound） */
export function fetchChangePassword(data: Api.UserCenter.ChangePwdReq) {
  return request<null>({
    url: '/userCenter/changePassword',
    method: 'post',
    data
  });
}
