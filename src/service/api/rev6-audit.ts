// [rev6-inline BASE-WEB-WRAPPER+ 008-audit-settings-pages] 稽核五端點（四源讀端＋水平線清理）的請求包裝新檔（§III.1 WRAPPER 軌道；specs/008-audit-settings-pages/contracts/wire-audit.md 端點總表）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端（`views/manage/audit/` 之主頁與清理浮層）以直接路徑 import，同 `rev6-ip-rule.ts`／`rev6-settings.ts`。
// 型別一律取 `Api.Audit`（`typings/api/rev6-audit.d.ts`）；四源分頁回應直接實例化 `Api.Common.PaginatingQueryRecord<…>`、不另立別名。
// 五支皆不加工失敗原因：清理之兩個業務拒因（`biz.audit.invalidTable`、`biz.audit.purgeBelowFloor`；後者之 `{minDays}` 由錯誤信封明細插值）
// 與 HTTP 層拒絕，都由 `service/request` 的 onError 鏈轉譯後統一出 toast，呼叫端只判回傳的 `error` 有無。讀端四支沒有業務拒因。
// 出處：rev5:src/service/api/rev5-audit.ts（五支同名、動詞與路徑同形）。
import { request } from '../request';

/** 讀操作日誌（`GET /systemManage/getOperationLog`；契約端點 1）。列序由伺服器固定為建立時刻降冪、不收排序參數；快照兩欄已在讀端打碼。 */
export function fetchGetOperationLog(params?: Api.Audit.OperationLogSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.OperationLog>>({
    url: '/systemManage/getOperationLog',
    method: 'get',
    params
  });
}

/**
 * 讀存取日誌（`GET /systemManage/getAccessLog`；契約端點 2）。後端記錄層只掛在受保護路由、位於認證之後：授權拒絕照記（403）；
 * 公開路由（如登入、換發、登出）、認證失敗與未註冊路徑或動詞不符的請求不經此層、不留列。`httpStatus` 是 HTTP 狀態碼、
 * 分不出業務成敗。
 */
export function fetchGetAccessLog(params?: Api.Audit.AccessLogSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.AccessLog>>({
    url: '/systemManage/getAccessLog',
    method: 'get',
    params
  });
}

/** 讀登入嘗試（`GET /systemManage/getLoginAttempt`；契約端點 3）。被登入節流直接擋下的嘗試不落此表。 */
export function fetchGetLoginAttempt(params?: Api.Audit.LoginAttemptSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.LoginAttempt>>({
    url: '/systemManage/getLoginAttempt',
    method: 'get',
    params
  });
}

/** 讀工作階段事件（`GET /systemManage/getSessionEvent`；契約端點 4）。本源只有單欄來源位址、沒有 X-Forwarded-For 欄。 */
export function fetchGetSessionEvent(params?: Api.Audit.SessionEventSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.SessionEvent>>({
    url: '/systemManage/getSessionEvent',
    method: 'get',
    params
  });
}

/**
 * 水平線清理（`POST /systemManage/purgeAuditLog`；契約端點 5）。請求只有標的表與保留天數兩欄：刪除該表建立時刻早於
 * （現在 − `beforeDays` 天）之列、沒有挑列刪除的欄位；標的為操作日誌時，清理自記列（`operation` 為 `purge`）永久豁免、不刪。
 * 天數下界的權威在後端，前端浮層的下界只是操作護欄；回應之 `deletedCount` 為 0 亦是成功。
 */
export function fetchPurgeAuditLog(data: Api.Audit.PurgeAuditLogReq) {
  return request<Api.Audit.PurgeAuditLogRes>({
    url: '/systemManage/purgeAuditLog',
    method: 'post',
    data
  });
}
