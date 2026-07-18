// BASE-WEB-MODAL-WIRING(k) (015-pwd-custody)：新增 hook 檔——密碼政策動態 rules 共用（T016）。
// 自 user-center password-card.vue（014 (g) as-built）抽出 buildPolicyRules，規則內容逐字搬移、
// 對外行為零變更；userName 入參改收 MaybeRefOrGetter——validator 執行時 toValue 動態讀當下值，
// 保留原 props.userName 即時比對語意（D4 真帳號比對、大小寫不敏感相等）。
// 落點取 src/hooks/business/（捨 014 B-096「共用檔落 views 子樹」先例）：本 hook 消費端跨樹
// （views/user-center/modules/password-card＋views/_builtin/force-change-pwd＋後續掛載點），
// 自 _builtin 樹 import views/user-center/modules/ 檔＝跨樹不潔；hooks/business 為既有業務 hook 家
// （auth.ts／captcha.ts 同層）。憲法 §III.2(k) 授權射程內。★新檔零原行（example 基線無此檔）。
import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

/**
 * 密碼政策動態 rules 共用 hook（password-card 改密卡／force-change-pwd 強制改密頁共用）
 *
 * 依政策 7 鍵組 naive rule：KV Map 化、number 鍵 parseInt 且 NaN 略過、bool 鍵值 'on' 才出規則、
 * trigger＝input＋blur；六政策鍵 rules 訊息統一單句取 page.userCenter.pwdPolicyNotMet（014 D2 定案）
 * ——儲存時 BizData violations 明細 toast 另管線、後端單一驗證點為權威、前端提示為輔。
 * 第 7 鍵 forbid_username（014 D4 行為增補）：與本人帳號 case-insensitive 相等即紅字
 * （鏡像後端 VIOLATION_FORBID_USERNAME 語意：相等、非子串）；即時訊息維持 forbidUsername 明細譯文。
 */
export function usePwdPolicyRules() {
  const { createRequiredRule } = useFormRules();

  function buildPolicyRules(
    settings: Api.UserCenter.PasswordPolicyItem[],
    userName: MaybeRefOrGetter<string>
  ): App.Global.FormRule[] {
    const map = new Map(settings.map(item => [item.settingKey, item.settingValue]));
    const num = (key: string) => {
      const parsed = Number.parseInt(map.get(key) ?? '', 10);
      return Number.isNaN(parsed) ? null : parsed;
    };
    const on = (key: string) => map.get(key) === 'on';
    const message = $t('page.userCenter.pwdPolicyNotMet');
    const trigger = ['input', 'blur'];

    const rules: App.Global.FormRule[] = [createRequiredRule($t('form.pwd.required'))];
    const min = num('password_min_length');
    if (min !== null) {
      rules.push({ type: 'string', min, message, trigger });
    }
    const max = num('password_max_length');
    if (max !== null) {
      rules.push({ type: 'string', max, message, trigger });
    }
    if (on('password_require_uppercase')) {
      rules.push({ pattern: /[A-Z]/, message, trigger });
    }
    if (on('password_require_lowercase')) {
      rules.push({ pattern: /[a-z]/, message, trigger });
    }
    if (on('password_require_digit')) {
      rules.push({ pattern: /[0-9]/, message, trigger });
    }
    if (on('password_require_special')) {
      rules.push({ pattern: /[^A-Za-z0-9]/, message, trigger });
    }
    if (on('password_forbid_username')) {
      rules.push({
        validator: (_rule, value: string) => {
          const name = toValue(userName);
          return !(value !== '' && name !== '' && value.toLowerCase() === name.toLowerCase());
        },
        message: $t('backend.biz.user.passwordViolation.forbidUsername'),
        trigger
      });
    }
    return rules;
  }

  return { buildPolicyRules };
}
