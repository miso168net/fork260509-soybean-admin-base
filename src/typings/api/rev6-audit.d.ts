// [rev6-inline BASE-WEB-ADAPT+ 008-audit-settings-pages] 稽核四源讀端與手動清理之 wire 型別新檔——以 declaration merging 開 `Api.Audit` 節、既有 typings 檔零改（specs/008-audit-settings-pages/contracts/wire-audit.md）
declare namespace Api {
  /**
   * 稽核域四源讀端（`getOperationLog`／`getAccessLog`／`getLoginAttempt`／`getSessionEvent`）與水平線清理（`purgeAuditLog`）之 wire 型別。本節即憲法 §I.3
   * 的 wire 權威：`tools/wire-schema.py extract` 由此抽快照、rust 側 `tests/wire_schema.rs` 據快照裁後端型別。
   *
   * 自成一節而不掛進 `Api.SystemManage`：`Audit` 前綴由命名空間承擔，四源之列型與查詢參數型不必逐支戴前綴。
   * 型名對映後端 `handler::audit`：列型＝同名加 `Dto` 尾綴（`OperationLog` ↔ `OperationLogDto`）、查詢參數型之 `SearchParams`
   * 尾綴對 `Query`（`OperationLogSearchParams` ↔ `OperationLogQuery`）；各型欄序＝wire 欄序。分頁回應不另立型：直接實例化
   * `Common.PaginatingQueryRecord<OperationLog>` 等。
   *
   * 查詢參數之共同語意：全鍵可缺席、各條件彼此 AND；空字串與畸形值＝該條件未設，後端不為此回 4xx（同名鍵重複＝整串視同未帶參數）。
   * `timeFrom`／`timeTo` 為 RFC3339、半開區間 [起, 迄)：畸形＝該端未設、起不早於迄＝空頁。`current`／`size` 依共用分頁規則收斂
   * （界外夾回上下界、缺席取預設）。不收排序參數：列序恆為建立時刻降冪、同刻以 `id` 降冪決勝。
   *
   * 欄形出處＝rev5:src/typings/api/rev5-audit.d.ts，列型與查詢參數型之欄名、欄序、型與可空性照承；清理之請求、回應與標的四值亦照承，
   * 下限拒因之明細另立具名型 `PurgeBelowFloorDetail`（rev5 為匿名物件、wire 形相同）。
   */
  namespace Audit {
    /**
     * 操作日誌列（`getOperationLog` 之 `records` 元素）。十五欄恆在場：可空欄以顯式 `null` 上 wire、不省略欄。
     */
    interface OperationLog {
      /** 主鍵；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立時刻；RFC3339、偏移恆 `+00:00` */
      createTime: string;
      /** 操作者 uid（同過 2^53 守衛）；無操作者之列為 `null` */
      operatorId: number | null;
      /** 後端依 `operatorId` 查帳號表所得之帳號名（非落表欄）；無操作者或查無對應帳號即 `null` */
      operatorName: string | null;
      /** 操作類型字面（過濾時等值、大小寫敏感） */
      operation: string;
      /** 受操作之資料表名 */
      entityTable: string;
      /** 受操作列之主鍵（同過 2^53 守衛）；無單一受操作列即 `null` */
      entityId: number | null;
      /** 變更前快照：頂層 `userPhone`／`userEmail` 兩鍵之字串值經後端打碼後上 wire、其餘鍵照存值原文；無快照即 `null` */
      payloadBefore: Record<string, unknown> | null;
      /** 變更後快照（打碼語意同 `payloadBefore`）；無快照即 `null` */
      payloadAfter: Record<string, unknown> | null;
      /** 真實來源 IP：位址字串、不帶 `/32`／`/128` 網段後綴 */
      realIp: string;
      /** 直連對端 IP（形同 `realIp`）；無則 `null` */
      peerIp: string | null;
      /** X-Forwarded-For 標頭之存值原文（自由文字；顯示端只准純文字插值）；無則 `null` */
      xForwardedFor: string | null;
      /** 來源 IP 信心度標記之存值原字面（值集不封閉、舊期值照回）；無則 `null` */
      ipConfidence: string | null;
      /** 地域；無則 `null` */
      region: string | null;
      /** 追蹤 id；無則 `null` */
      traceId: string | null;
    }

