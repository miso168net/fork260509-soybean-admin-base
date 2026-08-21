// [rev5-inline BASE-WEB-ADAPT+ 005-role-menu-crud] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-menu-admin.md、同軌先例＝rev5-role-admin.d.ts）。
declare namespace Api {
  /**
   * menu 管理（`/systemManage/*Menu*` 六端點；contracts/wire-menu-admin.md §1~§6）
   *
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（沿 rev5-role-admin.d.ts 拍板理由）：demo 殼的
   * `Menu`／`MenuList`／`MenuTree` 同名家族仍住在凍結的 system-manage.d.ts，併入就得逐支
   * 改名閃避；獨立命名空間讓消費端寫 `Api.MenuAdmin.MenuRecord`，前綴由命名空間本身承擔。
   * rev4: 承 rev4-menu-admin.d.ts 的寫端請求**欄形**，但 rev4 併入 `Api.SystemManage` 且讀端
   * 復用 demo 型（`createBy` id 字串／`createTime`）＝rev5 差異點——rev5 讀端 wire 依拍板換
   * `createdAt` RFC3339／`createdBy` 帳號名 enrich（004 慣例），且 `protected`／`menuMemo`／
   * `deleted` 三欄 demo 型皆無、必須自持。
   * ★值域收斂型（`MenuType`／`IconType`／`EnableStatus`／`MenuButton`）跨命名空間復用既有
   * 宣告——引用不改動凍結檔，且免第二份字面枚舉漂移面。
   */
  namespace MenuAdmin {
    /**
     * 選單樹列 wire 形（`getMenuList/v2` 之 `records` 元素；contracts §共用型 `MenuRecord` 28 欄）
     *
     * - `parentId` 頂層＝0（DB NULL↔wire 0 映射照 rev4）；`menuType`／`routeName` ★建立後不可變。
     * - `status` 恆 `'1'|'2'`（後端二值收斂、非 null）；`iconType` 誠實 null（rev4「缺欄退 '1'」
     *   形不帶回）。
     * - `protected`＝受保護旗標（刪除守門第一腿；本刀唯讀呈現）；`deleted`＝軟刪導出旗標
     *   （回收桶辨識；治理域讀端恆 false、已刪集合讀端〔U12〕恆 true）。
     * - `menuMemo` ★列表帶（B-003 語意：R_SUPER 備註）——使用者可寫的自由文字，渲染端 MUST
     *   純文字插值（FR-043、照 004 wbip_memo 範式）。
     * - `i18nKey` wire 誠實 `string | null`（DB 自由字串；App.I18n.I18nKey 聯合型屬前端路由
     *   自有值域、不入 wire 契約——消費端顯示時自行收斂）。
     * - `query`／`buttons` jsonb 直傳；`buttons` 變更觸發絕版歸檔判定（契約 §4）。
     * - `createdBy`／`updatedBy`＝操作者**帳號名**（後端批次 enrich、查無即 `null`），不是 id。
     * - `children` 樹形組裝（getMenuList/v2 記錄＝頂層列＋全深子樹）；葉節點欄位缺席（非 null）。
     */
    type MenuRecord = {
      /** 主鍵；後端 i64 過 2^53 fail-loud 守衛後以 JSON number 上 wire（憲法 §I.3） */
      id: number;
      /** 父選單 id；頂層＝0 */
      parentId: number;
      /** `'1'`目錄｜`'2'`選單——★建立後不可變（updateMenu 出現即拒） */
      menuType: Api.SystemManage.MenuType;
      menuName: string;
      /** 路由名稱——★建立後不可變；活性唯一（雙層守門） */
      routeName: string;
      routePath: string | null;
      component: string | null;
      /** `'1'`＝啟用｜`'2'`＝停用（wire 契約字串枚舉、恆非 null） */
      status: Api.Common.EnableStatus;
      hideInMenu: boolean | null;
      keepAlive: boolean | null;
      /** ★可寫欄（user 拍板 2026-08-19 照 rev4 as-built；契約 MenuRecord 補漏列） */
      multiTab: boolean | null;
      /** 常量路由旗標；可寫、受父鏈常量性守門（島 H3） */
      constant: boolean | null;
      /** 受保護旗標（deleteMenu 守門第一腿；本刀唯讀呈現、不提供旗標管理） */
      protected: boolean;
      order: number | null;
      icon: string | null;
      iconType: Api.SystemManage.IconType | null;
      i18nKey: string | null;
      href: string | null;
      activeMenu: string | null;
      fixedIndexInTab: number | null;
      /** 路由參數（jsonb 直傳） */
      query: { key: string; value: string }[] | null;
      /** 按鈕碼集（jsonb 直傳；變更觸發絕版歸檔判定） */
      buttons: Api.SystemManage.MenuButton[] | null;
      /** 管理員備註（★渲染端 MUST 純文字插值） */
      menuMemo: string | null;
      /** `deleted_at.is_some()` 導出（回收桶辨識） */
      deleted: boolean;
      /** RFC3339 帶 offset 字面 */
      createdAt: string;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
      /** 子樹（非空才插、葉節點缺席） */
      children?: MenuRecord[];
    };

