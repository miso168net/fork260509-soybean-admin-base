<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center)：net-new 改密卡——rev3 025 藍本逐項復刻（radio 三選＋政策動態
  rules＋toRef confirm）＋行為增補三處（D3 成功 toast 專屬鍵／D4 forbid_username 第 7 鍵／clarify 新≠舊即時
  rule）；憲法 §III.2(g) 授權。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchChangePassword, fetchGetPasswordPolicy } from '@/service/api/rev4-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PasswordCard'
});

// 本人真帳號來源＝父層 canonical model 之 userName prop（D4 即時比對用；任務字面預授權的唯一 prop 例外）。
// ★不可用 authStore.userInfo.userName——該欄＝sys_user.nick_name 別名（憲法 L45、auth.rs getUserInfo 投影），
//   以暱稱比對＝D4 對象錯位（U9 CDP 實測抓獲）；真帳號唯 getProfile.userName 承載。
const props = withDefaults(defineProps<{ userName?: string }>(), { userName: '' });
const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();

/** 驗證方式：old＝舊密碼（唯一真改密路徑、預設）；email/phone＝驗證碼純佔位（FR-012、不接後端） */
type VerifyMethod = 'old' | 'email' | 'phone';

const verifyMethod = ref<VerifyMethod>('old');

const model = reactive({
  /** 前方輸入框（依驗證方式回填語意）：old→舊密碼、email/phone→驗證碼 */
  credential: '',
  newPassword: '',
  confirmPassword: ''
});

// ★切換驗證方式即清空 credential：credential 的 :type 隨方式在 password↔text 間翻轉，
//   不清空會讓已輸入的舊密碼在切到驗證碼模式時明文顯示（shoulder-surfing 防護、rev3 已知坑）。
watch(verifyMethod, () => {
  model.credential = '';
});

/** credential 欄 placeholder＝當前驗證方式名（回填提示） */
const credentialLabel = computed(() => {
  const map: Record<VerifyMethod, string> = {
    old: $t('page.userCenter.oldPassword'),
    email: $t('page.userCenter.verify.emailCode'),
    phone: $t('page.userCenter.verify.phoneCode')
  };
  return map[verifyMethod.value];
});

/** 新密碼政策 rules：起手僅 required；onMounted 讀當前政策後以 buildPolicyRules 動態擴充 */
const newPasswordRules = ref<App.Global.FormRule[]>([createRequiredRule($t('form.pwd.required'))]);

// 依政策 7 鍵組 naive rule：KV Map 化、number 鍵 parseInt 且 NaN 略過、bool 鍵值 'on' 才出規則、
// trigger＝input＋blur；六政策鍵 rules 訊息統一單句取 page.userCenter.pwdPolicyNotMet（D2 後半兌現、
// rev3 藍本同構；user 親決 2026-07-17）——儲存時 BizData violations 明細 toast 另管線、後端單一驗證點
// 為權威、前端提示為輔。
// ★D4 行為增補：補第 7 鍵 forbid_username（rev3 僅消費 6/7＝其自認遺留）——與本人帳號
//   case-insensitive 相等即紅字（鏡像後端 VIOLATION_FORBID_USERNAME 語意：相等、非子串）；
//   即時訊息維持 forbidUsername 明細譯文（rev4 新增行為、不在 rev3 六鍵統一單句射程內）。
function buildPolicyRules(settings: Api.UserCenter.PasswordPolicyItem[]): App.Global.FormRule[] {
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
        const userName = props.userName;
        return !(value !== '' && userName !== '' && value.toLowerCase() === userName.toLowerCase());
      },
      message: $t('backend.biz.user.passwordViolation.forbidUsername'),
      trigger
    });
  }
  return rules;
}

