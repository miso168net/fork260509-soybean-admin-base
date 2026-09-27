// [rev6-inline BASE-WEB-ADAPT+ 005-role-menu-crud] 選單管理端點的 wire 型別新檔——以 declaration merging 開 `Api.MenuAdmin` 節、既有 typings 檔零改（specs/005-role-menu-crud/contracts/wire-menu-admin.md）
declare namespace Api {
  /**
   * 選單管理域（選單七端點＋輕量樹 getMenuTree；頁面下拉 getAllPages 回 upstream 既有 `string[]`、本節不另立型）。本節即憲法
   * §I.3 的 wire 權威：`tools/wire-schema.py extract` 由此抽快照、rust 側 `tests/wire_schema.rs` 據快照裁後端 DTO。
   *
   * 自成一節而不掛進 `Api.SystemManage`：該節已有 upstream 的 `Menu`／`MenuList`／`MenuTree` 家族，其中 `MenuList` 與本節
   * 治理清單同 URL、欄名與可空性卻不同（偏離帳＝ADR-00044 決定 9），併入就得逐型改名閃避。
   * 型名與後端 DTO 同名（`handler::menu`）、各型欄序＝wire 欄序。值域型（`MenuType`／`IconType`／`MenuButton`／`EnableStatus`）
   * 引用既有宣告、不另寫第二份字面枚舉。
   * 欄形出處＝rev5:src/typings/api/rev5-menu-admin.d.ts。rev6 差異：型名改與後端 DTO 同名；更新請求型列入不可變欄
   * `routeName`／`menuType`（出現即拒）且名稱欄容 null（＝拒）——型別涵蓋 wire 的全部可達形；請求側 `status`／新增之
   * `menuType`／`iconType` 取寬字串（值域外依欄收斂）。
   */
  namespace MenuAdmin {
    /**
     * 選單列（治理清單與已刪清單之 `records` 元素）。二十八欄恆在場：可空欄 DB NULL 以顯式 `null` 上 wire、不省略欄
     * （ADR-00047 決定 1）；軟刪兩欄以導出旗標 `deleted` 表達。`children` 子集非空才上 wire（葉節點整欄缺席；已刪清單恆缺席）。
     */
    interface MenuRecord {
      /** 後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** DB NULL→0（頂層）；孤兒列（父被直改庫軟刪）顯 DB 原值、在樹中升根 */
      parentId: number;
      /** DB `1`→`'1'`（目錄）、其餘→`'2'`（選單）；建立後不可變 */
      menuType: SystemManage.MenuType;
      menuName: string;
      /** 授權錨；建立後不可變 */
      routeName: string;
      routePath: string | null;
      component: string | null;
      /** DB `1`→`'1'`、其餘（含 NULL）→`'2'`；恆非 null */
      status: Common.EnableStatus;
      hideInMenu: boolean | null;
      keepAlive: boolean | null;
      multiTab: boolean | null;
      constant: boolean | null;
      /** 受保護旗標：API 面唯讀（寫端請求體帶了也不讀） */
      protected: boolean;
      order: number | null;
      icon: string | null;
      /** DB NULL→null、`2`→`'2'`、其餘→`'1'` */
      iconType: SystemManage.IconType | null;
      i18nKey: string | null;
      href: string | null;
      activeMenu: string | null;
      fixedIndexInTab: number | null;
      /** jsonb 直傳 */
      query: { key: string; value: string }[] | null;
      /** jsonb 直傳 */
      buttons: SystemManage.MenuButton[] | null;
      /** 超管備註：只上管理清單——顯示端只准純文字插值 */
      menuMemo: string | null;
      /** 由後端 `deleted_at` 是否有值導出 */
      deleted: boolean;
      /** RFC3339 帶 offset */
      createdAt: string;
      updatedAt: string | null;
      /** 操作者帳號名（不是 uid）；後端查無對應帳號即 null */
      createdBy: string | null;
      updatedBy: string | null;
      children?: MenuRecord[];
    }