    /**
     * 父選擇器輕量樹節點（`getMenuTree`；contracts §共用型 `MenuTree`——照 rev4 形；
     * treeSelect 消費）：治理域全樹（未刪含停用、不含已刪）。
     */
    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };

    /**
     * 樹清單查詢參數（`GET getMenuList/v2`；contracts §1）
     *
     * `current`／`size` ★分頁以頂層計；全可缺席——無參呼叫形＝後端預設 current 1／size 100
     * 一次取全樹（size clamp 常數 [1,100]＝rev4 as-built、與前端 hook 無參呼叫形對齊）。
     */
    type ListQuery = CommonType.RecordNullable<Common.CommonSearchParams>;

    /** 樹清單回應（沿 §I.3 分頁形 `{current, size, total, records}`＝後端 envelope::PageRes） */
    type ListRes = Common.PaginatingQueryRecord<MenuRecord>;

    /**
     * 新增請求（`POST addMenu`；contracts §3＝MenuRecord 可寫欄集——無 id／protected／
     * deleted／審計欄）
     *
     * - 守門序＝parent 驗證（存在未刪、停用不擋、`parentId` 0＝頂層豁免）→防環→routeName
     *   活性唯一→constant 父鏈→形制；零 casbin 寫（新選單零授權、側欄不現＝已知態③）。
     * - `status` 缺席（或 null）＝預設啟用；nullable 欄空字串由後端 `blank_to_none` 落
     *   `None`（來回等價，表單以空字串承載「沒填」即可）。
     */
    type AddReq = {
      menuType: Api.SystemManage.MenuType;
      menuName: string;
      routeName: string;
      parentId: number;
      routePath?: string | null;
      component?: string | null;
      status?: Api.Common.EnableStatus | null;
      hideInMenu?: boolean | null;
      keepAlive?: boolean | null;
      multiTab?: boolean | null;
      constant?: boolean | null;
      order?: number | null;
      icon?: string | null;
      iconType?: Api.SystemManage.IconType | null;
      i18nKey?: string | null;
      href?: string | null;
      activeMenu?: string | null;
      fixedIndexInTab?: number | null;
      query?: { key: string; value: string }[] | null;
      buttons?: Api.SystemManage.MenuButton[] | null;
      menuMemo?: string | null;
    };

    /**
     * 更新請求（`POST updateMenu`；contracts §4；三態語意＝ADR 0023）
     *
     * ★**結構性無 `routeName`／`menuType` 欄**：契約「出現即拒」（`2222 routeNameImmutable`／
     * `menuTypeImmutable`、值不比對——rev4 UpdateMenuReq 收兩欄〔後端等值放行〕＝rev5 差異點
     * 不帶回；型別層把誤送直接擋在編譯期，呼叫端勿散開整列 record 組 body）。
     * `menuName` 為 NOT NULL 欄、★不容 null（顯式 null＝`2222 nameRequired` 拒收——型別層
     * 同步不容）；其餘 nullable 欄三態：缺席不動／null 清空／有值設值。
     * `parentId`：`0`＝改掛頂層、有值＝re-parent（防環＋父存在性守門）、缺席＝不動。
     */
    type UpdateReq = {
      id: number;
      menuName?: string;
      parentId?: number;
      routePath?: string | null;
      component?: string | null;
      status?: Api.Common.EnableStatus | null;
      hideInMenu?: boolean | null;
      keepAlive?: boolean | null;
      multiTab?: boolean | null;
      constant?: boolean | null;
      order?: number | null;
      icon?: string | null;
      iconType?: Api.SystemManage.IconType | null;
      i18nKey?: string | null;
      href?: string | null;
      activeMenu?: string | null;
      fixedIndexInTab?: number | null;
      query?: { key: string; value: string }[] | null;
      buttons?: Api.SystemManage.MenuButton[] | null;
      menuMemo?: string | null;
    };
  }
}