// 動態 rules：新密碼＝政策 rules＋新≠舊即時 rule；credential 不掛 required（後端 verify 把關）。
// ★confirm rule 必傳 toRef（非值快照）：validator 執行時 toValue 動態讀當下 newPassword，
//   消除「rules computed 未 flush 前 validate 用舊快照」的時序耦合（rev3 latent bug 防重踩）。
// ★clarify 行為增補：僅「舊密碼」驗證方式下，新密碼與 credential（舊密碼）同值即紅字——
//   端點固有規則非政策鍵，後端 facade 固定序（passwordSameAsOld）為權威。
const rules = computed(() => ({
  newPassword: [
    ...newPasswordRules.value,
    {
      validator: (_rule, value: string) => !(verifyMethod.value === 'old' && value !== '' && value === model.credential),
      message: $t('backend.biz.user.passwordSameAsOld'),
      trigger: ['input', 'blur']
    } satisfies App.Global.FormRule
  ],
  confirmPassword: createConfirmPwdRule(toRef(model, 'newPassword'))
}));

async function loadPolicyRules() {
  // 讀 auth-only getPasswordPolicy（任一登入者可讀、僅 7 鍵 password_* 投影）；
  // 失敗（網路/異常）維持 required 起手 rule 靜默降級——後端驗證為權威。
  const { data, error } = await fetchGetPasswordPolicy();
  if (!error && data) {
    newPasswordRules.value = buildPolicyRules(data);
  }
}

async function handleSave() {
  // 非舊密碼路徑＝驗證碼佔位（FR-012）：toast 功能建置中、零網路請求。
  if (verifyMethod.value !== 'old') {
    window.$message?.info($t('page.userCenter.verify.comingSoon'));
    return;
  }
  await validate();
  const { error } = await fetchChangePassword({
    oldPassword: model.credential,
    newPassword: model.newPassword,
    confirmPassword: model.confirmPassword
  });
  // 失敗拒因由攔截層 toast 自動渲染（BizData violations 明細管線 011 已備、前端零自建 UI）。
  if (!error) {
    // ★D3 行為增補：成功 toast 用專屬鍵（含「其他裝置已登出」揭露、不用 common.updateSuccess）＋成功清場。
    window.$message?.success($t('page.userCenter.changePwdSuccessRevoked'));
    model.credential = '';
    model.newPassword = '';
    model.confirmPassword = '';
    restoreValidation();
  }
}

onMounted(loadPolicyRules);
</script>

<template>
  <NCard :title="$t('page.userCenter.passwordTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
    </template>
    <!-- 改密卡 label-width 刻意 100（其餘卡 76）——rev3 藍本刻意差異、照抄勿統一 -->
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
      <!-- row1：驗證方式（舊密碼 radio＋前方輸入框｜信箱/手機驗證碼 radio＋回填提示）；三 radio 同一 group -->
      <NRadioGroup v-model:value="verifyMethod" class="w-full">
        <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
          <NGi>
            <NFormItem>
              <template #label>
                <NRadio value="old">{{ $t('page.userCenter.oldPassword') }}</NRadio>
              </template>
              <NInput
                v-model:value="model.credential"
                :type="verifyMethod === 'old' ? 'password' : 'text'"
                show-password-on="click"
                :placeholder="credentialLabel"
              />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem :show-label="false">
              <NSpace align="center" :size="12">
                <NRadio value="email">{{ $t('page.userCenter.verify.emailCode') }}</NRadio>
                <NRadio value="phone">{{ $t('page.userCenter.verify.phoneCode') }}</NRadio>
                <span class="uc-hint">（{{ $t('page.userCenter.verify.backfillHint') }}）</span>
              </NSpace>
            </NFormItem>
          </NGi>
        </NGrid>
      </NRadioGroup>
      <!-- row2：新密碼｜確認新密碼（required、標 *） -->
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.newPassword')" path="newPassword">
            <NInput v-model:value="model.newPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.confirmPassword')" path="confirmPassword">
            <NInput v-model:value="model.confirmPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped>
.uc-hint {
  font-size: 12px;
  color: var(--n-text-color-disabled, rgb(153 153 153));
}
</style>
