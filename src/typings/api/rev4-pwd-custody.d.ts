// BASE-WEB-ADAPT (015-pwd-custody)：新增 typings 檔——getUserInfo additive 加欄 needChangePwd 前端形。
//
// ★rev4 首例判準（ADR 0067／research R9）：本檔為 rev4 ADAPT 軌道**首個「成員級 declaration merging」**
// ——既有 9 支 rev4-*.d.ts 皆於 Api 下加「全新 interface／namespace」，本檔則對**凍結檔 auth.d.ts 之
// 既有 `Api.Auth.UserInfo` interface** 跨檔同名再宣告：TS interface 合併機制令兩處成員自動併為一個
// 型別視圖，凍結檔 auth.d.ts 零觸碰（憲法凍結紀律）、本檔僅「增欄」。後續對凍結契約 additive 加欄
// 皆循此判準：net-new 檔＋同名 interface＋只增不改。
//
// needChangePwd 語意（contracts C1）：true＝該登入者名下存在他人經手設密記錄（首登須換密、
// route guard 據此改寫導向強制改密頁）；false＝純自改記錄或零記錄。wire 端恆帶 bool
// （後端 UserInfo struct need_change_pwd: bool、非 Option）；前端宣告 optional——
// auth store reactive 初值物件免補鍵、既有 Object.assign(userInfo, info) 回填即可讀（research R9）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace Auth {
    /** 成員級 merging：僅增欄、不動凍結 auth.d.ts 既有四欄（userId/userName/roles/buttons） */
    interface UserInfo {
      /** 強制換密判定投影（getUserInfo additive 加欄；true＝登入後強制換密） */
      needChangePwd?: boolean;
    }
  }
}
