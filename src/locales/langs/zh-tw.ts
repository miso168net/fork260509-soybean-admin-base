// [rev6-inline BASE-WEB-I18N-WIRING+ 003-auth-session] 後端 msg key 的 zh-TW 對照——治理錨點孤立檔（裸 object、不接 runtime、不註冊 LangType＝brainstorm Q3；跨端閘右源之一、繁中譯文權威＝contracts/msg-keys.md 逐字）
// ★鍵集紀律：本檔 backend 子樹須與 rust-api `MSG_KEYS`（13 鍵）逐鍵全等——少鍵＝缺譯、多鍵＝孤兒，皆由 `python3 tools/msg-key-gate.py check` 攔（rc 1 指名檔與鍵）；
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
      systemSettings: { invalidValue: '設定值不合法（型別不符、超出範圍或非允許選項）', notFound: '找不到指定的設定鍵' },
      auth: { notSupported: '該功能尚未開放', captchaRequired: '請完成圖形驗證碼後再試', locked: '嘗試次數過多，請稍後再試' },
      ipRule: {
        invalidRuleType: '規則類型不合法',
        invalidCidr: '網段格式不合法',
        conflict: '已有相同網段與類型的規則',
        notFound: '找不到指定的規則，或其目前狀態不允許此操作',
        selfLock: '此變更會擋住您目前的連線，已拒絕寫入'
      },
      throttle: { invalidUnlockTarget: '解鎖對象不合法' }
    }
  }
};
