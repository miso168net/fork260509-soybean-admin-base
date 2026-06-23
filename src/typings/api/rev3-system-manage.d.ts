// [rev3-inline 009-user-management ADAPT §III.1] 使用者寫端 DTO 型（declaration-merge 進 Api.SystemManage）
// fork-delta：不改既有 system-manage.d.ts；本檔僅【新增】寫端 write DTO
declare namespace Api {
  namespace SystemManage {
    // [rev3-inline 014-auth-token-session ADAPT US2] per-user session 策略 wire literal union（對齊 rust honest emit inherit/on/off）
    //   ★ honest wire：getUserList item runtime JSON 含 sessionPolicy（型未在 frozen User 宣告）；resolve_policy 用之決 7777
    type SessionPolicy = 'inherit' | 'on' | 'off';

    /**
     * user upsert model（addUser/updateUser write DTO）
     *
     * - id 可選：add 無 id、update 有 id
     * - id 型用 number 對齊 component（User.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - 無 password（後端 UserUpsertReq 不含 password）
     * - userRoles wire＝sys_role.code[]（讀寫皆 code）
     * - [014] sessionPolicy 用【intersection】加（User frozen 無此欄、不可塞 Pick tuple）；optional、create 端可不送（後端 default inherit）
     */
    type UserUpsertModel = Pick<
      User,
      'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
    > & { id?: number; sessionPolicy?: SessionPolicy };

    // [rev3-inline 014-auth-token-session ADAPT US2 / 016-button-endpoint-policy ADAPT D5] getUserList honest list-item 型
    //   ★ rust wire 確實 emit sessionPolicy（camelCase）；frozen User 未宣告 → 以 intersection 補供 drawer edit 讀 rowData.sessionPolicy
    //   ★ [016 D5] nickName/userPhone/userEmail 在 frozen User 宣告為 string（non-null），但 rust wire 為 Option<String>（回 null）；
    //     declaration-merge 不能覆寫既有欄型 → 以 Omit+intersection rev3-owned honest 讀型消型謊
    type UserListItemRev3 = Omit<User, 'nickName' | 'userPhone' | 'userEmail'> & {
      nickName: string | null;
      userPhone: string | null;
      userEmail: string | null;
      sessionPolicy: SessionPolicy;
    };

    // [rev3-inline 016-button-endpoint-policy ADAPT D5] getRoleList honest list-item 型
    //   ★ frozen Role.roleDesc 宣告為 string（non-null），但 rust RoleListItem.role_desc 為 Option<String>（回 null）；
    //     declaration-merge 不能覆寫既有欄型 → 以 Omit+intersection rev3-owned honest 讀型消型謊
    type RoleListItemRev3 = Omit<Role, 'roleDesc'> & { roleDesc: string | null };

    // [rev3-inline 010-menu-management ADAPT §9 L1/L2] 選單寫端 DTO 型＋統一清單 deleted flag（declaration-merge、不改既有 Menu/Api.Route）
    /**
     * menu upsert model（addMenu/updateMenu write DTO）
     *
     * - id 可選：add 無 id、update 有 id（含搬移父層）
     * - id 型用 number 對齊 component（Menu.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - parentId number：0=頂層（後端寫端 0→None）；reparent 由後端 3+1 guard 守門
     * - Pick 鍵與既有 Menu 實際欄一致（menu-operate-modal Model 子集）
     */
    type MenuUpsertModel = Pick<
      Menu,
      | 'parentId'
      | 'menuType'
      | 'menuName'
      | 'routeName'
      | 'routePath'
      | 'component'
      | 'icon'
      | 'iconType'
      | 'i18nKey'
      | 'status'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
      | 'buttons'
    > & { id?: number };

    /**
     * 統一清單列型（getMenuList/v2 回 list_all、含已軟刪除節點）
     *
     * - 既有 Menu 為 `type`（非 interface）無法 declaration-merge → 以 Menu 為基底擴 deleted flag
     * - deleted:bool（後端 deleted_at.is_some()）；側欄/動態選單/getMenuTree 恆不含已刪
     * - children 收斂為 MenuListItem（樹遞迴）
     */
    type MenuListItem = Omit<Menu, 'children'> & {
      /** 是否已軟刪除（統一清單回收桶用） */
      deleted?: boolean;
      children?: MenuListItem[] | null;
    };

