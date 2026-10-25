// [rev6-inline BASE-WEB-ADAPT+ 007-user-password-admin] 個人中心兩端點與錯誤明細通道的 wire 型別新檔——以 declaration merging 開 `Api.UserCenter` 節、既有 typings 檔零改（specs/007-user-password-admin/contracts/wire-user-center.md）
declare namespace Api {
  /**
   * 個人中心域（`/userCenter/*` 兩端點）與密碼政策家族之錯誤明細。本節即憲法 §I.3 的 wire 權威：`tools/wire-schema.py extract`
   * 由此抽快照、rust 側 `tests/wire_schema.rs` 據快照裁後端 DTO。
   *
   * 兩端點皆登入即可用、標的恆為登入者本人：請求型結構上沒有 id 欄（body 多帶之鍵後端一律忽略）。明細兩型雖也由使用者管理域之
   * 設密入口發出，仍歸本節——與 `PasswordPolicyView` 同屬密碼政策家族、消費者（請求層轉譯、密碼政策 hook）不屬任一管理頁。
   * 型名與後端同名（`handler::user_center`；明細兩型住 `handler::user`）、各型欄序＝wire 欄序。
   * 欄形出處＝rev5:src/typings/api/rev5-user-center.d.ts。rev6 差異：違規碼聯集與兩支明細型具名入節（明細信封亦受 wire 裁判）。
   */
  namespace UserCenter {
    /**
     * `getPasswordPolicy` 之 `data`：恰七欄、與後端設密三入口驗的是同一份政策（消費當下現讀）。冷卻秒數、位元組上界與其餘設定
     * 結構上不下發——前端規則只是提示、後端是唯一裁判。
     */
    interface PasswordPolicyView {
      /** 字元數下界（以字元計） */
      minLength: number;
      /** 字元數上界 */
      maxLength: number;
      /** 須含 `[0-9]` */
      requireDigit: boolean;
      /** 須含 `[a-z]` */
      requireLowercase: boolean;
      /** 須含 `[A-Z]` */
      requireUppercase: boolean;
      /** 須含 `[^A-Za-z0-9]` */
      requireSpecial: boolean;
      /** 與帳號名不分大小寫**相等**即違規（子串不算） */
      forbidUsername: boolean;
    }

    /** `changePassword` 請求體：三欄皆前端必送（缺席＝空字串交守門判）；結構上沒有 id 欄＝只改登入者本人；密碼只進不出。 */
    interface ChangePasswordReq {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    }

    /** 密碼政策違規碼八枚（`PasswordPolicyDetail.violations` 之元素）；前端以 `page.passwordPolicy.violation.<碼>` 轉人話。 */
    type PasswordViolationCode =
      | 'minLength'
      | 'maxLength'
      | 'maxBytes'
      | 'requireDigit'
      | 'requireLowercase'
      | 'requireUppercase'
      | 'requireSpecial'
      | 'forbidUsername';

    /**
     * `2222 biz.user.passwordPolicy` 錯誤信封之 `data`（錯誤 `data` 恆 null 之三例外之一；ADR-00102）：一次收集全部違規、非空、
     * 不重複、元素序＝違規碼宣告序；不含明文、雜湊與政策門檻值。
     */
    interface PasswordPolicyDetail {
      violations: PasswordViolationCode[];
    }

    /**
     * `2222 biz.user.pwdSetTooFrequent` 錯誤信封之 `data`（三例外之二；ADR-00102）：整數、1 ≤ n ≤ 冷卻設定秒數——提示秒數為等待之
     * 估計：牆鐘單調且冷卻設定未改時照提示秒數重試即過；牆鐘回撥或設定調大時可再被擋、回新的剩餘秒數。
     */
    interface PwdSetTooFrequentDetail {
      remainingSeconds: number;
    }
  }
}