    /**
     * 存取日誌列（`getAccessLog` 之 `records` 元素）。十三欄恆在場：可空欄以顯式 `null` 上 wire、不省略欄。
     */
    interface AccessLog {
      /** 主鍵；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立時刻；RFC3339、偏移恆 `+00:00` */
      createTime: string;
      /** 已認證請求之操作者 uid（同過 2^53 守衛）；恆非 null */
      operatorId: number;
      /** 後端依 `operatorId` 查帳號表所得之帳號名（非落表欄）；查無對應帳號即 `null` */
      operatorName: string | null;
      /** HTTP 方法字面（例 `GET`；過濾時等值、大小寫敏感） */
      httpMethod: string;
      /** 請求路徑（不含查詢串） */
      httpPath: string;
      /** 回應之 HTTP 狀態碼（後端 i32）；不是業務碼——業務拒因之回應亦為 200，本欄分不出業務成敗 */
      httpStatus: number;
      /** 真實來源 IP：位址字串、不帶 `/32`／`/128` 網段後綴 */
      realIp: string;
      /** 直連對端 IP（形同 `realIp`）；無則 `null` */
      peerIp: string | null;
      /** X-Forwarded-For 標頭之存值原文（自由文字；顯示端只准純文字插值）；無則 `null` */
      xForwardedFor: string | null;
      /** 來源 IP 信心度標記之存值原字面（值集不封閉、舊期值照回）；無則 `null` */
      ipConfidence: string | null;
      /** 地域；無則 `null` */
      region: string | null;
      /** 追蹤 id；無則 `null` */
      traceId: string | null;
    }

    /**
     * 登入嘗試列（`getLoginAttempt` 之 `records` 元素）。十欄恆在場：可空欄以顯式 `null` 上 wire、不省略欄；本源無操作者欄。
     */
    interface LoginAttempt {
      /** 主鍵；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立時刻；RFC3339、偏移恆 `+00:00` */
      createTime: string;
      /** 登入時所送之帳號名原文（未必對應既有帳號） */
      attemptedUserName: string;
      /** 該次登入嘗試是否成功（wire＝JSON boolean；查詢參數側為字串形，見 `LoginAttemptSearchParams`） */
      success: boolean;
      /** 真實來源 IP：位址字串、不帶 `/32`／`/128` 網段後綴 */
      realIp: string;
      /** 直連對端 IP（形同 `realIp`）；無則 `null` */
      peerIp: string | null;
      /** X-Forwarded-For 標頭之存值原文（自由文字；顯示端只准純文字插值）；無則 `null` */
      xForwardedFor: string | null;
      /** 來源 IP 信心度標記之存值原字面（值集不封閉、舊期值照回）；無則 `null` */
      ipConfidence: string | null;
      /** 地域；無則 `null` */
      region: string | null;
      /** 追蹤 id；無則 `null` */
      traceId: string | null;
    }

    /**
     * 會話事件列（`getSessionEvent` 之 `records` 元素）。十欄恆在場：可空欄以顯式 `null` 上 wire、不省略欄；來源只有
     * `sourceIp` 單欄（無 X-Forwarded-For 等欄）。
     */
    interface SessionEvent {
      /** 主鍵；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立時刻；RFC3339、偏移恆 `+00:00` */
      createTime: string;
      /** 事件主體之 uid（同過 2^53 守衛）；恆非 null */
      userId: number;
      /** 後端依 `userId` 查帳號表所得之帳號名（非落表欄）；查無對應帳號即 `null` */
      userName: string | null;
      /** 會話 id */
      sid: string;
      /** 事件型字面（過濾時等值） */
      eventType: string;
      /** 事件原因字面（過濾時等值）；無則 `null` */
      reason: string | null;
      /** 觸發事件之操作者 uid（同過 2^53 守衛）；無則 `null` */
      operatorId: number | null;
      /** 後端依 `operatorId` 查帳號表所得之帳號名（非落表欄）；無操作者或查無對應帳號即 `null` */
      operatorName: string | null;
      /** 來源 IP 單欄字串（存值照回、非信任錨四欄組）；無則 `null` */
      sourceIp: string | null;
    }

