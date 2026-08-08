// [rev5-inline BACKEND-MSG-DICT+ 002-system-settings] 後端 msg key 的 zh-TW 對照——治理錨點孤立檔。
// 形制權威＝ADR 0021（§III ★軌道授權射程釋義）：本檔是 base-web 純新增檔，不觸 §III.2 ★軌道，
// 依 §III fork-delta 新增型紀律以本行標記圈界。★裸 object export、無 `App.I18n.Schema` 標註、
// 不 import 進 runtime locale 系統——唯一消費者是傘狀治理工具的文本解析：
//   ① Lint24 跨端契約閘：後端實發 msg key 集 ⊆ 本檔 backend 樹鍵集（少鍵＝缺譯紅、多鍵＝孤兒紅）
//   ② gen.msg_dict 的解除謂詞（ADR 0020 甲案：MSG_DICT_LOCALES 兩語皆含 backend 樹才解除豁免）
// rev4 同名檔是靠 ★軌道對 app.d.ts 做 inline（補 backend 型節＋改 LangType）並標 Schema 才成立的，
// rev5 不得帶回（ADR 0019 防回歸條款；research R3 第 13 筆）——標型重構與 runtime 接線延前端 UI 刀
// 的 ★軌道 Amendment 一次開齊。在那之前本檔在 TS 層無 Schema 保護，機器防線＝Lint24 與全量 typecheck。
//
// ★鍵集紀律（Lint24 逐鍵成對）：起手鍵集＝後端 error.rs 之 `fn key()` 實發五鍵
// ∪ Lint24 內部鍵白名單九鍵（docs-sync.py 的 I18N_FRONTEND_INTERNAL_KEYS；白名單存在性斷言
// 要求九鍵必在字典）。★biz.systemSettings.* 二鍵隨其構造點所在單元（T019／T021）增補，
// 提前落即成孤兒鍵紅。
const backendMessages = {
  backend: {
    common: {
      // error.rs `fn key()` 固定鍵：AppError::Success（0000）
      success: '操作成功',
      // 白名單鍵（後端不發）：密碼政策違規明細清單的 join 分隔符，純前端在地化詞彙
      listSeparator: '、',
    },
    system: {
      // 以下三鍵皆為 error.rs `fn key()` 固定鍵：Internal（5000）／NotFound（4040）／
      // PermissionDenied（5003）。★5003 的明細粒度＝純 i18n key 形起步、不帶結構化明細
      //（M4 授權拒絕語意 ADR；受眾邊界重評歸 B-024）。
      internal: '系統發生內部錯誤，請稍後再試',
      notFound: '找不到請求的資源',
      forbidden: '沒有權限執行此操作',
    },
    auth: {
      session: {
        // error.rs `fn key()` 固定鍵：AppError::Logout（8888）——B12 未認證即發此鍵
        //（research R3 第 3 筆：rev4 發 3333，rev5 拍板改判，因 3333 會觸發前端 refresh 重試
        // 而本刀無 refresh 機制）。
        reLogin: '請重新登入',
      },
    },
    // 白名單八鍵（後端不發）：密碼政策明細由後端經 BizData 通道下發違規碼、前端逐碼譯後
    // 以 common.listSeparator 串接。★白名單 ∩ 後端實發集必須為空，非空即名冊腐化紅。
    biz: {
      user: {
        passwordViolation: {
          minLength: '長度未達政策下限',
          maxLength: '長度超過政策上限',
          maxBytes: '位元組數超過上限',
          requireDigit: '須包含數字',
          requireLowercase: '須包含小寫字母',
          requireUppercase: '須包含大寫字母',
          requireSpecial: '須包含特殊符號',
          forbidUsername: '不可與使用者名稱相同',
        },
      },
    },
  },
};

export default backendMessages;
