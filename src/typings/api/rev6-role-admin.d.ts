// [rev6-inline BASE-WEB-ADAPT+ 005-role-menu-crud] 角色管理八端點的 wire 型別新檔——以 declaration merging 開 `Api.RoleAdmin` 節、既有 typings 檔零改（specs/005-role-menu-crud/contracts/wire-role-admin.md）
declare namespace Api {
  /**
   * 角色管理域（角色六端點＋角色首頁讀寫兩端點）。本節即憲法 §I.3 的 wire 權威：`tools/wire-schema.py extract` 由此抽快照、
   * rust 側 `tests/wire_schema.rs` 據快照裁後端 DTO。
   *
   * 自成一節而不掛進 `Api.SystemManage`：該節已有 upstream 的 `Role`／`RoleSearchParams`／`RoleList` 家族，其中 `RoleList`
   * 與本節清單同 URL、欄名與可空性卻不同（偏離帳＝ADR-00044 決定 9），併入就得逐型改名閃避。
   * 型名與後端 DTO 同名（`handler::role`）、各型欄序＝wire 欄序。下拉（getAllRoles）不在本節另立型：其 wire 形與 upstream
   * `Api.SystemManage.AllRole` 相同，wrapper 直接回該型。
   * 欄形出處＝rev5:src/typings/api/rev5-role-admin.d.ts。rev6 差異：型名改與後端 DTO 同名；更新請求型列入不可變欄 `roleCode`
   * （出現即拒）且名稱欄容 null（＝拒）——型別涵蓋 wire 的全部可達形；請求側 `status` 取寬字串（值域外＝缺席）。
   */
  namespace RoleAdmin {
    /**
     * 清單列（`getRoleList` 之 `records` 元素）。十一欄恆在場：可空欄 DB NULL 以顯式 `null` 上 wire、不省略欄（ADR-00047
     * 決定 1）；軟刪欄不上 wire（角色無回收桶）。
     */
    interface RoleRecord {
      /** 後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立後不可變 */
      roleCode: string;
      roleName: string;
      roleDesc: string | null;
      /** 超管備註：只上管理清單（下拉不帶）——顯示端只准純文字插值 */
      roleMemo: string | null;
      /** 首頁路由名現值：忠實回、讀端不兜底 */
      roleHome: string | null;
      /** DB `1`→`'1'`、其餘（含 NULL）→`'2'`；恆非 null */
      status: Common.EnableStatus;
      /** RFC3339 帶 offset */
      createdAt: string;
      updatedAt: string | null;
      /** 操作者帳號名（不是 uid）；後端查無對應帳號即 null */
      createdBy: string | null;
      updatedBy: string | null;
    }

    /**
     * 清單 query：分頁兩欄沿 `Common.CommonSearchParams`，三個篩選條件皆可空、彼此 AND（名稱與代碼為不分大小寫子字串、
     * 空字串＝不篩選）。`status` 為**字串**形：trim 後恰 `'1'`／`'2'` 才等值篩選、其餘（含空字串）＝不篩選。
     */
    type RoleListQuery = CommonType.RecordNullable<
      Common.CommonSearchParams & {
        roleName: string;
        roleCode: string;
        status: string;
      }
    >;

    /**
     * `addRole` 請求體。代碼與名稱為前端必送欄（後端寬鬆承載、缺席或 null 交守門判拒）；三個可空文字欄送 null 或空字串皆
     * 落 NULL；`status` 值域外（含缺席）＝取預設啟用。
     */
    interface RoleAddReq {
      roleCode: string;
      roleName: string;
      roleDesc?: string | null;
      roleMemo?: string | null;
      roleHome?: string | null;
      status?: string;
    }

    /**
     * `updateRole` 請求體（部分更新；ADR-00047 決定 2～4）。除 `id` 外皆可缺席＝不動：
     *
     * - `roleName`：出現即要非空（null 或空字串＝`2222 biz.role.nameRequired`）。
     * - 三個可空文字欄：null 或空字串＝清空落 NULL、有值＝設值。
     * - `status`：非三態，trim 後恰 `'1'`／`'2'` 才算出現、其餘＝缺席。
     * - `roleCode`：建立後不可變——出現（含 null、值同現值亦然）即 `2222 biz.role.codeImmutable`；組更新 body 時不得帶此欄。
     *
     * 除 `id` 外全欄缺席＝提前 no-op（成功、零變更）。
     */
    interface RoleUpdateReq {
      id: number;
      roleName?: string | null;
      roleDesc?: string | null;
      roleMemo?: string | null;
      roleHome?: string | null;
      status?: string;
      roleCode?: string | null;
    }

    /** `deleteRole` 請求體（DELETE 動詞、JSON body）。 */
    interface RoleIdReq {
      id: number;
    }

    /** `batchDeleteRole` 請求體（DELETE 動詞、JSON body）；重複 id 由後端先去重、空陣列＝提前成功。 */
    interface RoleBatchDeleteReq {
      ids: number[];
    }

    /** `getRoleHome` 的 query。 */
    interface RoleHomeQuery {
      id: number;
    }

    /** `getRoleHome` 回應：恰 `{home}`＝首頁路由名現值，未設＝顯式 `null`（不省略欄、不摺疊成空字串）。 */
    interface RoleHomeRes {
      home: string | null;
    }

    /**
     * `updateRoleHome` 請求體（**非**部分更新）：`home` 缺席、null、空字串三形同義＝清空落 NULL；值同現值亦寫入。後端不驗
     * 「首頁是否在該角色可見樹內」。
     */
    interface RoleHomeUpdateReq {
      id: number;
      home: string | null;
    }
  }
}
