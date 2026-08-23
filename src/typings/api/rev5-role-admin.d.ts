// [rev5-inline BASE-WEB-ADAPT+ 005-role-menu-crud] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-role-admin.md、ADR 0018 同軌先例＝rev5-ip-rule.d.ts）。
declare namespace Api {
  /**
   * role 管理（`/systemManage/*Role*` 六端點；contracts/wire-role-admin.md §1~§6）
   *
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（沿 rev5-ip-rule.d.ts 拍板理由）：demo 殼的
   * `Role`／`RoleSearchParams`／`AllRole` 同名家族仍住在凍結的 system-manage.d.ts，併入就得逐支
   * 改名閃避；獨立命名空間讓消費端寫 `Api.RoleAdmin.RoleRecord`，前綴由命名空間本身承擔。
   * rev4: 承 rev4-role-admin.d.ts 的寫端請求**欄形**，但 rev4 併入 `Api.SystemManage` 且讀端復用
   * demo 型（`createBy` id 字串／`createTime`）＝rev5 差異點——rev5 讀端 wire 依拍板換
   * `createdAt` RFC3339／`createdBy` 帳號名 enrich（004 慣例），demo 型欄名對不上、必須自持。
   */
  namespace RoleAdmin {
    /**
     * 角色列 wire 形（`getRoleList` 之 `records` 元素；contracts §共用型 `RoleRecord`）
     *
     * - `roleMemo` ★本端點帶（R_ADMIN 可見）；`getAllRoles` 不帶——使用者可寫的自由文字，
     *   渲染端 MUST 純文字插值（FR-043、照 004 wbip_memo 範式）。
     * - `status` 恆 `'1'|'2'`（後端 `db_status_to_wire` 二值收斂、非 null——demo 型的
     *   `status: EnableStatus | null` 形不承襲）。
     * - `createdBy`／`updatedBy`＝操作者**帳號名**（後端批次 enrich、查無即 `null`），不是 id。
     * - ★軟刪欄不上 wire（角色刪除單向、無回收桶讀端——contracts 共用型末句）。
     */
    type RoleRecord = {
      /** 主鍵；後端 i64 過 2^53 fail-loud 守衛後以 JSON number 上 wire（憲法 §I.3） */
      id: number;
      /** 角色代碼——★建立後不可變；形制 `^[A-Za-z0-9_]{1,64}$`（權威＝facade 守門） */
      roleCode: string;
      roleName: string;
      roleDesc: string | null;
      /** 管理員備註（★渲染端 MUST 純文字插值） */
      roleMemo: string | null;
      /** 預設首頁路由名（讀端兜底 `resolve_home` 既有；本刀 UI 不編輯、僅忠實承載現值） */
      roleHome: string | null;
      /** `'1'`＝啟用｜`'2'`＝停用（wire 契約字串枚舉、恆非 null） */
      status: Api.Common.EnableStatus;
      /** RFC3339 帶 offset 字面 */
      createdAt: string;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
    };

    /**
     * 下拉項（`getAllRoles`；contracts §共用型 `AllRole`）：恰三欄白名單——
     * ★**無 memo、無審計欄**（FR-008 MUST NOT 帶 memo；欄集本身就是契約面）。
     */
    type AllRole = {
      id: number;
      roleCode: string;
      roleName: string;
    };

    /**
     * 清單查詢參數（`GET getRoleList`；contracts §1）
     *
     * `roleName`／`roleCode` **模糊**比對、`status` 等值（值域外後端沉默＝不濾）；
     * `current`／`size` 沿 §I.3 分頁形。
     */
    type ListQuery = CommonType.RecordNullable<
      {
        roleName: string;
        roleCode: string;
        status: Api.Common.EnableStatus;
      } & Common.CommonSearchParams
    >;

    /** 清單回應（沿 §I.3 分頁形 `{current, size, total, records}`＝後端 envelope::PageRes） */
    type ListRes = Common.PaginatingQueryRecord<RoleRecord>;

    /**
     * 新增請求（`POST addRole`；contracts §3）
     *
     * `status` 缺席（或 null）＝預設啟用；`roleDesc`／`roleMemo`／`roleHome` 空字串由後端
     * `blank_to_none` 落 `None`（來回等價，表單以空字串承載「沒填」即可）。
     */
    type AddReq = {
      roleCode: string;
      roleName: string;
      roleDesc?: string | null;
      roleMemo?: string | null;
      roleHome?: string | null;
      status?: Api.Common.EnableStatus | null;
    };

