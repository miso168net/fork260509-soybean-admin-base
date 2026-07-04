// BASE-WEB-ADAPT (004-system-settings)：新增 typings 檔，不改既有 system-manage.d.ts。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；camelCase wire ↔ 後端 handler SettingItem。
declare namespace Api {
  namespace SystemManage {
    /** 系統設定（KV、讀全列；camelCase wire ↔ 後端 SettingItem） */
    interface SystemSetting {
      /** 設定鍵（PK、不可改） */
      settingKey: string;
      /** 設定值（字串載體） */
      settingValue: string;
      /** 值型別（如 "enum:on,off" / "number"；驅動前端 render 與後端驗證） */
      settingType: string;
      /** 用途說明（可選） */
      description?: string;
    }

    /** 改設定值請求（單鍵 update；對齊後端 UpdateReq） */
    interface UpdateSystemSettingReq {
      settingKey: string;
      settingValue: string;
    }
  }
}
