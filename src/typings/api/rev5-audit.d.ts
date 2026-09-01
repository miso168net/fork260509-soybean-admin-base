// [rev5-inline BASE-WEB-ADAPT+ 008-audit-settings-pages] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-audit.md、同軌先例＝rev5-ip-rule.d.ts／rev5-user-admin.d.ts）。
declare namespace Api {
  /**
   * 稽核中心（`/systemManage/get{OperationLog,AccessLog,LoginAttempt,SessionEvent}`＋
   * `/systemManage/purgeAuditLog` 五端點；契約權威＝contracts/wire-audit.md、
   * 欄集逐欄權威＝data-model.md §1～§3）
   *
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（FR-A06；rev5 先例＝`Api.IpRule`）：
   * 稽核域自帶四列型＋四查詢參數型＋清理三型共十一支，併進 `Api.SystemManage` 就得逐支戴
   * `Audit` 前綴才不撞既有 `User`／`Role` 同名家族；獨立命名空間讓前綴由命名空間本身承擔。
   * rev4: 承 rev4-audit.d.ts 之欄形藍本，但 rev4 把 audit 型併入 `Api.SystemManage`＝rev5
   * 差異點、不帶回（ADR 0019）。
   *
   * 四支讀端回應皆沿 `Common.PaginatingQueryRecord<T>` 分頁形（憲法 §I.3 字面、後端
   * `PageRes<T>`；★不另設 ListRes 別名——分頁形已是全 repo 單一權威、再包一層即重複發明）。
   * 排序恆 `created_at DESC, id DESC`（FR-A04、前端零 sorter）。
   */
  namespace Audit {
    /**
     * 操作日誌列 wire 形（`getOperationLog` 之 `records` 元素；data-model §1.1）
     *
     * ★IP 欄組＝`realIp`／`peerIp`／`xForwardedFor`／`ipConfidence`——欄名對齊 rev5
     * `sys_operation_log` 表形（**無 operator 前綴**）；rev4: rev4-audit.d.ts 為
     * `operatorRealIp` 家族命名＝rev5 差異點、不帶回，且 rev5 表多一欄 `region`。
     */
    type OperationLog = {
      /** 主鍵；後端 i64 過 2^53 fail-loud 守衛後以 JSON number 上 wire（憲法 §I.3） */
      id: number;
      /** RFC3339 帶 offset 字面（created_at） */
      createTime: string;
      /** 操作者 id（created_by 可空——系統面寫入無操作者） */
      operatorId: number | null;
      /** 操作者帳號名（後端第二發批查 enrich、查無即 `null`；非落表欄）；UI 降級序＝名→id→「-」（FR-B06） */
      operatorName: string | null;
      /** 操作類型（等值過濾維） */
      operation: string;
      /** 受操作資料表名 */
      entityTable: string;
      /** 受操作列主鍵（批次／無主體操作可空） */
      entityId: number | null;
      /** 變更前快照——★經後端 PII 打碼後上 wire（FR-B02）、原值不出後端；無快照即 `null` */
      payloadBefore: Record<string, unknown> | null;
      /** 變更後快照（打碼語意同 `payloadBefore`；清理自記之明細亦落此欄） */
      payloadAfter: Record<string, unknown> | null;
      /**
       * 信任錨還原之真實來源 IP（INET→host 字串、無網段後綴）
       *
       * ★表欄 `INET NOT NULL` → **恆字串**（同 `AccessLog.realIp`／`LoginAttempt.realIp`）：
       * rev5 定稿把本表 real_ip 升為 NOT NULL（m001 §4 授權偏離集之「real_ip 全庫 NN」）；
       * rev4: rev4 該欄名為 `operatorRealIp` 且可空＝rev5 差異點、不帶回（ADR 0019）。
       */
      realIp: string;
      /** 直連對端 IP——★上 wire 但 UI 不渲染（偏離 rev4 最小化，FR-B07） */
      peerIp: string | null;
      /** X-Forwarded-For 原文（建構點保證零 CR/LF＋≤1024 字元）——★上 wire 且 UI 渲染（ADR 0076；rev4 UI 對照唯一例外、渲染端純文字插值） */
      xForwardedFor: string | null;
      /** IP 信心度標記——★上 wire 但 UI 不渲染（FR-B07） */
      ipConfidence: string | null;
      /** 地域——★rev5 值恆 `null`（GeoIP 中介層不進場＝寫入面既定取態）＝已知態；上 wire 但 UI 不渲染（rev5 新有欄、rev4 op-log 無此欄） */
      region: string | null;
      /** 追蹤 id——★rev5 值恆 `null`（trace 中介層不進場）＝已知態；UI 照 rev4 渲染、畫面恆「-」（CDP 對照驗形不驗值） */
      traceId: string | null;
    };