    /**
     * 更新請求（`POST updateRole`；contracts §4；三態語意＝ADR 0023）
     *
     * ★**結構性無 `roleCode` 欄**：契約「出現即拒」（`2222 codeImmutable`、值不比對）——
     * rev4 UpdateRoleReq 收 roleCode（後端等值放行）＝rev5 差異點不帶回；型別層把誤送
     * 直接擋在編譯期。三個 nullable 欄＝三態：缺席不動／null 清空／有值設值。
     */
    type UpdateReq = {
      id: number;
      roleName?: string;
      roleDesc?: string | null;
      roleMemo?: string | null;
      roleHome?: string | null;
      status?: Api.Common.EnableStatus | null;
    };

    // ── 006-authz-governance 追加：三維授權治理（contracts/wire-authz-governance.md 九端點）＋roleHome
    //    （005 contracts/wire-role-admin.md §7／§8 既判形、本刀首個 UI 消費者）。★仍住 `Api.RoleAdmin`
    //    （不另開命名空間、不併 `Api.SystemManage`——research R2#16）；角色鍵一律 `id`（FR-003，rev4 `roleId` 不帶回）。

    /**
     * 端點雙鍵（contracts 共用型 `Endpoint`）：`getAllEndpoints` 回應項＝`updateRoleEndpoints` 期望項、同形共用；
     * 讀端現況項（`RoleEndpointItem`）再加 `protected`。`method`＝HTTP 動詞大寫字面（後端以方法白名單辨識端點維列）。
     * rev4: 承 rev4-role-admin.d.ts `Endpoint` 欄形；rev4 併入 `Api.SystemManage`＝差異點不帶回。
     */
    type Endpoint = {
      path: string;
      method: string;
    };

    /**
     * 選單維授權現況項（`GET getRoleMenu`；contracts §1）：`id`＝選單 id（治理域自 `route_name` 反向映射、
     * 歷史孤兒不反射）；`protected`＝受保護授權（後端單一真源、FR-004）——前端據此預標鎖定（TreeOption
     * `disabled`＋受控 checked-keys 補回），撤銷集觸及即整批 `2222 biz.role.protectedRevoke`（後端最終防線）。
     * ★rev4 零藍本（rev4 讀端回裸 `number[]`、無 protected 旗標）。
     */
    type RoleMenuItem = {
      id: number;
      protected: boolean;
    };

    /** 按鈕維授權現況項（`GET getRoleButton`；contracts §3）：`code`＝按鈕碼；`protected` 語意同 `RoleMenuItem`。 */
    type RoleButtonItem = {
      code: string;
      protected: boolean;
    };

    /** 端點維授權現況項（`GET getRoleEndpoints`；contracts §5）：`Endpoint` 雙鍵＋`protected`（語意同 `RoleMenuItem`）。 */
    type RoleEndpointItem = {
      path: string;
      method: string;
      protected: boolean;
    };

    /**
     * 三維寫端回應（contracts 共用型 `GrantResult<T>`）：`revoked`／`granted`＝本次實際撤銷／授予數（空 diff 皆 0、
     * 仍 Applied）；`effective`＝orphan skip 後實際生效之期望全集（menu→`number[]`／button→`string[]`／
     * endpoint→`Endpoint[]`）。三 modal 目前只看 `error` 是否為真、不消費本體（契約整套落齊、留給日後對賬面）。
     * ★rev4 寫端回 `null`＝差異點不帶回。
     */
    type GrantResult<T> = {
      revoked: number;
      granted: number;
      effective: T[];
    };

    /**
     * 三支寫端回應之具體別名（`GrantResult` 逐維實例化）。★主線工程拍板（非契約新增、契約仍以泛型 `GrantResult<T>`
     * 為準）：wire-schema 抽取器對未實例化的泛型別名不產具體 definition、U10 裁判需具體 definition 可判，故三支
     * fetcher 回傳型取此三別名；本體語意見 `GrantResult`。
     */
    type RoleMenuGrantRes = GrantResult<number>;
    type RoleButtonGrantRes = GrantResult<string>;
    type RoleEndpointGrantRes = GrantResult<Endpoint>;

    /**
     * 選單維全量替換請求（`POST updateRoleMenu`；contracts §2）：`menuIds`＝期望全集（★含 protected 項須原樣帶回——
     * 撤銷集觸及 protected 即整批拒）；候選＝治理域（未刪含停用）、界外 id 靜默略過。
     * rev4: 承 rev4 `UpdateRoleMenuReq` 欄形；角色鍵 rev4 `roleId`→rev5 `id`（差異點不帶回）。
     */
    type UpdateRoleMenuReq = {
      id: number;
      menuIds: number[];
    };

    /** 按鈕維全量替換請求（`POST updateRoleButton`；contracts §4）：`buttons`＝期望全集（按鈕碼）；語意同 `UpdateRoleMenuReq`。 */
    type UpdateRoleButtonReq = {
      id: number;
      buttons: string[];
    };

