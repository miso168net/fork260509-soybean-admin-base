// [rev5-inline BASE-WEB-WRAPPER+ 008-audit-settings-pages] 稽核中心 service 接線層新檔（§III.1 預設軌道；contracts/wire-audit.md §1 端點表）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/manage/audit/）以直接路徑
// import 本模組——沿 rev5-settings.ts／rev5-ip-rule.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// 註：`from '../request'` 是 base-web 既有 service 檔的通例（auth.ts／system-manage.ts 皆同形）。
//
// ★五支＝四源讀端（GET＋params）＋水平線清理（POST＋json body）；型別全取 `Api.Audit` 獨立
// 命名空間（008 之 wire 契約錨 rev5-audit.d.ts、該檔唯讀）。回應分頁形直取
// `Api.Common.PaginatingQueryRecord<T>`——typings 檔頭自陳「不另設 ListRes 別名」；
// rev4: rev4-audit.ts 之型別住 `Api.SystemManage` 並以 `*List` 別名承載＝rev5 差異點、
// 不帶回（ADR 0019）。
// ★讀端零拒因（畸形過濾＝未設、區間顛倒＝空頁、恆 0000——contracts §3）；purge 拒因
// （2222 invalidTable／purgeBelowFloor〔{minDays} BizData 插值〕）由 service/request 共用
// 攔截層轉譯 backend.* 後 toast，本層不加工、呼叫端只看 error 真假。
import { request } from '../request';

/**
 * 讀操作日誌（`GET /systemManage/getOperationLog`；contracts/wire-audit.md §1 #1）
 *
 * 回 `{current, size, total, records}` 分頁形；排序恆 created_at DESC, id DESC（FR-A04、
 * 前端零 sorter）。records 之 payload 快照經後端 PII 打碼單點、回應零原值（FR-B02）。
 * 查詢參數寬鬆收單（全欄可缺席、空字串視同未設、畸形不 4xx——FR-A05），前端不必自己擋。
 * 授權＝Policy（seed 僅授 R_SUPER）；越權 5003／未認證 8888。
 * rev4: 承 rev4-audit.ts fetchGetOperationLog 同名形。
 */
export function fetchGetOperationLog(params?: Api.Audit.OperationLogSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.OperationLog>>({
    url: '/systemManage/getOperationLog',
    method: 'get',
    params
  });
}

/**
 * 讀存取日誌（`GET /systemManage/getAccessLog`；contracts/wire-audit.md §1 #2）
 *
 * `httpPath` 模糊含（後端 ILIKE、萬用字元字面化）；`httpMethod`／`httpStatus` 等值。
 * ★rev5 現況 `sys_access_log` 零寫入者（寫入面歸 B-016）＝本端恆空頁、已知態非錯誤。
 * rev4: 承 rev4-audit.ts fetchGetAccessLog 同名形。
 */
export function fetchGetAccessLog(params?: Api.Audit.AccessLogSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.AccessLog>>({
    url: '/systemManage/getAccessLog',
    method: 'get',
    params
  });
}

/**
 * 讀登入嘗試（`GET /systemManage/getLoginAttempt`；contracts/wire-audit.md §1 #3）
 *
 * `userName`＝attempted_user_name 模糊；`success`＝'true'|'false' 字串收斂（值域外＝未設）；
 * `realIp`＝精確等值（IPv4 /32、IPv6 /128）非模糊（FR-B08）。★節流短路遭拒的嘗試不落表
 * ＝表語意，UI 於該分頁帶語意告示（FR-E06）。
 * rev4: 承 rev4-audit.ts fetchGetLoginAttempt 同名形。
 */
export function fetchGetLoginAttempt(params?: Api.Audit.LoginAttemptSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.LoginAttempt>>({
    url: '/systemManage/getLoginAttempt',
    method: 'get',
    params
  });
}

/**
 * 讀會話事件（`GET /systemManage/getSessionEvent`；contracts/wire-audit.md §1 #4）
 *
 * `eventType`／`reason` 等值；人員過濾＝userId（數字）優先於 userName（文字）。
 * 列形＝單欄 `sourceIp`、非信任錨四欄組（該分頁結構性無 XFF 欄——ADR 0076 射程外）。
 * rev4: 承 rev4-audit.ts fetchGetSessionEvent 同名形。
 */
export function fetchGetSessionEvent(params?: Api.Audit.SessionEventSearchParams) {
  return request<Api.Common.PaginatingQueryRecord<Api.Audit.SessionEvent>>({
    url: '/systemManage/getSessionEvent',
    method: 'get',
    params
  });
}

/**
 * 水平線清理稽核日誌（`POST /systemManage/purgeAuditLog`；contracts/wire-audit.md §1 #5）
 *
 * req＝{table: 四值白名單, beforeDays: number}二欄構造、不存在挑列刪除路徑（FR-C01）；
 * beforeDays 下限 30（`PURGE_MIN_DAYS` 後端權威；違反＝2222 purgeBelowFloor＋{minDays}
 * 明細——FR-C02）。後端單交易 DELETE＋操作日誌自記（FR-C03）。
 * 回 `{deletedCount}`；0 亦為成功——水平線前無資料屬正常。
 * rev4: 承 rev4-audit.ts fetchPurgeAuditLog 同名形。
 */
export function fetchPurgeAuditLog(data: Api.Audit.PurgeAuditLogReq) {
  return request<Api.Audit.PurgeAuditLogRes>({
    url: '/systemManage/purgeAuditLog',
    method: 'post',
    data
  });
}
