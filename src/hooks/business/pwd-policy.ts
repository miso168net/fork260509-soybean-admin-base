// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin] 密碼政策動態表單規則共用 hook（新增檔；
// 基線 example 無此路徑、零原行；憲法 §III.2 (vi) 列明文「pwd-policy.ts 為 rev5 新增型新檔、不入名冊」）。
// 落點取 src/hooks/business/（與既有 auth.ts／captcha.ts 同層）：消費端跨樹——user-center 與 manage/user
// 兩棵樹都要它（前者要即時規則、後者要產密浮層的構造資料源），自 manage 樹 import user-center 子樹的檔＝跨樹不潔。
// 本檔對外兩支：`usePwdPolicyRules`（投影→naive rules）與 `usePwdPolicy`（投影的取得與快取）——
// 前者純函數式轉換、後者持狀態，切開是為了讓只要規則的消費點不必被迫拉進一份網路相依。
// rev4: 承 rev4:hooks/business/pwd-policy.ts 之 usePwdPolicyRules／buildPolicyRules 對外形，
// 內容依 rev5 拍板重寫三處——①入參由 KV 清單（`PasswordPolicyItem[]`＋字串鍵查表）換**具名七欄投影**
// （rev5 後端已收斂完畢、前端零 `settingKey` 比對）②政策讀不到的表徵由「空清單」換 `null`（語意分得開：
// 空清單在 rev4 同時代表「讀失敗」與「政策全關」）③六條規則的訊息由 rev4 的統一單句換**逐條違規碼譯文**
// （既有前端內部詞彙表 `backend.biz.user.passwordViolation.*` 八鍵、Lint24 白名單）——同一組字面既用於
// 後端 `passwordPolicy{violations}` 的明細渲染、也用於此處的即時提示，使用者兩處看到的是同一句話。
import { ref, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（沿 rev5-user-center 既有消費先例）
import { fetchGetPasswordPolicy } from '@/service/api/rev5-user-center';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

/**
 * 政策七欄投影的**模組級單例快取**（三個消費點共用同一份：個人中心改密卡、user 抽屜新增模式的產密鈕、
 * user 列表維運下拉的隨機密碼）
 *
 * ★刻意**放在函數外**＝跨元件共用一份，而不是每個 `usePwdPolicy()` 呼叫各建一份：政策是全域設定、
 * 不隨列也不隨元件而變，一次登入內讀一次就夠。放在函數內的話，同一次登入中先開抽屜的產密鈕、再開
 * 列表下拉的隨機密碼，會對同一支 `GET /userCenter/getPasswordPolicy` 發出兩支各自為政的請求
 * （FR-007 共用件零拷貝的實質後果面，不只是行數重複）。
 * ★快取只增不清：政策若在 SPA 存活期間被超管改掉，本頁看到的仍是舊值——這只影響**前端提示與產密
 * 的構造界**，後端仍是唯一裁判（改密／設密照樣以最新政策裁決），重整頁面即取到新值。
 * ★對外雖回可寫的 ref，紀律上**唯一寫入者是 `ensureLoaded`**：消費端只讀。
 * ★具名 `cachedPolicy` 而非 `policy`：後者與下方 `buildPolicyRules` 的入參同名，oxlint no-shadow 當場紅。
 */
const cachedPolicy = ref<Api.UserCenter.PasswordPolicyView | null>(null);

/**
 * 密碼政策投影的取得與快取（改密卡與任何設密欄共用）
 *
 * ★讀失敗**靜默降級**（維持 `null`）：不彈錯、不擋任何送出——政策讀不到是我方的基建問題，
 * 把它變成「使用者改不了密碼／產不出密碼」等於拿別人的帳號當自己故障的人質（FR-031 末句同精神）。
 */
export function usePwdPolicy() {
  /** 取政策（已有快取即不再發請求）。★呼叫端一律 `await` 後才用 `policy.value` */
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

/** 規則觸發時機（輸入即驗＋失焦再驗；與 naive-ui 既有欄位規則同形） */
const TRIGGER = ['input', 'blur'];

/**
 * 密碼政策 → naive-ui 表單規則（改密卡與日後任何設密欄共用）
 *
 * ★**前端規則只是即時提示、後端是唯一裁判**（FR-031／島 I5 單一驗證點）：本 hook 產出的規則
 * 刻意只覆蓋政策投影上的七鍵，位元組上限（512 bytes）與設密冷卻等端點固有規則一律不預判。
 */
export function usePwdPolicyRules() {
  const { createRequiredRule } = useFormRules();

  /**
   * 把政策投影組成一組欄位規則。
   *
   * @param policy 政策七欄投影；★`null`＝**取不到**（讀失敗或尚未載入）⇒ 只回 required 一條、
   *   **靜默降級**：不彈錯、不擋送出（contracts §1 末句、FR-031）。理由＝政策讀不到是我方的
   *   基建問題，把它變成「使用者改不了密碼」等於拿別人的帳號當自己故障的人質；後端仍會擋。
   * @param userName 標的帳號名（`forbidUsername` 的比對源，大小寫不敏感**相等**、非子串）。
   *   ★收 `MaybeRefOrGetter`：validator 執行時才 `toValue` 讀當下值，避免規則組建時的值快照
   *   與送出時的實際值脫節。★**空字串＝略過該條**——取不到真帳號名時寧可不出這條提示，也不要
   *   拿一個近似值（例如暱稱）去比：比錯的提示比沒有提示更誤導（見 password-card.vue 該處註解）。
   */
  function buildPolicyRules(
    policy: Api.UserCenter.PasswordPolicyView | null,
    userName: MaybeRefOrGetter<string>
  ): App.Global.FormRule[] {
    const rules: App.Global.FormRule[] = [createRequiredRule($t('form.pwd.required'))];

    if (!policy) {
      return rules;
    }

    if (policy.minLength > 0) {
      rules.push({
        type: 'string',
        min: policy.minLength,
        message: $t('backend.biz.user.passwordViolation.minLength'),
        trigger: TRIGGER
      });
    }

    if (policy.maxLength > 0) {
      rules.push({
        type: 'string',
        max: policy.maxLength,
        message: $t('backend.biz.user.passwordViolation.maxLength'),
        trigger: TRIGGER
      });
    }

    // 四類字元要求：正則與後端驗證點同界（digit `[0-9]`／lower `[a-z]`／upper `[A-Z]`／
    // special `[^A-Za-z0-9]`）——界不同即「前端說過了、後端說沒過」。
    if (policy.requireDigit) {
      rules.push({
        pattern: /[0-9]/,
        message: $t('backend.biz.user.passwordViolation.requireDigit'),
        trigger: TRIGGER
      });
    }

    if (policy.requireLowercase) {
      rules.push({
        pattern: /[a-z]/,
        message: $t('backend.biz.user.passwordViolation.requireLowercase'),
        trigger: TRIGGER
      });
    }

    if (policy.requireUppercase) {
      rules.push({
        pattern: /[A-Z]/,
        message: $t('backend.biz.user.passwordViolation.requireUppercase'),
        trigger: TRIGGER
      });
    }

    if (policy.requireSpecial) {
      rules.push({
        pattern: /[^A-Za-z0-9]/,
        message: $t('backend.biz.user.passwordViolation.requireSpecial'),
        trigger: TRIGGER
      });
    }

    if (policy.forbidUsername) {
      rules.push({
        validator: (_rule, value: string) => {
          const name = toValue(userName);

          return !(value !== '' && name !== '' && value.toLowerCase() === name.toLowerCase());
        },
        message: $t('backend.biz.user.passwordViolation.forbidUsername'),
        trigger: TRIGGER
      });
    }

    return rules;
  }

  return { buildPolicyRules };
}
