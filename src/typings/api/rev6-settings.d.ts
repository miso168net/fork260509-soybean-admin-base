// [rev6-inline BASE-WEB-ADAPT+ 002-system-settings] wire 契約錨點新檔——declaration merging 併入 Api.SystemManage、不改既有 system-manage.d.ts（contracts/wire-settings.md §5）
declare namespace Api {
  namespace SystemManage {
    /**
     * 系統設定列型（讀端；對齊後端 `SettingItem` 序列化輸出——specs/002-system-settings/data-model.md §1）
     *
     * `GET /systemManage/getSystemSettings` 成功回 `{data: SystemSetting[], code:"0000", msg}`；
     * camelCase wire、`settingKey` 升冪穩定序、僅未刪列；審計欄不上 wire（後端 Model→DTO 映射僅取此四欄）。
     * 本 interface 即憲法 §I.3 的 wire 權威：`tools/wire-schema.py extract` 自此抽出快照、rust 側裁判以快照斷言。
     * rev5:rev5-settings.d.ts 同名 interface、四欄形不變（rev6 只換檔名前綴與 token）。
     */
    interface SystemSetting {
      /** 設定鍵（PK、不可經寫端變更——data-model §1） */
      settingKey: string;
      /** 設定值（字串載體；number 型亦以字串承載、庫中已是 canonical 形——data-model §1） */
      settingValue: string;
      /** 值型別字面（`"number"`／`"enum:on,off"`＝庫中 setting_type 真值；驅動前端 render 與後端驗證） */
      settingType: string;
      /** 用途說明（可選；庫中 NULL 時後端整欄缺席、讀端不會出現 null——clarify Q2、data-model §1） */
      description?: string;
    }

    /**
     * 改設定值請求（寫端；`POST /systemManage/updateSystemSetting` 之 camelCase JSON body——data-model §2）
     *
     * 三態欄依 envelope 級三態約定（data-model §8）：欄位缺席＝不動；JSON null＝顯式清空；有值＝設值。
     * 成功回 `{data:null, code:"0000", msg:"common.success"}`、不回更新後物件（clarify Q3）。
     * rev5:rev5-settings.d.ts 同名 interface、三欄形不變。
     */
    interface UpdateSystemSettingReq {
      /** 定位鍵（必填；不在 registry 宣告集→2222 biz.systemSettings.notFound——contracts/wire-settings.md §2） */
      settingKey: string;
      /** 新值（必填；經 registry 驗證＋正規化落 canonical 形；顯式 JSON null＝清空 NOT NULL 欄→2222 拒收，故型別不含 null） */
      settingValue: string;
      /**
       * 用途說明——三態欄（data-model §2／§8）：缺席＝不動；JSON null＝清空落 NULL；有值＝設值（空字串亦為設值、不經 registry）。
       *
       * ★本欄 nullability 在 wire-schema.json 快照中如實呈 `["null","string"]`——抽取管線帶 `--strictNullChecks`
       * （tools/wire-schema.py TSJS_FLAGS）才有此忠實度；rust 側裁判（server/tests/wire_schema.rs）因此可直接以快照斷言三態、
       * 毋須為本欄手工豁免。
       */
      description?: string | null;
    }
  }
}
