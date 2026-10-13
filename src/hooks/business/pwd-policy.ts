// [rev6-inline USER-CENTER-VIEW+ 007-user-password-admin] 密碼政策共用 hook 新檔（基線無此路徑、新增型不入名冊＝憲法 §III.2 表外宣告 3）：政策七鍵投影之取得與快取＋投影轉表單規則
// 服務對象橫跨兩棵 view 樹（使用者頁之重設密碼浮層與產密浮層、個人中心之改密卡），故落 `src/hooks/business/`（與 `auth.ts`、`captcha.ts` 同層），
// 免得 manage 樹反向自 user-center 樹取檔。對外兩支刻意分立：`usePwdPolicy` 持狀態且會發請求；`usePwdPolicyRules` 是純轉換、呼叫時零網路——只要規則的
// 消費點不會因此多發請求。規則訊息一律取 `page.passwordPolicy.violation.<碼>`：該子樹是違規碼譯文之單一共用命名空間（spec FR-033、ADR-00076），
// 請求層之拒因明細轉譯與本 hook 之即時提示共用同一組字面、不各寫一套。
// 出處：rev5:src/hooks/business/pwd-policy.ts（兩支同名、入參同形）；rev6 差異＝譯文自 `rev5:` 之 backend 樹白名單移至 page 樹、投影改取自 `rev6-user-center.ts`。
import { ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
// 包裝以直接路徑匯入：WRAPPER 軌道新檔不入 `service/api/index.ts` 之 barrel
import { fetchGetPasswordPolicy } from '@/service/api/rev6-user-center';

/**
 * 政策投影的模組層單例：宣告在函式之外，全部消費點讀同一份——政策屬全域設定、不因列或元件而異，已載入即不再發請求；若改宣告在函式內，
 * 每個 `usePwdPolicy()` 呼叫各持一份，先後開兩個浮層就對 `GET /userCenter/getPasswordPolicy` 各打一次。
 *
 * ★只增不清（已知態）：SPA 存活期間政策若被超管改動，即時提示與產密構造界沿用舊值；送出仍由後端以當下政策裁決，重新整理頁面即取得新值。
 * ★對外交出的是可寫 ref，但寫入者唯 `ensureLoaded` 一處、消費端只讀。
 */
const cachedPolicy = ref<Api.UserCenter.PasswordPolicyView | null>(null);

/** 密碼政策投影的取得與快取（改密卡、重設密碼浮層、產密浮層共用） */
export function usePwdPolicy() {
  /**
   * 確保快取已載：已有值即直接返回、不發請求。呼叫端 `await` 本函式之後再讀 `policy.value`。
   *
   * ★讀失敗＝靜默維持 `null`：本 hook 不另出錯誤提示、不擋任何送出（請求層既有之統一錯誤處理照常），消費端據 `null` 退為只驗必填——
   * 政策讀不到是系統自身的故障，不該因此讓管理員設不了密碼、使用者改不了密碼。
   */
  async function ensureLoaded() {
    if (cachedPolicy.value !== null) {
      return;
    }

    const { data, error } = await fetchGetPasswordPolicy();

    if (!error) {
      cachedPolicy.value = data;
    }
  }

  return { policy: cachedPolicy, ensureLoaded };
}

/** 政策規則的觸發時機：輸入當下即驗、失焦時再驗 */
const TRIGGER = ['input', 'blur'];

/**
 * 違規碼 → 該碼之譯文。參數取 wire 型之違規碼聯集（`Api.UserCenter.PasswordViolationCode`）、鍵路徑以樣板字面組出而受 `$t` 之鍵型檢查：
 * 聯集內任一碼在 `page.passwordPolicy.violation` 型節缺鍵、或本檔傳入聯集外之碼，前端型別檢查即紅。
 */
function violationMsg(code: Api.UserCenter.PasswordViolationCode) {
  return $t(`page.passwordPolicy.violation.${code}`);
}

/**
 * 政策投影轉 naive-ui 表單規則。
 *
 * ★前端規則只是即時提示、後端設密入口才是唯一裁判：規則只對應投影上的七鍵；位元組上界（違規碼 `maxBytes`）不在投影內、本 hook 不預判，
 * 只會出現在後端回的拒因明細；設密冷卻等端點自有之守門亦然。
 */
export function usePwdPolicyRules() {
  const { createRequiredRule } = useFormRules();

  /**
   * 依政策組出一個密碼欄的規則陣列；首條恆為必填。
   *
   * @param policy 政策七鍵投影；`null`＝尚未載入或讀失敗 ⇒ 只回必填一條（退為只驗必填、不擋送出、後端照判）。
   * @param userName `forbidUsername` 的比對對象（標的帳號名）。收 `MaybeRefOrGetter`、於驗證當下才以 `toValue` 取值——規則組好之後標的才確定或變更時，
   *   比的仍是當下的值。★空字串＝略過此條：拿不到真正的帳號名時寧可不提示，也不拿近似值（例如顯示名）去比，比錯對象的提示比沒有更誤導。
   */
  function buildPolicyRules(
    policy: Api.UserCenter.PasswordPolicyView | null,
    userName: MaybeRefOrGetter<string>
  ): App.Global.FormRule[] {
    const rules: App.Global.FormRule[] = [createRequiredRule($t('form.pwd.required'))];

    if (!policy) {
      return rules;
    }

    // 長度上下界：naive-ui 底層驗證器（async-validator）之字串長度把代理對算作一字＝以 Unicode 碼位計，與後端 `chars().count()` 同口徑。
    // 政策上下界矛盾（下限＞上限）時兩條同在、任何長度必違其一——與後端「自然全拒」同向，不另特判。
    rules.push({
      type: 'string',
      min: policy.minLength,
      message: violationMsg('minLength'),
      trigger: TRIGGER
    });
    rules.push({
      type: 'string',
      max: policy.maxLength,
      message: violationMsg('maxLength'),
      trigger: TRIGGER
    });

    // 四類字元：字元類與後端 rust-api `server/src/model/password.rs` 之 `validate_against_policy` 同界——`is_ascii_digit`＝[0-9]、`is_ascii_lowercase`＝[a-z]、
    // `is_ascii_uppercase`＝[A-Z]、special＝任一非 ASCII 英數字元＝[^A-Za-z0-9]（含空白、標點與非 ASCII 字）。界一旦不同，就會出現前端放行、後端拒收的落差。
    if (policy.requireDigit) {
      rules.push({
        pattern: /[0-9]/,
        message: violationMsg('requireDigit'),
        trigger: TRIGGER
      });
    }

    if (policy.requireLowercase) {
      rules.push({
        pattern: /[a-z]/,
        message: violationMsg('requireLowercase'),
        trigger: TRIGGER
      });
    }

    if (policy.requireUppercase) {
      rules.push({
        pattern: /[A-Z]/,
        message: violationMsg('requireUppercase'),
        trigger: TRIGGER
      });
    }

    if (policy.requireSpecial) {
      rules.push({
        pattern: /[^A-Za-z0-9]/,
        message: violationMsg('requireSpecial'),
        trigger: TRIGGER
      });
    }

    // 與帳號名不分大小寫「相等」才違規、子串不算（後端同判準：兩側皆轉小寫後比全等）。空值交必填那條判、此處放行。
    if (policy.forbidUsername) {
      rules.push({
        validator: (_rule, value: string) => {
          const name = toValue(userName);

          return value === '' || name === '' || value.toLowerCase() !== name.toLowerCase();
        },
        message: violationMsg('forbidUsername'),
        trigger: TRIGGER
      });
    }

    return rules;
  }

  return { buildPolicyRules };
}
