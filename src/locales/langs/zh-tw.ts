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
        // error.rs `fn key()` 固定鍵：AppError::ModalLogoutByAdmin（7777）——管理員踢除
        // （denylist reason admin_kick）、前端同一條 modal 通道但文案不同（本刀 U3；
        // 譯文權威＝specs/007-user-password-admin/contracts/msg-keys.md）。
        kickedByAdmin: '此工作階段已被管理員結束，請重新登入',
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
      // 005-role-menu-crud T026 十一鍵＋T031 一鍵（皆 2222）：構造點全在
      // server/src/handler/menu.rs——十一鍵在四支 map_*_err（含 map_restore_err）、
      // 第十二鍵 nameRequired 在 update_menu 早拒臂（皆直書 Cow::Borrowed 字面＝Lint24
      // 抽取面①；鍵字面與譯文語意單一權威＝
      // specs/005-role-menu-crud/contracts/msg-keys.md）。
      menu: {
        // 標的不存在／已刪（updateMenu／deleteMenu 家族共用；重刪已刪標的亦此鍵）
        notFound: '選單不存在',
        // 活性同鍵（addMenu 先驗＋23505 兜底同鍵）
        routeNameExists: '路由名稱已存在',
        // 不可變錨欄試改（★出現即拒、值不比對——rev4 等值放行形不帶回；島 H4）
        routeNameImmutable: '路由名稱建立後不可修改',
        menuTypeImmutable: '選單類型建立後不可修改',
        // 父不存在或已刪（新增／改父兩處同鍵——rev5 併鍵、rev4 兩鍵形不帶回；停用不擋）
        parentNotFound: '父層選單不存在或已刪除',
        // 改父成環（含上溯逾限保守判環）
        cycleDetected: '不可將選單移至自身或其子孫之下',
        // deleteMenu 存在未刪子項（★不論啟停）
        hasChildren: '選單下尚有子項，請先處理子項',
        // deleteMenu 撞受保護列（protected 旗標、守門第一腿）
        protectedMenu: '受保護選單，不可刪除',
        // 常量父鏈守門拒（rev5 專屬、島 H3——防 Public 端點外洩受保護父目錄）
        constantParent: '常量選單僅能掛在常量父選單之下',
        // ★第十鍵（ADR 0023 補充條款 1；user 拍板 2026-08-19 兩域同式）：NOT NULL 欄
        // menuName 收顯式 null
        nameRequired: '選單名稱不可為空',
        // routeName 形制不合（rev4 同名鍵；^[A-Za-z0-9_-]{1,100}$）
        routeNameInvalid: '路由名稱格式不正確（僅允許字母、數字、底線、連字號，最長 100 位）',
        // 復原撞活性同鍵（U12 回收桶；先驗＋23505 兜底同鍵——rev4 併 routeNameExists
        // 形不帶回、rev5 復原語境獨立鍵）
        restoreConflict: '同名路由已有生效選單，無法復原',
      },
      // 006-authz-governance T023 一鍵（2222）：構造點＝server/src/handler/policy_archive.rs
      // restore_policy（直書 Cow::Borrowed 字面＝Lint24 抽取面①；鍵字面與譯文語意單一權威＝
      // specs/006-authz-governance/contracts/msg-keys.md）。
      policy: {
        // restorePolicy 識別不存在／五腿任一拒／23505 競態（ADR 0055 三態之 NotRestorable；
        // 純 key 零明細——復原鈕於 restorable=false 列已停用、後端為最終防線）
        notRestorable: '該歸檔授權不可復原',
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
        // ★第十鍵（ADR 0023 補充條款 1；user 拍板 2026-08-19）：NOT NULL 欄收顯式 null
        nameRequired: '角色名稱不可為空',
        // 006-authz-governance T016：三維寫端撤銷集觸及 protected（整批拒、島 G2；構造點＝
        // server/src/handler/role.rs map_reject_cause；純 key 零明細——rev4 blocked 明細通道不帶回）
        protectedRevoke: '存在受保護的授權，無法撤銷',
        // 006-authz-governance T019：端點維新授集觸及受保護端點政策且標的非 R_SUPER（結構性封死、
        // 島 G6／ADR 0054；構造點＝server/src/handler/role.rs map_reject_cause；純 key 零明細）
        protectedGrant: '受保護的端點僅限超級管理員持有',
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
        // 標的不存在或已軟刪（活性判準＝未軟刪；只有 restoreUser 認得已刪列）
        notFound: '使用者不存在',
        // 現役同名（先驗＋23505 兜底同鍵）
        userNameExists: '使用者名稱已存在',
        // 形制不合（^[A-Za-z0-9_-]{1,64}$）
        userNameInvalid: '使用者名稱格式不正確',
        // updateUser 帶 userName（★出現即拒、值不比對——rev4 等值放行形不帶回）
        userNameImmutable: '使用者名稱不可修改',
        // 現役同信箱（不分大小寫；已刪列同信箱與現役並存合法）
        userEmailExists: '信箱已被使用',
        // 信箱簡式格式守門
        userEmailInvalid: '信箱格式不正確',
        // seed 三帳號不可刪／id 1 不可解除超管指派（島 I3 結構保護）
        seededProtected: '內建帳號受保護',
        // id 1 恆禁停用（系統恆有至少一個啟用的超級管理員）
        superCannotDisable: '超級管理員不可停用',
        // self 五不：不得刪除自己
        cannotDeleteSelf: '不能刪除自己',
        // self 五不：不得踢除自己（kickUser 守門③；本刀 U3）
        cannotKickSelf: '不能踢除自己',
        // self 五不：status／roleIds 出現即拒（「不得停用自己」亦由本鍵承載）
        cannotEditSelfRoleOrStatus: '不能修改自己的角色或狀態',
        // roleIds 含不存在或已軟刪之角色 id（整筆拒、非 orphan skip）
        roleNotFound: '角色不存在',
        // self 五不：不得以管理頁重設自己的密碼（改密動線導向個人中心；本刀 U4）
        cannotResetSelfPassword: '請到個人中心修改自己的密碼',
        // updateUserSessionPolicy 的 sessionPolicy 不在三值內（inherit／single／multi；
        // 欄缺席＝空字串亦走本鍵——契約 §10「缺席→空串→同一拒因」；本刀 U5）
        sessionPolicyInvalid: '會話策略無效',
        // changePassword 五步序②：兩次輸入不一致
        passwordConfirmMismatch: '兩次輸入的密碼不一致',
        // changePassword 五步序④：舊密碼驗證不過
        oldPasswordMismatch: '舊密碼不正確',
        // changePassword 五步序⑤：新密碼與舊密碼相同
        passwordSameAsOld: '新密碼不能與舊密碼相同',
        // 改密舊密猜測節流（15 分鐘 5 次；★純 key、不下發剩餘次數或秒數）
        changePasswordThrottled: '嘗試次數過多，請稍後再試',
        // ★攜參拒因之一（BizData）：{violations}＝前端把 data.violations 逐碼經下方
        //   passwordViolation 白名單譯後、以 common.listSeparator 串起來的清單
        // ★★佔位符字面 MUST 逐字等於後端信封 data 的**鍵名**（`violations`）：轉譯點
        //   service/request/index.ts 的 translateBackendMsg 是把 data 的鍵名原樣當
        //   vue-i18n 具名參數，名字對不上時 vue-i18n 把該參數渲染成**空字串**（不報錯、
        //   不 fallback）⇒ 使用者看到「密碼不符合安全策略：」後面整段違規明細消失，而
        //   Lint24 只比鍵集、typecheck 看不到字串內容 ⇒ 全樹零紅點。
        passwordPolicy: '密碼不符合安全策略：{violations}',
        // ★攜參拒因之二（BizData）：{remainingSeconds}＝data.remainingSeconds 逐字
        pwdSetTooFrequent: '密碼設定過於頻繁，請 {remainingSeconds} 秒後再試',
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