    /**
     * 操作日誌查詢參數（`getOperationLog` 之 query；共同語意見本節開頭）。`entityTable`／`operation` 等值、大小寫敏感；
     * `operatorId`／`operatorName` 為人員過濾：兩者皆給以 id 為準，只給名＝比對含已軟刪之同名帳號全集、零命中＝空頁。
     */
    type OperationLogSearchParams = CommonType.RecordNullable<
      {
        entityTable: string;
        operation: string;
        operatorId: number;
        operatorName: string;
        timeFrom: string;
        timeTo: string;
      } & Common.CommonSearchParams
    >;

    /**
     * 存取日誌查詢參數（`getAccessLog` 之 query；共同語意見本節開頭）。`httpMethod` 等值、大小寫敏感；`httpStatus` 等值（後端
     * trim 後解析整數）；`httpPath` 為部分字串比對、`%`／`_`／`\` 一律當字面；人員過濾同 `OperationLogSearchParams`。
     */
    type AccessLogSearchParams = CommonType.RecordNullable<
      {
        httpMethod: string;
        httpStatus: number;
        httpPath: string;
        operatorId: number;
        operatorName: string;
        timeFrom: string;
        timeTo: string;
      } & Common.CommonSearchParams
    >;

    /**
     * 登入嘗試查詢參數（`getLoginAttempt` 之 query；共同語意見本節開頭）。`userName` 對所送帳號名做部分字串比對（萬用字元當字面）；
     * `success` 為字串聯合——後端 trim 後恰 `'true'`／`'false'` 才過濾、其餘（含大小寫異形）＝未設；`realIp` 解析得出位址才以
     * 精確等值比對（IPv4 /32、IPv6 /128），解析不出＝未設、不做字串包含。本源無人員過濾維。
     */
    type LoginAttemptSearchParams = CommonType.RecordNullable<
      {
        userName: string;
        success: 'true' | 'false';
        realIp: string;
        timeFrom: string;
        timeTo: string;
      } & Common.CommonSearchParams
    >;

    /**
     * 會話事件查詢參數（`getSessionEvent` 之 query；共同語意見本節開頭）。`userId`／`userName` 為事件主體之人員過濾（規則同
     * `OperationLogSearchParams` 之操作者維）；`eventType`／`reason` 等值。
     */
    type SessionEventSearchParams = CommonType.RecordNullable<
      {
        userId: number;
        userName: string;
        eventType: string;
        reason: string;
        timeFrom: string;
        timeTo: string;
      } & Common.CommonSearchParams
    >;

    /**
     * 清理標的四值（`purgeAuditLog` 之 `table`）：操作日誌、存取日誌、登入嘗試、會話事件。值域之真源在後端白名單；大小寫敏感，
     * 值域外即 `2222 biz.audit.invalidTable`。
     */
    type PurgeAuditTable = 'operationLog' | 'accessLog' | 'loginAttempt' | 'sessionEvent';

    /**
     * `purgeAuditLog` 之請求體：刪除 `table` 中建立時刻早於（現在 − `beforeDays` 天）之列（整段刪除、不挑列）。`beforeDays` 下界之
     * 權威在後端常數（低於下界即 `2222 biz.audit.purgeBelowFloor`、攜 `PurgeBelowFloorDetail`）；前端之下界只是操作護欄。只此兩欄，
     * 多送之鍵後端一律忽略。
     */
    interface PurgeAuditLogReq {
      table: PurgeAuditTable;
      beforeDays: number;
    }

    /** `purgeAuditLog` 之回應 `data`：本次刪除列數（0 亦為成功；成功即同交易落一列清理自記）。 */
    interface PurgeAuditLogRes {
      deletedCount: number;
    }

    /**
     * `2222 biz.audit.purgeBelowFloor` 錯誤信封之 `data`（錯誤 `data` 恆 null 之三例外之三；ADR-00102）：保留天數下限（系統常數，
     * 不含他人資訊）；提示文案以 `{minDays}` 具名插值。
     */
    interface PurgeBelowFloorDetail {
      minDays: number;
    }
  }
}
