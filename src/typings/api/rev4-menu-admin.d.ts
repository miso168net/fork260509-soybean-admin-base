// BASE-WEB-ADAPT (010-menu-admin)：新增 typings 檔，不改凍結 system-manage.d.ts（upstream Api.SystemManage 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；US1 寫端請求形＋回收桶讀端參（camelCase wire、contracts P1；復用凍結 Menu/MenuButton）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace SystemManage {
    /**
     * 新增選單請求（POST addMenu；contracts P1）
     *
     * 寫欄集＝menu-operate-modal getSubmitParams 產出形（component/routePath 由 layout+page／pathParam 組回）；
     * route meta 欄（i18nKey/keepAlive/constant/order/href/hideInMenu/activeMenu/multiTab/fixedIndexInTab/query）沿凍結 Menu 型。
     * 成功後零授權、sidebar 不現（含超管）＝FR-004 兩步流（前端接線不做任何授權寫入、下次載入生效）。
     */
    type AddMenuReq = Pick<
      Menu,
      | 'menuType'
      | 'menuName'
      | 'routeName'
      | 'routePath'
      | 'component'
      | 'icon'
      | 'iconType'
      | 'parentId'
      | 'status'
      | 'buttons'
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    /**
     * 更新選單請求（POST updateMenu；contracts P1）
     *
     * routeName／menuType 收但後端不可變——後端顯式拒為權威、前端 edit 鎖欄為體驗（FR）；
     * 全欄皆 optional（Partial）＝全 None 時後端 no-op（沿 009 UpdateRoleReq 手法）。
     */
    type UpdateMenuReq = { id: number } & Partial<
      Pick<
        Menu,
        | 'menuType'
        | 'menuName'
        | 'routeName'
        | 'routePath'
        | 'component'
        | 'icon'
        | 'iconType'
        | 'parentId'
        | 'status'
        | 'buttons'
        | 'i18nKey'
        | 'keepAlive'
        | 'constant'
        | 'order'
        | 'href'
        | 'hideInMenu'
        | 'activeMenu'
        | 'multiTab'
        | 'fixedIndexInTab'
        | 'query'
      >
    >;

    /** 批次刪除選單請求（DELETE batchDeleteMenu；ids＝勾選 menu id 全集、逐項驗證整批拒 no-partial） */
    type BatchDeleteMenuReq = { ids: number[] };

    /** 回收桶查詢參數（getDeletedMenus 分頁；current/size；UI 消費在 U9） */
    type GetDeletedMenusParams = CommonSearchParams;

    /** 復原選單請求（POST restoreMenu；UI 消費在 U9） */
    type RestoreMenuReq = { id: number };
  }
}
