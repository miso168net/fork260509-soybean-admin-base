// [rev6-inline BASE-WEB-WRAPPER+ 003-auth-session] auth service 接線層新檔（§III.1 WRAPPER；contracts/wire-auth.md §logout）——不改既有 service 檔、不入 barrel
// ★消費端（user-avatar.vue 登出接線）以直接路徑 import 本模組、不經 src/service/api/index.ts——
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