    /**
     * 輕量樹節點（`getMenuTree`）：`label`＝選單名稱、`pId`＝樹上的父（頂層與孤兒升根者皆 0）；`children` 子集非空才上 wire
     * （葉節點只三鍵）。wire 形與 upstream `Api.SystemManage.MenuTree` 相同。
     */
    interface MenuTreeRecord {
      id: number;
      label: string;
      pId: number;
      children?: MenuTreeRecord[];
    }

    /**
     * 治理清單與已刪清單共用之 query（全部可空）。`size` 未帶之語意依端點而異：治理清單（`getMenuList/v2`）＝回全部頂層及其
     * 全深子樹、已刪清單（`getDeletedMenus`）＝通則每頁 10 筆。
     */
    type MenuListQuery = CommonType.RecordNullable<Common.CommonSearchParams>;

    /**
     * `addMenu` 請求體。名稱與路由名為前端必送欄（後端寬鬆承載、缺席或 null 交守門判拒）；沒有 `protected` 欄。
     *
     * - `menuType`／`status`：值域外（含缺席）＝取預設 `'1'`；`iconType`：值域外（含缺席）＝NULL。
     * - `parentId`：缺席、null 或 0＝頂層。
     * - 可空文字欄送 null 或空字串皆落 NULL；可空非文字欄送 null＝NULL。
     */
    interface MenuAddReq {
      menuType?: string;
      menuName: string;
      routeName: string;
      parentId?: number | null;
      routePath?: string | null;
      component?: string | null;
      icon?: string | null;
      i18nKey?: string | null;
      href?: string | null;
      activeMenu?: string | null;
      menuMemo?: string | null;
      status?: string;
      hideInMenu?: boolean | null;
      keepAlive?: boolean | null;
      multiTab?: boolean | null;
      constant?: boolean | null;
      order?: number | null;
      fixedIndexInTab?: number | null;
      iconType?: string;
      query?: { key: string; value: string }[] | null;
      buttons?: SystemManage.MenuButton[] | null;
    }

    /**
     * `updateMenu` 請求體（部分更新；ADR-00047 決定 2～4）。除 `id` 外皆可缺席＝不動；沒有 `protected` 欄：
     *
     * - `menuName`：出現即要非空（null 或空字串＝`2222 biz.menu.nameRequired`）。
     * - 可空文字欄：null 或空字串＝清空落 NULL；可空非文字欄：null＝清空落 NULL（`constant` 之 null 與 `false` 同＝清除常量性）。
     * - `status`：非三態，trim 後恰 `'1'`／`'2'` 才算出現、其餘＝缺席；`iconType`：null＝清空、值域外＝缺席。
     * - `parentId`：非三態，null＝缺席、0＝頂層。`buttons: null`＝清空全部按鈕碼。
     * - `routeName`／`menuType`：建立後不可變——出現（含 null、值同現值亦然）即拒（`routeNameImmutable` 先於
     *   `menuTypeImmutable`）；組更新 body 時不得帶此兩欄。
     *
     * 除 `id` 外全欄缺席＝提前 no-op（成功、零變更）。
     */
    interface MenuUpdateReq {
      id: number;
      menuName?: string | null;
      routePath?: string | null;
      component?: string | null;
      icon?: string | null;
      i18nKey?: string | null;
      href?: string | null;
      activeMenu?: string | null;
      menuMemo?: string | null;
      status?: string;
      parentId?: number | null;
      hideInMenu?: boolean | null;
      keepAlive?: boolean | null;
      multiTab?: boolean | null;
      constant?: boolean | null;
      order?: number | null;
      fixedIndexInTab?: number | null;
      iconType?: string | null;
      query?: { key: string; value: string }[] | null;
      buttons?: SystemManage.MenuButton[] | null;
      routeName?: string | null;
      menuType?: string | null;
    }

    /** `deleteMenu`（DELETE 動詞、JSON body）／`restoreMenu`（POST）共用的請求體。 */
    interface MenuIdReq {
      id: number;
    }

    /** `batchDeleteMenu` 請求體（DELETE 動詞、JSON body）；重複 id 由後端先去重、空陣列＝提前成功。 */
    interface MenuBatchDeleteReq {
      ids: number[];
    }
  }
}