    /**
     * 存取日誌列 wire 形（`getAccessLog`；data-model §1.2）
     *
     * ★rev5 現況 `sys_access_log` 零寫入者（寫入面 access_log_mw 歸 B-016）＝讀端恆空頁、
     * 已知態非錯誤；本型先立 wire 契約、資料待寫入面落地後才累積。
     */
    type AccessLog = {
      id: number;
      /** RFC3339 帶 offset 字面 */
      createTime: string;
      /** 操作者 id（created_by NOT NULL——結構上僅已認證請求落表）→ 恆 number */
      operatorId: number;
      /** 操作者帳號名（enrich、查無即 `null`） */
      operatorName: string | null;
      httpMethod: string;
      httpPath: string;
      /** 回應 HTTP 狀態碼（i64 過 2^53 守衛後上 wire） */
      httpStatus: number;
      /** 真實來源 IP（表欄 NOT NULL）→ 恆字串 */
      realIp: string;
      /** ★上 wire 但 UI 不渲染（FR-B07） */
      peerIp: string | null;
      /** ★上 wire 且 UI 渲染（ADR 0076） */
      xForwardedFor: string | null;
      /** ★上 wire 但 UI 不渲染（FR-B07） */
      ipConfidence: string | null;
      /** ★rev5 值恆 `null`（無 GeoIP）＝已知態；本分頁該欄照 rev4 續渲染、畫面恆「-」 */
      region: string | null;
      /** ★rev5 值恆 `null`（無 trace 中介層）＝已知態；UI 渲染恆「-」 */
      traceId: string | null;
    };

    /**
     * 登入嘗試列 wire 形（`getLoginAttempt`；data-model §1.3）
     *
     * ★無操作者維（created_by 恆 NULL＝匿名寫入、不上 wire、無 enrich）；節流短路遭拒
     * 不落表（UI 該分頁帶語意告示、FR-E06）。
     */
    type LoginAttempt = {
      id: number;
      /** RFC3339 帶 offset 字面 */
      createTime: string;
      /** 所送帳號名原文（未必存在對應使用者） */
      attemptedUserName: string;
      /** 成敗旗標（wire＝JSON boolean；查詢參數側收斂為 'true'|'false' 字串、見 `LoginAttemptSearchParams`） */
      success: boolean;
      /** 真實來源 IP（表欄 NOT NULL）→ 恆字串 */
      realIp: string;
      /** ★上 wire 但 UI 不渲染（FR-B07） */
      peerIp: string | null;
      /** ★上 wire 且 UI 渲染（ADR 0076） */
      xForwardedFor: string | null;
      /** ★上 wire 但 UI 不渲染（FR-B07） */
      ipConfidence: string | null;
      /** ★rev5 值恆 `null`（無 GeoIP）＝已知態；本分頁該欄照 rev4 續渲染、畫面恆「-」 */
      region: string | null;
      /** ★rev5 值恆 `null`（無 trace 中介層）＝已知態；UI 渲染恆「-」 */
      traceId: string | null;
    };