    // [rev3-inline 011-role-management ADAPT §10 L1/L2] 角色寫端 DTO 型（declaration-merge、不改既有 Role）
    /**
     * role upsert model（addRole/updateRole write DTO）
     *
     * - id 可選：add 無 id、update 有 id
     * - id 型用 number 對齊 component（Role.id:number / table id:number）；
     *   wrapper 內 String(id) 轉字串對齊後端 String 欄（見 rev3-system-manage.ts）
     * - Pick 鍵與既有 Role 實際欄一致（role-operate-drawer Model 子集）
     */
    type RoleUpsertModel = Pick<Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'> & { id?: number };

    // [rev3-inline 012-audit-log-query ADAPT] 審計查詢讀端 3 item／3 SearchParams／3 List（honest 逐欄、不套 Common.CommonRecord）
    // wire 事實（主線親抓實機 JSON 對齊；端點皆 R_SUPER GET、回 PageRes{current,size,total,records}、code 0000）
    //   ★ payload 型＝unknown|null（實測 casbin 列＝string[]、role/user 列＝物件、是任意 JSON；用 Record 會型謊）
    //   ★ nullable 欄逐欄標 |null（operatorName/traceId/xForwardedFor/region/entityId 等）

    // [rev3-inline 013-xff-real-ip-forensics ADAPT §6/§7] IP 鑑識可信度 wire literal union（對齊 rust serde 7 字串輸出）
    //   ★ honest wire：歷史列無此值→null（不回填）；NTag 依七態著色（顯示見 audit view）
    type IpConfidence =
      | 'cdn_verified'
      | 'cdn_anchored'
      | 'proxy_clean'
      | 'proxy_soft'
      | 'direct'
      | 'cdn_mismatch'
      | 'fallback';

    /**
     * operation log item（GET getOperationLog；操作異動稽核列）
     *
     * - operation：enum 字串 INSERT|UPDATE|SOFT_DELETE|RESTORE
     * - [013] 四欄鑑識（operator_ 前綴）：operatorPeerIp（直連 peer）／operatorRealIp（解析真值，←operatorIp 改名）／
     *   operatorXForwardedFor（原始鏈）／operatorIpConfidence（七態 literal）；皆 host 去 mask、歷史列 null
     * - payloadBefore/After：任意 JSON（casbin 列=string[]、role/user 列=物件）→ unknown|null、展開列 JSON.stringify 渲染
     */
    type OperationLogItem = {
      id: number;
      operation: string;
      entityTable: string;
      entityId: number | null;
      operatorId: number | null;
      operatorName: string | null;
      operatorPeerIp: string | null;
      operatorRealIp: string | null;
      operatorXForwardedFor: string | null;
      operatorIpConfidence: IpConfidence | null;
      traceId: string | null;
      createTime: string;
      payloadBefore: unknown | null;
      payloadAfter: unknown | null;
    };

    /**
     * access log item（GET getAccessLog；API 存取稽核列）
     *
     * - operatorId：NOT NULL（已認證請求記錄）
     * - [013] 四欄鑑識：peerIp（直連 peer，可 null）／realIp（解析後真值，NN，←clientIp 改名）／
     *   xForwardedFor（原始 XFF 標頭，可 null）／ipConfidence（七態 literal，可 null）
     * - region：ip2region 字串（如 "0|0|0|内网IP|内网IP"）、可 null
     */
    type AccessLogItem = {
      id: number;
      operatorId: number;
      operatorName: string | null;
      method: string;
      path: string;
      httpStatus: number;
      peerIp: string | null;
      realIp: string;
      xForwardedFor: string | null;
      ipConfidence: IpConfidence | null;
      region: string | null;
      traceId: string | null;
      createTime: string;
    };

