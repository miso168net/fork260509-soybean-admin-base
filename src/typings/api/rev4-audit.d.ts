// BASE-WEB-ADAPT (012-audit-admin)：新增 typings 檔，不改凍結 system-manage.d.ts（upstream Api.SystemManage 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；本刀四源稽核讀端查詢參＋列型＋水平線清理寫端（camelCase wire、contracts 型別節）。
// ★列型逐欄對齊 U4 後端實際 wire 形（rust-api handler/audit.rs 之 *Dto；number/null、string/null 精確標注）：
//   id／userId＝number（2^53 守衛後端擔保）；operatorId／entityId＝number|null（op-log/session_event 可空、access-log operatorId 恆 number）；
//   可空顯示字串欄一律 string|null；success＝boolean；httpStatus＝number；createTime＝RFC3339 帶 offset 字串；
//   payloadBefore/After＝打碼後 JSON 物件或 null；sourceIp＝既有單欄字串形；IP 欄 wire 值＝host 位址字串（無網段前綴）。
// ★交叉型別承載、不 merge alias（照 rev4-user-admin.d.ts 房式）；★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace SystemManage {
    // ── 共通查詢參（四源共用；timeFrom/timeTo＝RFC3339 字串、閉開區間；current/size 分頁）──

    /** 稽核共通查詢欄（時間區間＋分頁；各源專屬欄以交集擴充） */
    type AuditCommonSearchParams = { timeFrom: string; timeTo: string } & CommonSearchParams;

    /**
     * 操作日誌查詢參數（GET getOperationLog；contracts #1）
     *
     * entityTable／operation 等值；operatorId（number）／operatorName（文字）人員過濾（clarify Q1：擇一、同傳 Id 優先）。
     */
    type OperationLogSearchParams = CommonType.RecordNullable<
      { entityTable: string; operation: string; operatorId: number; operatorName: string } & AuditCommonSearchParams
    >;

    /**
     * 存取日誌查詢參數（GET getAccessLog；contracts #2）
     *
     * httpMethod／httpStatus 等值；operatorId／operatorName 人員過濾；httpPath 模糊（ILIKE＋trigram、萬用字元字面化）。
     */
    type AccessLogSearchParams = CommonType.RecordNullable<
      {
        httpMethod: string;
        httpStatus: number;
        operatorId: number;
        operatorName: string;
        httpPath: string;
      } & AuditCommonSearchParams
    >;

    /**
     * 登入嘗試查詢參數（GET getLoginAttempt；contracts #3）
     *
     * success＝'true'/'false' 字串收斂；realIp 精確；userName 模糊（ILIKE＋trigram）。★無人員過濾維度（created_by 恆 NULL）。
     */
    type LoginAttemptSearchParams = CommonType.RecordNullable<
      { success: 'true' | 'false'; realIp: string; userName: string } & AuditCommonSearchParams
    >;

    /**
     * 會話事件查詢參數（GET getSessionEvent；contracts #4）
     *
     * userId（number）／userName（文字）人員過濾（等值解析）；eventType／reason 封閉集等值。
     */
    type SessionEventSearchParams = CommonType.RecordNullable<
      { userId: number; userName: string; eventType: string; reason: string } & AuditCommonSearchParams
    >;

    // ── 列型（逐欄構造、data-model §1 欄集 camelCase 鏡像；★逐欄對齊 U4 *Dto wire 形）──

    /**
     * 操作日誌列（OperationLogDto）
     *
     * payloadBefore／payloadAfter＝★讀端打碼後 JSON 物件或 null（原值不出後端）；
     * operatorId／entityId＝created_by／entity_id 可空→number|null；operatorRealIp…四欄＝信任錨還原位址（可空字串）。
     */
    type OperationLog = {
      id: number;
      createTime: string;
      operatorId: number | null;
      operatorName: string | null;
      operation: string;
      entityTable: string;
      entityId: number | null;
      payloadBefore: Record<string, unknown> | null;
      payloadAfter: Record<string, unknown> | null;
      operatorRealIp: string | null;
      operatorPeerIp: string | null;
      operatorXForwardedFor: string | null;
      operatorIpConfidence: string | null;
      traceId: string | null;
    };

    /**
     * 存取日誌列（AccessLogDto）
     *
     * operatorId＝created_by NOT NULL（結構上僅已認證請求）→number；realIp NOT NULL→字串；peerIp／region／IP 三欄可空。
     */
    type AccessLog = {
      id: number;
      createTime: string;
      operatorId: number;
      operatorName: string | null;
      httpMethod: string;
      httpPath: string;
      httpStatus: number;
      realIp: string;
      peerIp: string | null;
      xForwardedFor: string | null;
      ipConfidence: string | null;
      region: string | null;
      traceId: string | null;
    };

    /**
     * 登入嘗試列（LoginAttemptDto）
     *
     * ★無 operator 欄（created_by 恆 NULL）；attemptedUserName＝所送帳號名原文；realIp NOT NULL→字串。
     */
    type LoginAttempt = {
      id: number;
      createTime: string;
      attemptedUserName: string;
      success: boolean;
      realIp: string;
      peerIp: string | null;
      xForwardedFor: string | null;
      ipConfidence: string | null;
      region: string | null;
      traceId: string | null;
    };

    /**
     * 會話事件列（SessionEventDto）
     *
     * userId NOT NULL→number；operatorId＝created_by 可空→number|null；userName／operatorName／reason 可空；
     * ★sourceIp＝既有單欄字串形照回（非信任錨四欄組、本刀不改）。
     */
    type SessionEvent = {
      id: number;
      createTime: string;
      userId: number;
      userName: string | null;
      sid: string;
      eventType: string;
      reason: string | null;
      operatorId: number | null;
      operatorName: string | null;
      sourceIp: string | null;
    };

    // ── 分頁列表（PageRes<T>＝{current, size, total, records}）──

    /** 操作日誌列表（created_at DESC, id DESC 穩定排序） */
    type OperationLogList = Common.PaginatingQueryRecord<OperationLog>;
    /** 存取日誌列表 */
    type AccessLogList = Common.PaginatingQueryRecord<AccessLog>;
    /** 登入嘗試列表 */
    type LoginAttemptList = Common.PaginatingQueryRecord<LoginAttempt>;
    /** 會話事件列表 */
    type SessionEventList = Common.PaginatingQueryRecord<SessionEvent>;

    // ── 水平線清理（purge、寫端；contracts #5）──

    /** 清理標的表（四表封閉枚舉；wire 值逐字對齊 PurgeTable::from_wire） */
    type PurgeAuditTable = 'operationLog' | 'accessLog' | 'loginAttempt' | 'sessionEvent';

    /**
     * 水平線清理請求（POST purgeAuditLog；contracts #5）
     *
     * ★構造僅二欄（表白名單×天數）、不存在挑列刪路徑；beforeDays 下限 30（違反→2222 biz.audit.purgeBelowFloor＋{minDays}）；
     * table 值域外→2222 biz.audit.invalidTable。
     */
    type PurgeAuditLogReq = {
      table: PurgeAuditTable;
      beforeDays: number;
    };

    /** 水平線清理回應（{deletedCount}＝本次刪除列數、0 亦回為成功） */
    type PurgeAuditLogRes = {
      deletedCount: number;
    };
  }
}
