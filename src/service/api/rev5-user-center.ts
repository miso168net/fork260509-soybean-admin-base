// [rev5-inline BASE-WEB-WRAPPER+ 007-user-password-admin] 個人中心 service 接線層新檔（§III.1 預設軌道；contracts/wire-user-center.md §1~§2）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/user-center/、views/manage/user/）以直接路徑
// import 本模組——沿 rev5-user-admin.ts／rev5-role-admin.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// ★兩支端點皆 `Protection::Authed`（登入即可用、不進 casbin）：故**非超管也進得了個人中心**，
// 自助路由白名單（後端碼內常數、現含 user-center）保證零 menu 政策的角色照樣拿得到該路由。
// ★拒因一律不在此處加工：`2222` 家族（notFound／passwordConfirmMismatch／changePasswordThrottled／
// oldPasswordMismatch／passwordSameAsOld／攜參之 passwordPolicy 與 pwdSetTooFrequent）由
// service/request 共用攔截層轉譯 `backend.biz.user.*` 後 toast，呼叫端只看 `error` 是否為真
// （頁內零拒因專屬 UI＝FR-039）。
import { request } from '../request';

/**
 * 讀密碼政策投影（`GET /userCenter/getPasswordPolicy`；契約＝contracts §1）
 *
 * 回具名七欄 [`Api.UserCenter.PasswordPolicyView`]（不含設密冷卻秒數）；★唯讀零副作用，
 * 改密卡每次開啟都會呼一次。★**與後端把關同源**：該投影由後端政策快照經唯一路徑產出，
 * 而那顆快照正是後端驗證點吃的同一份 ⇒ 結構上不可能出現「前端說 8 碼、後端要 12 碼」。
 * ★讀不到（網路／異常）時**呼叫端靜默降 required**、不彈錯不擋送出（FR-031 末句）。
 * rev4: 承 rev4-user-center.ts fetchGetPasswordPolicy 同名形；rev4 回 KV 清單
 * （`PasswordPolicyItem[]`）＝差異點不帶回（rev5 為具名七欄投影、前端零字串鍵查表）。
 */
export function fetchGetPasswordPolicy() {
  return request<Api.UserCenter.PasswordPolicyView>({
    url: '/userCenter/getPasswordPolicy',
    method: 'get'
  });
}

/**
 * 自助改密（`POST /userCenter/changePassword`；契約＝contracts §2）
 *
 * 標的恆＝`claims.uid`（body 不帶 id）；步序＝活性→兩次一致→節流 precheck→舊密正確→
 * 新≠舊→政策→冷卻，任一步拒即零寫入。成功回 `data: null`，並撤除**本人其他裝置**的票
 * （保留當前 sid）⇒ 其他裝置下一次請求得 8888、當前裝置不受影響。
 * rev4: 承 rev4-user-center.ts fetchChangePassword 同名形；rev4 之信箱／手機驗證碼改密路徑
 * ＝rev5 差異點不帶回（本刀只做舊密碼一路＝FR-037）。
 */
export function fetchChangePassword(data: Api.UserCenter.ChangePasswordReq) {
  return request<null>({
    url: '/userCenter/changePassword',
    method: 'post',
    data
  });
}