    /**
     * login attempt item（GET getLoginAttempt；登入嘗試稽核列）
     *
     * - attemptedUserName：嘗試帳號（成敗皆記）
     * - success：成敗 bool；operatorId/operatorName：成功時可解析、失敗時 null
     * - [013] 四欄鑑識：peerIp／realIp（NN，←clientIp 改名）／xForwardedFor／ipConfidence（同 access）
     */
    type LoginAttemptItem = {
      id: number;
      attemptedUserName: string;
      success: boolean;
      operatorId: number | null;
      operatorName: string | null;
      peerIp: string | null;
      realIp: string;
      xForwardedFor: string | null;
      ipConfidence: IpConfidence | null;
      region: string | null;
      createTime: string;
    };

    /**
     * operation log search params（filter 欄 optional + current/size）
     *
     * - 文字/IP 模糊：entityTable/operatorName/operatorRealIp/operatorPeerIp/operatorXForwardedFor/traceId；下拉精確：operation/operatorIpConfidence
     * - [013] operatorIp→operatorRealIp 改名（對齊 rust U2 filter 改名、否則篩失效）；
     *   U4 新增 operatorPeerIp（模糊）/operatorXForwardedFor（模糊）/operatorIpConfidence（七態下拉精確）
     * - entityId 精確；createdFrom/createdTo＝ISO/RFC3339 字串範圍
     */
    type OperationLogSearchParams = CommonType.RecordNullable<
      {
        entityTable: string;
        operation: string;
        operatorName: string;
        operatorRealIp: string;
        operatorPeerIp: string;
        operatorIpConfidence: IpConfidence;
        operatorXForwardedFor: string;
        entityId: number;
        traceId: string;
        createdFrom: string;
        createdTo: string;
      } & CommonSearchParams
    >;

    /**
     * access log search params（filter 欄 optional + current/size）
     *
     * - 文字/IP 模糊：operatorName/path/realIp/peerIp/xForwardedFor/region；下拉精確：method/ipConfidence；httpStatus 精確
     * - [013] clientIp→realIp 改名（對齊 rust U2 filter 改名）；U4 新增 peerIp（模糊）/ipConfidence（七態下拉精確）
     * - createdFrom/createdTo＝ISO/RFC3339 字串範圍
     */
    type AccessLogSearchParams = CommonType.RecordNullable<
      {
        operatorName: string;
        method: string;
        path: string;
        httpStatus: number;
        /** [017 C-1] http_status 類別 quick-filter（'2xx'|'4xx'|'5xx'；與 httpStatus 精確並存＝AND；RecordNullable 自動 nullable） */
        httpStatusClass: '2xx' | '4xx' | '5xx';
        realIp: string;
        peerIp: string;
        ipConfidence: IpConfidence;
        xForwardedFor: string;
        region: string;
        createdFrom: string;
        createdTo: string;
      } & CommonSearchParams
    >;

    /**
     * login attempt search params（filter 欄 optional + current/size）
     *
     * - 文字/IP 模糊：attemptedUserName/realIp/peerIp/xForwardedFor/region；下拉精確：success（bool）/ipConfidence
     * - [013] clientIp→realIp 改名（對齊 rust U2 filter 改名）；U4 新增 peerIp（模糊）/ipConfidence（七態下拉精確）
     * - createdFrom/createdTo＝ISO/RFC3339 字串範圍
     */
    type LoginAttemptSearchParams = CommonType.RecordNullable<
      {
        attemptedUserName: string;
        success: boolean;
        realIp: string;
        peerIp: string;
        ipConfidence: IpConfidence;
        xForwardedFor: string;
        region: string;
        createdFrom: string;
        createdTo: string;
      } & CommonSearchParams
    >;

    /** operation log list（PageRes 分頁包） */
    type OperationLogList = Common.PaginatingQueryRecord<OperationLogItem>;

    /** access log list（PageRes 分頁包） */
    type AccessLogList = Common.PaginatingQueryRecord<AccessLogItem>;

