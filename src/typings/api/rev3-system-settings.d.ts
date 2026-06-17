// [rev3-inline ADAPT §III.1 008-system-settings ★ START] 新 typings 檔（fork-delta、不改既有 system-manage.d.ts）
// merge 進 Api.SystemManage namespace（TS 跨檔 declaration merging）；camelCase wire、對齊 rust handler SystemSettingItem
declare namespace Api {
  namespace SystemManage {
    /** 系統設定（KV、讀全列；camelCase wire ↔ rust SystemSettingItem） */
    interface SystemSetting {
      /** 設定鍵（PK、不可改） */
      settingKey: string;
      /** 設定值 */
      settingValue: string;
      /** 值型別（如 "enum:on,off"；驅動前端 render 與後端驗證） */
      valueType: string;
      /** 用途說明（可選） */
      description?: string;
    }

    /** 改設定值請求（單鍵 update；對齊 rust UpdateReq） */
    interface UpdateSystemSettingReq {
      settingKey: string;
      settingValue: string;
    }
  }
}
// [rev3-inline ADAPT §III.1 008-system-settings ★ END]
