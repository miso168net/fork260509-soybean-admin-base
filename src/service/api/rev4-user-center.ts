// BASE-WEB-WRAPPER (014-user-center)：新增 service 檔，不改凍結 system-manage.ts。
// 個人中心自助八 fetcher＝014 四（讀端二 getProfile／getPasswordPolicy 皆 GET 無參＋寫端二 updateProfile／changePassword POST）
// ＋020-email-verify-smtp 信箱驗證流四（emailCaptcha 取題／sendEmailCode 發碼／verifyEmailCode 回填驗證／unbindEmail 解綁；C1~C4）；
// 端點逐條對齊 contracts §fetcher 對帳表；皆 Protection::Authed（operator＝claims.uid、req 不含任何身分欄）。
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

/** 讀本人 profile（GET getProfile；ProfileRes 12 欄＝data-model §3.1 逐欄 11 欄＋020 C6 加 emailVerifiedAt、零密碼零會話識別；標的消失→Internal 5000） */
export function fetchGetProfile() {
  return request<Api.UserCenter.ProfileRes>({
    url: '/userCenter/getProfile',
    method: 'get'
  });
}

/** 更新本人 profile（POST updateProfile；三欄全可選部分更新〔020 C5 移 userEmail、信箱改走驗證流〕——帶欄才寫、全缺＝no-op 零時戳 bump；2222 userNotFound） */
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

/** 取信箱驗證 captcha（GET emailCaptcha；020 C1——ctx=email challenge、TTL 300s；點圖換題即重呼、challenge 提交即消耗） */
export function fetchEmailCaptcha() {
  return request<Api.UserCenter.EmailCaptchaRes>({
    url: '/userCenter/emailCaptcha',
    method: 'get'
  });
}

/** 發送信箱驗證碼（POST sendEmailCode；020 C2；2222 emailCaptchaInvalid／emailFormatInvalid／emailTaken／emailCooldown〔data 帶 remainingSeconds〕／emailDailyLimit／emailSendFailed／emailThrottleUnavailable） */
export function fetchSendEmailCode(data: Api.UserCenter.SendEmailCodeReq) {
  return request<Api.UserCenter.SendEmailCodeRes>({
    url: '/userCenter/sendEmailCode',
    method: 'post',
    data
  });
}

/** 回填驗證（POST verifyEmailCode；020 C3——成功一步寫入、前端 saved 重拉刷新；2222 emailTokenInvalid／emailCodeExpired／emailCodeAttemptsExceeded／emailCodeInvalid／emailTaken／userNotFound／emailThrottleUnavailable） */
export function fetchVerifyEmailCode(data: Api.UserCenter.VerifyEmailCodeReq) {
  return request<null>({
    url: '/userCenter/verifyEmailCode',
    method: 'post',
    data
  });
}

/** 解除信箱綁定（POST unbindEmail；020 C4——無 body 無回應 data；2222 emailNotBound／userNotFound） */
export function fetchUnbindEmail() {
  return request<null>({
    url: '/userCenter/unbindEmail',
    method: 'post'
  });
}