    /** login attempt list（PageRes 分頁包） */
    type LoginAttemptList = Common.PaginatingQueryRecord<LoginAttemptItem>;

    // [rev3-inline 015-policy-governance MODAL-WIRING(e)] 授權回收桶讀端 item／SearchParams／List（honest 逐欄、對齊 rust EU2 wire）
    // wire 事實（rust getArchivedPolicies handler 親抓欄序；GET、R_SUPER、回 PageRes{current,size,total,records}、code 0000）
    //   ★ honest 逐欄：roleCode/target/dimension/archiveReason 為 NN 字串；archivedBy（撤銷執行者 id）可 null；
    //     createdTime（原規則建立時間，archive.created_at 可 NULL）→ string|null
    /**
     * archived policy item（GET getArchivedPolicies；已撤銷授權規則封存列）
     *
     * - roleCode：原規則所屬角色 code（如 R_USER_COMMON）
     * - target：原規則目標（如 menu route_name）／dimension：維度（menu/button/endpoint）
     * - archivedTime：撤銷時間／archivedBy：撤銷執行者 id（可 null）／archiveReason：撤銷原因
     * - createdTime：原規則建立時間（archive.created_at 可 NULL → string|null）
     */
    type ArchivedPolicy = {
      id: number;
      roleCode: string;
      target: string;
      dimension: string;
      archivedTime: string;
      archivedBy: number | null;
      archiveReason: string;
      createdTime: string | null;
    };

    /**
     * archived policy search params（filter 欄 optional + current/size）
     *
     * - roleCode/dimension：模糊/精確檢視（rust handler 空字串守門→當未設）
     */
    type ArchivedPolicySearchParams = CommonType.RecordNullable<
      {
        roleCode: string;
        dimension: string;
      } & CommonSearchParams
    >;

    /** archived policy list（PageRes 分頁包） */
    type ArchivedPolicyList = Common.PaginatingQueryRecord<ArchivedPolicy>;

    // [rev3-inline 016-button-endpoint-policy ADAPT D4] 三維授權編輯讀寫 DTO（button/endpoint；declaration-merge、honest 逐欄）
    // wire 事實（rust U1/U2 已落地）：getAllButtons→Button[]{code,label}／getRoleButton→string[]（code 集）／
    //   updateRoleButton {roleId,buttonCodes}→null；getAllEndpoints→Endpoint[]{path,method,label?}／getRoleEndpoints→Endpoint[]／
    //   updateRoleEndpoints {roleId,endpoints}→null；撤 protected endpoint→2222 biz.role.endpointProtected（攔截器自動在地化）
    //   ★ roleId 維 number（⚠️r、與單 body-id 非對稱、不 String()）

    /**
     * operation button（getAllButtons registry item／角色按鈕授權勾選項）
     *
     * - code：按鈕代碼（如 user:add）＝授權鍵；label：顯易讀（後端 sys_menu.buttons 的 desc）
     */
    type Button = {
      code: string;
      label: string;
    };

    /**
     * API endpoint（getAllEndpoints registry item／角色端點授權勾選項）
     *
     * - path＋method 雙鍵標識一條 (role,path,method) enforce 列；label 顯易讀（可選）
     */
    type Endpoint = {
      path: string;
      method: string;
      label?: string;
    };

    /**
     * role button update body（updateRoleButton；roleId 維 number ⚠️r）。
     * [rev3 sweep §3.B] 現未引用（updateRoleButton 走 inline body 型）；保留供未來具名化、BASE-WEB-ADAPT 軌禁刪。
     */
    type RoleButtonUpdate = {
      roleId: number;
      buttonCodes: string[];
    };

    /**
     * role endpoints update body（updateRoleEndpoints；roleId 維 number ⚠️r）。
     * [rev3 sweep §3.B] 現未引用（updateRoleEndpoints 走 inline body 型）；保留供未來具名化、BASE-WEB-ADAPT 軌禁刪。
     */
    type RoleEndpointsUpdate = {
      roleId: number;
      endpoints: Endpoint[];
    };
  }
}
