// [rev6-inline BASE-WEB-WRAPPER+ 003-auth-session] auth service 接線層新檔（§III.1 WRAPPER；contracts/wire-auth.md §login／§loginCaptcha／§logout／§替代登入 stub）——不改既有 service 檔、不入 barrel
// ★消費端（auth store 登入接線、pwd-login.vue 取題、user-avatar.vue 登出接線、三張替代登入表單與 captcha hook 之 stub 接線）以直接路徑 import 本模組、不經 src/service/api/index.ts——
//   與 rev6-settings.ts 同一先例（barrel 重匯出在 vite HMR 下會殘留舊 export；rev5:rev5-auth.ts 同判）。
//   `from '../request'` 則是既有 service 檔（auth.ts／system-manage.ts）的共同入口、與 barrel 無涉。
import { request } from '../request';

/**
 * `/auth/logout` 的等待上限（毫秒）——本檔唯一的常數、只給 fetchLogout 用
 *
 * 取 3 秒而非 axios 工廠預設的 10 秒（packages/axios/src/options.ts）：naive-ui dialog 要等
 * `onPositiveClick` 回傳的 promise 落定才會關閉、期間按鈕也沒有 loading 態，後端半死（連線建立
 * 但不回）時使用者會看到「按了確認卻毫無反應」；把等待預算壓到 3 秒＝把這段空白壓到可忍受。
 * 逾時對正確性零影響：`createFlatRequest` 恆以 `{ data, error }` 回、從不 reject，逾時只是走
 * error 腿，呼叫端接著照跑 `resetStore()`（憲法 §III.2 LOGOUT-UX(i)「失敗不得阻斷」）。
 */
const LOGOUT_TIMEOUT_MS = 3000;

/**
 * 登出通知（`POST /auth/logout`；契約＝contracts/wire-auth.md §logout；後端＝003 刀 U7 T041）
 *
 * 帶的是 refreshToken、不是 access——access 已過期的會話也要能登出。
 * 端點 Public、冪等且**永遠 0000**：驗章成功→該列 `revoked`＋denylist（TTL＝refresh 全壽命）；
 * 垃圾票／過期票／已撤票／壞形 body→同樣 0000 no-op（若回異碼就成了 token 有效性 oracle）。
 * 因此呼叫端不必分辨結果，通知完一律續走本地清理。
 * rev5:rev5-auth.ts fetchLogout 同名同形（rev6 只換檔名前綴與標記 token）。
 */
export function fetchLogout(refreshToken: string) {
  return request<null>({
    url: '/auth/logout',
    method: 'post',
    timeout: LOGOUT_TIMEOUT_MS,
    data: { refreshToken }
  });
}

/**
 * 取圖形驗證碼題（`GET /auth/loginCaptcha`；契約＝contracts/wire-auth.md §loginCaptcha；後端＝003 刀 U8 T050）
 *
 * 只在軟區才會被呼叫（登入回 `2222 biz.auth.captchaRequired` 之後）。題目綁定送出的帳號名——跨帳號呈遞後端即拒，
 * 所以帳號欄一變就得換題（pwd-login.vue 的 watch）。後端對任意 userName 一律發題、不查 DB（含不存在帳號＝零存在性
 * 洩漏）；query 缺席或帳號名超限走 `1000`。回傳 `Api.Auth.LoginCaptcha`（typings 新檔 rev6-auth.d.ts）。
 * rev5:rev5-auth.ts fetchLoginCaptcha 同名同形。
 */
export function fetchLoginCaptcha(userName: string) {
  return request<Api.Auth.LoginCaptcha>({
    url: '/auth/loginCaptcha',
    method: 'get',
    params: { userName }
  });
}

