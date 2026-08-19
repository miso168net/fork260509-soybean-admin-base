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
      login: {
        // error.rs `fn key()` 固定鍵：AppError::LoginFailed（1000）——帳密驗證不過
        //（003-auth-session T010；譯文逐字＝specs/003-auth-session/contracts/msg-keys.md）。
        failed: '帳號或密碼錯誤',
      },
      session: {
        // error.rs `fn key()` 固定鍵：AppError::Logout（8888）——B12 未認證即發此鍵
        //（research R3 第 3 筆：rev4 發 3333，rev5 拍板改判，因 3333 會觸發前端 refresh 重試
        // 而本刀無 refresh 機制）。
        reLogin: '請重新登入',
        // error.rs `fn key()` 固定鍵：AppError::ModalLogout（7777）——他處登入被踢、前端 modal
        //（003-auth-session T010；譯文逐字＝specs/003-auth-session/contracts/msg-keys.md）。
        kicked: '您的帳號已在其他裝置登入，此工作階段已結束',
      },
      token: {
        // error.rs `fn key()` 固定鍵：AppError::TokenExpired（3333）——僅 exp 過期發此鍵、
        // 前端據此靜默 refresh（003-auth-session T010；譯文逐字＝specs/003-auth-session/
        // contracts/msg-keys.md）。
        expired: '登入已逾時，正在重新取得授權',
      },
    },
    biz: {
      auth: {
        // 構造點四處（003 U-L／T051、皆 2222）：server/src/throttle/mod.rs 之
        // captcha_gate()——缺／無效題、重放、used 標記 SET NX 瞬斷、答錯一律此鍵
        //（★構造點直書 Cow::Borrowed 字面、不設具名常數＝Lint24 抽取面①；
        // 譯文逐字＝specs/003-auth-session/contracts/msg-keys.md）。
        captchaRequired: '請完成圖形驗證碼後再試',
        // 構造點兩處（T051、2222）：同檔 precheck() 之 ①L1 lock 鍵命中／③L2 計數達
        // max_fails——硬鎖靜態一般化訊息（零觸發維度／剩餘時間／存在性；同為字面直書；
        // 譯文逐字＝specs/003-auth-session/contracts/msg-keys.md）。
        locked: '嘗試次數過多，請稍後再試',
        // 構造點一處（T061、2222）：server/src/handler/auth/alt_stub.rs
        // not_supported_stub()——替代登入四端點（sendCaptcha／codeLogin／register／
        // resetPwd）共用誠實 stub（同為字面直書＝Lint24 抽取面①；
        // 譯文逐字＝specs/003-auth-session/contracts/msg-keys.md）。
        notSupported: '該功能尚未開放',
      },
      // 004-ip-trust-anchor T038 五鍵（皆 2222）：構造點全在
      // server/src/handler/ip_rule.rs（五處直書 Cow::Borrowed 字面＝Lint24 抽取面①；
      // 譯文語意單一權威＝specs/004-ip-trust-anchor/contracts/msg-keys.md）。
      ipRule: {
        // 規則類型非二值（allow｜deny）；★**構造點只在 addIpRule／updateIpRule 兩個寫端**
        // （deleteIpRule／restoreIpRule 的請求體只有 id、結構上不帶類型）——清單 query 的
        // wbipType／deleted 值域外一律**沉默**（值域外＝等值過濾自然零結果／未篩選），
        // 契約面 contracts/wire-ip-rule.md §1 把該端點錯誤集逐字凍結為 5003／5000、
        // 無業務錯誤腿，故本鍵**不承載任何 query 參數的值域錯誤**（拿它去報 deleted=xxx
        // 會讓使用者看到指向錯欄位的訊息）。
        invalidRuleType: '規則類型不正確',
        // 網段字面解析失敗（含遮罩位數越界）。
        invalidCidr: '網段格式不正確',
        // 有效列唯一性衝突（同「網段×類型」；含復原後撞現役列）。
        conflict: '相同網段與類型的規則已存在',
        // 標的不存在，或其狀態不允許此操作（對回收桶列再刪、對現役列復原）。
        notFound: '找不到指定的規則，或其狀態不允許此操作',
        // ★防自鎖拒寫（本刀唯一的 fail-closed 例外）：訊息要講得出「為什麼被擋」與
        // 「已經沒有寫進去」，否則操作者只會重試同一個動作。
        selfLock: '此規則會使你目前的連線被阻擋，已拒絕寫入',
      },
      // 005-role-menu-crud T020 九鍵（皆 2222）：構造點全在 server/src/handler/role.rs 的
      // 三支 map_*_err（直書 Cow::Borrowed 字面＝Lint24 抽取面①；鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md）。
      role: {
        // roleCode 形制不合（^[A-Za-z0-9_]{1,64}$；欄缺席→空串亦此鍵）
        codeInvalid: '角色編碼格式不正確（僅允許字母、數字、底線，最長 64 位）',
        // 活性代碼重複（先驗＋23505 兜底同鍵）
        codeExists: '角色編碼已存在',
        // updateRole 試改 roleCode（★出現即拒、值不比對——rev4 等值放行形不帶回）
        codeImmutable: '角色編碼建立後不可修改',
        // 標的不存在／已刪
        notFound: '角色不存在',
        // deleteRole 撞 seed 三角色
        seededProtected: '系統內建角色，不可刪除',
        // 有掛載使用者（others>0）；★rev4 攜參形 {userCount} 不帶回——純 key 零插值（R2-9）
        inUse: '該角色仍掛有使用者，不可刪除',
        // 刪自己所屬角色（三層守門固定序 seeded→in-use→self-role 之末層）
        cannotDeleteSelfRole: '不能刪除目前登入使用者所屬的角色',
        // 停用自己所屬角色（updateRole 停用雙護欄之一）
        cannotDisableSelfRole: '不能停用目前登入使用者所屬的角色',
        // 停用 R_SUPER（恆禁、不因操作者身分而異）
        superCannotDisable: '超級管理員角色不可停用',
      },
      systemSettings: {
        // 構造點兩處（T019＋T021、2222）：server/src/validation.rs invalid_value()——
        // 型別不符／超範圍／enum 外值；server/src/handler/system_settings.rs 同名
        // 構造點——必填欄缺席／顯式 null／JSON 反序列化失敗（三態非法）。
        invalidValue: '設定值不合法（型別不符、超出範圍或非允許選項）',
        // 構造點＝server/src/handler/system_settings.rs not_found()（T021、2222）：
        // settingKey 不在 registry 宣告集（含軟刪防禦態——facade 的 deleted_at IS NULL
        // filter 使軟刪列視同 miss；Clarify Q3 拍板 2222 非 4040）。
        notFound: '找不到指定的設定鍵',
      },
      // 004-ip-trust-anchor T054 一鍵（2222）：構造點全在
      // server/src/handler/throttle.rs 之 resolve_unlock_target——四個畸形形共用同一個
      // `Cow::Borrowed` 字面構造點（＝Lint24 的靜態鍵抽取面）。★刻意**不**設具名常數：
      // 常數形須先擴 docs-sync.py 的 I18N_CONST_ROSTER 名冊（該表現為空表），否則當場被
      // 該閘 fail-loud 擋下——理由逐字見那支函式的碼註。譯文語意單一權威＝
      // specs/004-ip-trust-anchor/contracts/msg-keys.md 第 6 列。
      throttle: {
        // 解鎖端點的參數畸形：維度不明／該維必填欄缺席／位址字面不可解析／unspecified
        // 哨兵。★四形共用一把鍵是拍板（rev4 分 invalidDimension／invalidTarget 兩把、
        // 不帶回）——對操作者而言它們是同一件事，訊息只需講「這個對象不對」。
        invalidUnlockTarget: '解鎖對象不正確',
      },
      // 白名單八鍵（後端不發）：密碼政策明細由後端經 BizData 通道下發違規碼、前端逐碼譯後
      // 以 common.listSeparator 串接。★白名單 ∩ 後端實發集必須為空，非空即名冊腐化紅。
      // ★本註解的主詞是 user 這一節——biz 樹另含 systemSettings（後端實發鍵），
      // 「biz 全樹皆白名單」的敘述對現況不成立。
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
