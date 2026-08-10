// [rev5-inline BASE-WEB-WRAPPER+ 003-auth-session] auth service 接線層新檔（§III.1 預設軌道；contracts/wire-auth.md §logout）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（user-avatar.vue 的登出接線）以直接
// 路徑 import 本模組——沿 rev5-settings.ts 先例（rev4: rev4-session-logout.ts 自陳理由＝
// 避 vite stale-export）。註：`from '../request'` 是 base-web 既有 service 檔的通例
// （auth.ts／system-manage.ts 皆同形），barrel 本來就不曝 request。
import { request } from '../request';

/**
 * 登出通知的等待上限（毫秒）
 *
 * ★刻意短於 axios 預設的 10 秒（`packages/axios/src/options.ts` 之 `TEN_SECONDS`）：本呼叫是
 * best-effort 通知，呼叫端（user-avatar.vue）不看結果就走本地清理，故等待預算該由「使用者
 * 願意盯著對話框多久」決定、不是由通用 API 預算決定。
 *
 * 沒有這一條時的使用者面：naive-ui 的 dialog 在 `onPositiveClick` 回傳的 promise resolve
 * 之前**不關閉、也不給按鈕任何 loading 狀態**；後端掛住（TCP 接了不回，例如 nginx／rust-api
 * 半死）時，按下「確認」後對話框原地不動、最長 10 秒毫無反應，之後才無聲關閉並跳登入頁——
 * 正是「登出按了沒反應」那個手感。逾時仍走 `createFlatRequest` 的 error 腿（該工廠恆回
 * `{ data, error }`、永不 reject），`resetStore()` 照跑，故「失敗不得阻斷本地清理」不受影響。
 */
const LOGOUT_TIMEOUT_MS = 3000;

/**
 * 登出（`POST /auth/logout`；契約＝contracts/wire-auth.md §logout）
 *
 * 帶 refreshToken 通知後端撤銷該工作階段（★非 access——access 過期亦能登出）。
 * 端點 Public 且**冪等**：驗章成功→該列撤銷＋denylist→`0000`（data:null）；垃圾／過期票
 * 亦 `0000` no-op（回異碼＝token 有效性 oracle）——呼叫端毋須分辨結果、一律續走本地清理。
 * rev4: 承 rev4-session-logout.ts fetchLogout 同名形（合一進 rev5-auth.ts）。
 */
export function fetchLogout(refreshToken: string) {
  return request<null>({
    url: '/auth/logout',
    method: 'post',
    timeout: LOGOUT_TIMEOUT_MS,
    data: {
      refreshToken
    }
  });
}

/**
 * 取圖形驗證碼題（`GET /auth/loginCaptcha`；契約＝contracts/wire-auth.md §loginCaptcha）
 *
 * 軟區觸發後才呼叫；challenge 綁定送出的帳號名（跨帳號呈遞即拒）、對任意 userName 一律
 * 發題（含不存在帳號＝零存在性洩漏）、產題對後端零狀態寫入。
 * rev4: 承 rev4-login-captcha.ts fetchLoginCaptcha 同名形（合一進 rev5-auth.ts）。
 */
export function fetchLoginCaptcha(userName: string) {
  return request<Api.Auth.LoginCaptcha>({
    url: '/auth/loginCaptcha',
    method: 'get',
    params: { userName }
  });
}

/**
 * 登入（`POST /auth/login`；LoginReq additive 兩 optional 欄——契約 §login）
 *
 * 未附 captcha 時 `captchaId`/`captchaCode` 為 undefined、JSON 序列化即省略 ⇒ wire 形與
 * upstream `fetchLogin` 完全相同；附掛時走軟區 captcha gate（★提交即消耗、答錯即失效）。
 * 拒因（同碼 2222、僅 msg 相異）：`biz.auth.captchaRequired`（軟區缺／錯／過期／重放）／
 * `biz.auth.locked`（硬鎖）——msg 回傳鏈由 auth store 消費。
 * rev4: 承 rev4-login-captcha.ts fetchLoginWithCaptcha 同名形。
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
