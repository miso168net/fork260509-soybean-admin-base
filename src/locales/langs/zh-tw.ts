// [rev6-inline BASE-WEB-I18N-WIRING+ 003-auth-session] 後端 msg key 的 zh-TW 對照——治理錨點孤立檔（裸 object、不接 runtime、不註冊 LangType＝brainstorm Q3；跨端閘右源之一；本檔 backend 子樹即繁中譯文的權威＝ADR-00039、首批鍵的史料出處＝`specs/003-auth-session/contracts/msg-keys.md`）
// ★鍵集紀律：本檔 backend 子樹須與 rust-api `MSG_KEYS` 逐鍵全等（鍵數以該陣列與跨端閘輸出為準、此處不抄）——少鍵＝缺譯、多鍵＝孤兒，皆由 `python3 tools/msg-key-gate.py check` 攔（rc 1 指名檔與鍵）；
//   `App.I18n.Schema` 標型與 runtime 註冊延前端 UI 刀（憲法 §III.2 I18N(iii) 收窄條件）、在那之前 TS 層不守本檔結構、機器防線只有跨端閘。
export default {
  backend: {
    common: { success: '操作成功' },
    system: { internal: '系統發生內部錯誤，請稍後再試', notFound: '找不到請求的資源', forbidden: '沒有權限執行此操作' },
    auth: {
      login: { failed: '帳號或密碼錯誤' },
      session: { reLogin: '請重新登入', kicked: '您的帳號已在其他裝置登入，此工作階段已結束' },
      token: { expired: '登入已逾時，正在重新取得授權' }
    },
    biz: {
      systemSettings: {
        invalidValue: '設定值不合法（型別不符、超出範圍或非允許選項）',
        notFound: '找不到指定的設定鍵'
      },
      auth: {
        notSupported: '該功能尚未開放',
        captchaRequired: '請完成圖形驗證碼後再試',
        locked: '嘗試次數過多，請稍後再試'
      },
      ipRule: {
        invalidRuleType: '規則類型不合法',
        invalidCidr: '網段格式不合法',
        conflict: '已有相同網段與類型的規則',
        notFound: '找不到指定的規則，或其目前狀態不允許此操作',
        selfLock: '此變更會擋住您目前的連線，已拒絕寫入'
      },
      throttle: { invalidUnlockTarget: '解鎖對象不合法' },
      role: {
        codeInvalid: '角色代碼格式不合法：僅允許字母、數字與底線，最長 64 個字元',
        codeExists: '此角色代碼已被現有角色使用',
        codeImmutable: '角色代碼建立後不可修改',
        notFound: '角色不存在或已刪除',
        seededProtected: '系統內建角色不可刪除',
        inUse: '此角色仍有使用者掛載（含已停用或已刪除的帳號），不可刪除',
        cannotDeleteSelfRole: '不可刪除您自己帳號所屬的角色',
        cannotDisableSelfRole: '不可停用您自己帳號所屬的角色',
        superCannotDisable: '超級管理員角色不可停用',
        nameRequired: '角色名稱為必填，不可為空'
      },
      menu: {
        notFound: '找不到指定的選單，或其目前狀態不允許此操作',
        routeNameExists: '此路由名稱已被現有選單使用，或為系統保留的路由名稱',
        routeNameImmutable: '路由名稱建立後不可修改',
        menuTypeImmutable: '選單類型建立後不可修改',
        parentNotFound: '父選單不存在或已刪除',
        cycleDetected: '不可將選單移到其自身或其子孫選單之下',
        protectedMenu: '受保護的選單不可刪除、不可停用，也不可變更其父選單',
        constantParent: '常量選單只能掛在常量父選單之下；其下仍有常量子孫選單時，也不可取消本身的常量設定',
        nameRequired: '選單名稱為必填，不可為空',
        routeNameInvalid: '路由名稱格式不合法：僅允許字母、數字、底線與連字號，最長 100 個字元',
        hrefInvalid: '外部連結須以 http:// 或 https:// 開頭',
        buttonsInvalid: '按鈕清單格式不合法：每個按鈕須有不為空且不重複的代碼，最長 100 個字元'
      }
    }
  }
};
