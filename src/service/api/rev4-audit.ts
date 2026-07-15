// BASE-WEB-WRAPPER (012-audit-admin)：新增 service 檔，不改凍結 system-manage.ts。
// 稽核中心 5 fetcher＝四源讀端（get＋params）＋水平線清理寫端（post＋data）；動詞逐條對齊 contracts fetcher 對帳表。
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

// ── US1 四源稽核讀端（4）＝contracts #1~#4（皆 get＋params；讀端零拒因、參數寬鬆）──

/** 讀操作日誌（GET getOperationLog；PageRes<OperationLog>；payload 經後端打碼單點、回應零原值） */
export function fetchGetOperationLog(params?: Api.SystemManage.OperationLogSearchParams) {
  return request<Api.SystemManage.OperationLogList>({
    url: '/systemManage/getOperationLog',
    method: 'get',
    params
  });
}

/** 讀存取日誌（GET getAccessLog；PageRes<AccessLog>；httpPath ILIKE 模糊＋trigram、萬用字元字面化） */
export function fetchGetAccessLog(params?: Api.SystemManage.AccessLogSearchParams) {
  return request<Api.SystemManage.AccessLogList>({
    url: '/systemManage/getAccessLog',
    method: 'get',
    params
  });
}

/** 讀登入嘗試（GET getLoginAttempt；PageRes<LoginAttempt>；userName ILIKE 模糊；★節流短路零列＝表語意、UI 明示 FR-021） */
export function fetchGetLoginAttempt(params?: Api.SystemManage.LoginAttemptSearchParams) {
  return request<Api.SystemManage.LoginAttemptList>({
    url: '/systemManage/getLoginAttempt',
    method: 'get',
    params
  });
}

/** 讀會話事件（GET getSessionEvent；PageRes<SessionEvent>；eventType/reason 封閉集等值） */
export function fetchGetSessionEvent(params?: Api.SystemManage.SessionEventSearchParams) {
  return request<Api.SystemManage.SessionEventList>({
    url: '/systemManage/getSessionEvent',
    method: 'get',
    params
  });
}

// ── US3 水平線清理（1）＝contracts #5（post＋data；拒因 2222 biz.audit.invalidTable／purgeBelowFloor〔{minDays} 插值〕由攔截層 onError translateBackendMsg 統一 toast）──

/** 水平線清理稽核日誌（POST purgeAuditLog；表白名單×天數≥30、單交易 DELETE＋PURGE 自記；回 {deletedCount}） */
export function fetchPurgeAuditLog(data: Api.SystemManage.PurgeAuditLogReq) {
  return request<Api.SystemManage.PurgeAuditLogRes>({
    url: '/systemManage/purgeAuditLog',
    method: 'post',
    data
  });
}