    /**
     * 會話事件列 wire 形（`getSessionEvent`；data-model §1.4）
     *
     * ★來源 IP＝單欄 `sourceIp`（表欄 varchar(45) 字串照回）、**非**信任錨四欄組、無 XFF
     * 欄——UI 該分頁不渲染 XFF（結構性無此欄、非豁免）。rev4: 欄形同 rev4-audit.d.ts 之
     * SessionEvent（rev5 表與 rev4 同形、research D9）。
     */
    type SessionEvent = {
      id: number;
      /** RFC3339 帶 offset 字面 */
      createTime: string;
      /** 事件主體 user id（user_id NOT NULL）→ 恆 number */
      userId: number;
      /** 事件主體帳號名（enrich by user_id、查無即 `null`） */
      userName: string | null;
      /** 會話 id */
      sid: string;
      /** 事件型（kicked／idle／logout 等；等值過濾維） */
      eventType: string;
      /** 事件原因（可缺席；等值過濾維） */
      reason: string | null;
      /** 觸發操作者 id（created_by 可空——本人登出等自發事件無操作者） */
      operatorId: number | null;
      /** 觸發操作者帳號名（enrich、查無即 `null`） */
      operatorName: string | null;
      /** 來源 IP 單欄字串（可空；非信任錨四欄組） */
      sourceIp: string | null;
    };

    /**
     * 操作日誌查詢參數（GET `getOperationLog` query；data-model §2）
     *
     * `entityTable`／`operation` 等值；`operatorId`／`operatorName` 人員過濾（id 優先於名、
     * 名→含已軟刪同名全集 IN）。共通欄＝`current`／`size`（分頁）＋`timeFrom`／`timeTo`
     * （UTC RFC3339、閉開 `[from, to)`）。★全欄可缺席、空字串視同未設、畸形不 4xx
     * （寬鬆解析、FR-A05）；畸形時間＝該過濾未設、區間顛倒＝空頁。
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
     * 存取日誌查詢參數（GET `getAccessLog` query；data-model §2）
     *
     * `httpMethod`／`httpStatus` 等值（後端 trim-parse）；`httpPath` 模糊含（ILIKE、萬用
     * 字元字面化＋ESCAPE、走 trgm 索引）；人員過濾同操作日誌。寬鬆解析語意同
     * `OperationLogSearchParams`（FR-A05）。
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
     * 登入嘗試查詢參數（GET `getLoginAttempt` query；data-model §2）
     *
     * `userName`＝attempted_user_name 模糊（ILIKE）；★`success` 收斂為 `'true' | 'false'`
     * 字串聯合（query 無 boolean 載體；後端嚴格比對、值域外＝該過濾未設——contracts §2）；
     * ★`realIp`＝**精確等值**（IPv4 /32、IPv6 /128）比對、非 LIKE 包含（FR-B08、B-078
     * 確認句）。★無人員過濾維（created_by 恆 NULL）。寬鬆解析語意同上（FR-A05）。
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
     * 會話事件查詢參數（GET `getSessionEvent` query；data-model §2）
     *
     * `userId`／`userName` 人員過濾（事件主體、id 優先於名）；`eventType`／`reason` 等值。
     * 寬鬆解析語意同上（FR-A05）。
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
     * 清理標的表白名單（wire 枚舉四值；contracts/wire-audit.md §2）
     *
     * 值域外＝2222 `biz.audit.invalidTable`；後端白名單常數為權威、本型為其 wire 鏡像
     * （枚舉集與後端真源常數的對接斷言＝wire_schema 裁判面、FR-A07）。
     */
    type PurgeAuditTable = 'operationLog' | 'accessLog' | 'loginAttempt' | 'sessionEvent';

    /**
     * 水平線清理請求（POST `purgeAuditLog` json body；data-model §3）
     *
     * ★構造僅二欄（表白名單×保留天數）、不存在挑列刪除路徑；`beforeDays` 下限 30
     * （`PURGE_MIN_DAYS`、後端權威；違反＝2222 `biz.audit.purgeBelowFloor`＋`{minDays}`
     * 明細）。後端寬鬆反序列化（數字字串亦收、畸形→視同缺席→被下限擋、恆不裸 400）；
     * 前端送出形恆 number。
     */
    type PurgeAuditLogReq = {
      table: PurgeAuditTable;
      beforeDays: number;
    };

    /** 水平線清理回應（`deletedCount`＝本次實刪列數；0 亦為成功——水平線前無資料屬正常） */
    type PurgeAuditLogRes = {
      deletedCount: number;
    };
  }
}