/**
 * 登入（`POST /auth/login`；契約＝contracts/wire-auth.md §login——`LoginReq` 在 upstream 兩欄之上加兩個 optional 欄）
 *
 * 不帶 `captcha` 時 `captchaId`／`captchaCode` 為 undefined、JSON 序列化直接省略 ⇒ 送出的 wire 形與 upstream
 * `fetchLogin` 完全相同（非軟區零行為變更的前提）；帶時走後端軟區 gate（★提交即消耗、答錯即作廢）。
 * 拒因同碼 `2222`、只靠 msg 區分：`biz.auth.captchaRequired`（軟區缺題／答錯／過期／重放）／`biz.auth.locked`
 * （鎖定）——msg 回傳鏈由 auth store `login()` 消費、pwd-login.vue 據以決定顯欄與換題。
 * ★取代 upstream `fetchLogin` 的原因：那支 `(userName, password)` 兩參且 data 在函式內構造、呼叫端擴不了欄，而
 * `src/service/api/auth.ts` 不在任何授權面——故 auth store 改 import 本支（憲法 §III.2 LOGIN-CAPTCHA(i)）。
 * rev5:rev5-auth.ts fetchLoginWithCaptcha 同名同形。
 */
export function fetchLoginWithCaptcha(
  userName: string,
  password: string,
  captcha?: { captchaId: string; captchaCode: string }
) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password,
      captchaId: captcha?.captchaId,
      captchaCode: captcha?.captchaCode
    }
  });
}

// ── 替代登入四流程的誠實 stub 出口（契約＝contracts/wire-auth.md §替代登入 stub；後端＝003 刀 U9 T059） ──
// 後端四端點共用 alt_stub::not_supported_stub：不解析 body、零副作用、恆回 `2222 biz.auth.notSupported`（data null）——
// 「尚未開放」自此是 wire 上可觀測的真話，取代 upstream 的假成功 toast（spec US5／FR-022）。四支共通約定：
// ①呼叫端不看結果、也不自行顯錯：`createFlatRequest` 恆以 `{ data, error }` 回，錯誤 toast 由 request 攔截器的
//   showErrorMsg 鏈經 backend.* i18n 轉譯自動顯示（憲法 §III.2 I18N-WIRING(i)）；成功腿現階段不存在、故亦無成功 toast。
// ②不增 Api.Auth 請求型別：register／resetPwd 各吃四個同型 string，positional 形相鄰兩欄對調時 typecheck 全綠、stub 又不讀
//   body ⇒ 錯位在本刀整個可觀測面靜默，故此二支吃行內具名物件、讓錯位由 typecheck 當場擋下；型別不出本檔＝wire-schema
//   快照零擴（其抽取面只涵 src/typings）。sendCaptcha／codeLogin 沿本檔純量參數慣例。
// ③wire req 照各表單 model 欄位 camelCase 直送——日後真做時 wire 形不變、表單端零改動。
// rev5:rev5-auth.ts 四支同形（rev6 加 `Stub` 尾綴＝名字即說明它現階段不會成功）。

/** 發送簡訊驗證碼（`POST /auth/sendCaptcha`；恆 2222——captcha hook getCaptcha 消費、成功才倒數） */
export function fetchSendCaptchaStub(phone: string) {
  return request<null>({
    url: '/auth/sendCaptcha',
    method: 'post',
    data: { phone }
  });
}

/** 驗證碼登入（`POST /auth/codeLogin`；恆 2222——code-login.vue 消費） */
export function fetchCodeLoginStub(phone: string, code: string) {
  return request<null>({
    url: '/auth/codeLogin',
    method: 'post',
    data: { phone, code }
  });
}

/** 註冊（`POST /auth/register`；恆 2222——register.vue 消費；欄型＝該表單 FormModel） */
export function fetchRegisterStub(data: { phone: string; code: string; password: string; confirmPassword: string }) {
  return request<null>({
    url: '/auth/register',
    method: 'post',
    data
  });
}

/**
 * 重設密碼（`POST /auth/resetPwd`；恆 2222——reset-pwd.vue 消費；欄型＝該表單 FormModel）
 *
 * 該表單的 code 欄沒有送碼入口（upstream 未掛 useCaptcha）＝既有 UX 態、本刀不補：端點恆 2222 之下補入口只是把同一句
 * 「該功能尚未開放」多鋪一條到達路徑。
 */
export function fetchResetPwdStub(data: { phone: string; code: string; password: string; confirmPassword: string }) {
  return request<null>({
    url: '/auth/resetPwd',
    method: 'post',
    data
  });
}
