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
  }
}
