// [rev5-inline BASE-WEB-ADAPT+ 002-system-settings] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api.SystemManage、不改既有 system-manage.d.ts（contracts §5、ADR 0018）。
declare namespace Api {
  namespace SystemManage {
    /**
     * 系統設定列型（讀端；對齊後端 SettingItem 序列化輸出——data-model §1）
     *
     * `GET /systemManage/getSystemSettings` 成功回 `{data: SystemSetting[], code:"0000", msg}`；
     * camelCase wire、`settingKey` 升冪穩定序；審計欄不上 wire（後端 Model→DTO 映射僅取此四欄）。
     * rev4: 承 rev4-system-settings.d.ts 同名 interface，四欄形不變。
     */
    interface SystemSetting {
      /** 設定鍵（PK、不可改——data-model §1） */
      settingKey: string;
      /** 設定值（字串載體；number 型亦以字串承載——data-model §1） */
      settingValue: string;
      /** 值型別（`"number"`／`"enum:on,off"`；驅動前端 render 與後端驗證——data-model §1） */
      settingType: string;
      /** 用途說明（可選；後端 None 以 skip_serializing_if 不上 wire＝欄位缺席，讀端不會出現 null） */
      description?: string;
    }

    /**
     * 改設定值請求（寫端；`POST /systemManage/updateSystemSetting` 之 camelCase JSON body——data-model §2）
     *
     * rev4: 承 rev4-system-settings.d.ts 之 UpdateSystemSettingReq（僅 settingKey＋settingValue 二欄）；
     * rev5 差異＝新增 description 三態欄（research R3 第 1 筆；B-026 三態約定＝data-model §8）。
     */
    interface UpdateSystemSettingReq {
      /** 定位鍵（必填；未知鍵→2222 biz.systemSettings.notFound——contracts §2） */
      settingKey: string;
      /** 新值（必填；經 registry 驗證＋正規化落 canonical 形；顯式 JSON null＝清空 NOT NULL 欄→2222 拒收，故型別不含 null） */
      settingValue: string;
      /**
       * 用途說明——三態欄（B-026 envelope 級三態約定、data-model §2/§8）：
       * 欄位缺席＝不動；欄位值 JSON null＝清空落 NULL；欄位有值＝設值（不經 registry 驗證）。
       *
       * ★本欄的 nullability 在 wire-schema.json 快照中如實呈 `["null","string"]`——
       * 抽取管線帶 `--strictNullChecks`（tools/wire-schema.py TSJS_FLAGS）才有此忠實度，
       * 該旗標於本刀補上（rev4 承襲設定未帶、快照對所有 nullable 欄一律低報）。
       * rust 側裁判（server/tests/wire_schema.rs、T021）因此可直接以快照斷言三態，
       * 毋須為本欄手工豁免。
       */
      description?: string | null;
    }
  }
}
