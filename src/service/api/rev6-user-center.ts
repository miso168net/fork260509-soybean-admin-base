// [rev6-inline BASE-WEB-WRAPPER+ 007-user-password-admin] 個人中心兩端點的請求包裝新檔（§III.1 WRAPPER 軌道；specs/007-user-password-admin/contracts/wire-user-center.md）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端以直接路徑 import，同 `rev6-user-admin.ts`。兩支皆登入即可用（不進授權判定）、標的恆為
// 登入者本人——請求型結構上沒有 id 欄；替他人設密走 `rev6-user-admin.ts` 之 `fetchResetUserPassword`。
// 兩支皆不加工失敗原因：業務拒絕（`2222` 家族，含攜明細之 `biz.user.passwordPolicy`／`biz.user.pwdSetTooFrequent`）由
// `service/request` 的 onError 鏈轉譯後統一出 toast，呼叫端只判回傳的 `error` 有無。
// 出處：rev5:src/service/api/rev5-user-center.ts（兩支同名、動詞同形）。
import { request } from '../request';

/**
 * 讀密碼政策（`GET /userCenter/getPasswordPolicy`；契約端點 1）。唯讀、零副作用；取不到時呼叫端靜默退為必填、不擋送出——後端
 * 才是唯一裁判。
 */
export function fetchGetPasswordPolicy() {
  return request<Api.UserCenter.PasswordPolicyView>({
    url: '/userCenter/getPasswordPolicy',
    method: 'get'
  });
}

/** 改本人密碼（`POST /userCenter/changePassword`；契約端點 2）。成功後當前會話保留、本人其他會話下一次請求即失效。 */
export function fetchChangePassword(data: Api.UserCenter.ChangePasswordReq) {
  return request<null>({
    url: '/userCenter/changePassword',
    method: 'post',
    data
  });
}