    /**
     * 端點維全量替換請求（`POST updateRoleEndpoints`；contracts §6）：`endpoints`＝期望全集（雙鍵）；守門固定序＝
     * protected 整批拒（`protectedRevoke`）→結構性封死（非 R_SUPER 授 protected 端點＝`protectedGrant`、零變更）。
     */
    type UpdateRoleEndpointsReq = {
      id: number;
      endpoints: Endpoint[];
    };

    /**
     * 角色首頁讀端回應（`GET getRoleHome`；005 contracts §7）：`home`＝`role_home` 路由名、★誠實 `null`（未設即 null、
     * 不摺疊空字串）。rev4: rev4 回裸 `string`、NULL 摺疊空字串＝差異點不帶回（research R2#9）。
     */
    type RoleHomeRes = {
      home: string | null;
    };

    /**
     * 角色首頁寫端請求（`POST updateRoleHome`；005 contracts §8）：`home` 顯式 `null`／缺席／空字串三形同義＝清空
     * （前端 NSelect `clearable` 清空即送 `null`）；落庫不驗可見樹一致性（讀端 `resolve_home` 兜底）。
     * rev4: 承 rev4 `UpdateRoleHomeReq` 欄形；角色鍵 rev4 `roleId`→rev5 `id`、`home` 由 `string` 放寬為可 null。
     */
    type UpdateRoleHomeReq = {
      id: number;
      home: string | null;
    };
  }

  /**
   * 授權回收桶（`/systemManage/getArchivedPolicies`／`restorePolicy` 兩端點；
   * contracts/wire-policy-archive.md）
   *
   * ★**獨立命名空間、不併進 `Api.SystemManage` 亦不塞進 `Api.RoleAdmin`**（沿本檔與
   * rev5-ip-rule.d.ts 拍板理由）：回收桶是 casbin 歸檔列的讀／復原面，與角色 CRUD 是兩個
   * 資源；消費端寫 `Api.PolicyArchive.ArchivedPolicy`，前綴由命名空間承擔。
   * rev4: 承 rev4-role-admin.d.ts 之 ArchivedPolicy 家族**欄形**，但 rev4 併入 `Api.SystemManage`
   * 且 `archivedBy` 為 uid＝rev5 差異點——rev5 改帳號名 enrich（`string | null`，004 慣例）。
   */
  namespace PolicyArchive {
    /** 歸檔維度（後端由 `v2` 推導隨列下發：`menu`／`button`＝維度標記、其餘 HTTP 方法＝`endpoint`） */
    type ArchivedPolicyDimension = 'menu' | 'button' | 'endpoint';

    /**
     * 歸檔列 wire 形（`getArchivedPolicies` 之 `records` 元素；contracts §共用型、恰 14 欄）
     *
     * - `ptype`／`v0`～`v5`＝casbin 原始欄原樣過境（`v0` 來源角色代碼、`v1` 授權標的、
     *   `v2` 維度標記或 HTTP 方法、`v3`～`v5` 空字串）。
     * - `archiveReason`＝封閉詞彙**原字面**（頁面不映譯、沿 rev4／CDP 基準）。
     * - `archivedBy`＝操作者**帳號名**（後端批次 enrich、查無即 `null`），不是 id。
     * - `roleId`＝來源角色識別；歷史列可為 `null`（誠實退化、不可復原）。
     * - `restorable`＝後端派生旗標（reason gate／同實例／封死不擋／端點在冊逐腿合取；
     *   選單維／按鈕維恆 `false`）——★前端只據此切停用態，後端為最終防線。
     */
    type ArchivedPolicy = {
      /** 歸檔列 id（restore 請求鍵；後端 i64 過 2^53 守衛後以 JSON number 上 wire） */
      id: number;
      /** 恆 `'p'` */
      ptype: string;
      v0: string;
      v1: string;
      v2: string;
      v3: string;
      v4: string;
      v5: string;
      archiveReason: string;
      /** RFC3339 帶 offset 字面 */
      archivedAt: string;
      archivedBy: string | null;
      roleId: number | null;
      restorable: boolean;
      dimension: ArchivedPolicyDimension;
    };

    /**
     * 清單查詢參數（`GET getArchivedPolicies`；contracts §1）
     *
     * `roleCode` **等值**濾 `v0`（空字串忽略）、`dimension` 等值（未知值後端靜默不濾）；
     * `current`／`size` 沿 §I.3 分頁形（後端預設 1／10、`size` clamp 至 `[1, 100]`）。
     */
    type ArchivedPolicyListQuery = CommonType.RecordNullable<
      {
        roleCode: string;
        dimension: ArchivedPolicyDimension;
      } & Common.CommonSearchParams
    >;

    /** 清單回應（沿 §I.3 分頁形 `{current, size, total, records}`；穩定序 `archived_at DESC, id DESC`） */
    type ArchivedPolicyListRes = Common.PaginatingQueryRecord<ArchivedPolicy>;
  }
}
