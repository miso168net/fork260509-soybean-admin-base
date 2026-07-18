<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center)：net-new 改密卡——rev3 025 藍本逐項復刻（radio 三選＋政策動態
  rules＋toRef confirm）＋行為增補三處（D3 成功 toast 專屬鍵／D4 forbid_username 第 7 鍵／clarify 新≠舊即時
  rule）；憲法 §III.2(g) 授權。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchChangePassword, fetchGetPasswordPolicy } from '@/service/api/rev4-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// 015 T016：政策 rules 組建抽至共用 hook（供本卡＋force-change-pwd 強制改密頁共用；行為零變更）
import { usePwdPolicyRules } from '@/hooks/business/pwd-policy';
import { $t } from '@/locales';
// 015 T019：產密浮層（儲存前「隨機密碼」鈕；憲法 §III.2(k) 授權、(g) 本人自助射程確認）
import PwdGenModal from '@/components/custom/pwd-gen-modal.vue';

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

// 015 T019：產密浮層開關＋政策原始 7 鍵留存（浮層構造性生成資料源；rules 另經共用 hook 組建）
const showGen = ref(false);
const policyItems = ref<Api.UserCenter.PasswordPolicyItem[]>([]);

// 政策 7 鍵→naive rules 組建（含 D2 六鍵統一單句＋D4 forbid_username 第 7 鍵）：
// 015 T016 抽至共用 hook usePwdPolicyRules（hooks/business/pwd-policy.ts、規則逐字搬移、行為零變更）；
// userName 傳 getter——validator 執行時動態讀當下 props.userName（原即時比對語意不變）。
const { buildPolicyRules } = usePwdPolicyRules();

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
    // 015 T019：留存政策原始 7 鍵供產密浮層構造性生成（卡片已讀政策、零重複請求）
    policyItems.value = data;
    newPasswordRules.value = buildPolicyRules(data, () => props.userName);
  }
}

// 015 T019：浮層「帶入」＝新密＋確認兩欄同值回填、維持遮蔽（密碼已於浮層帶入時自動複製到剪貼簿供抄存）；
// 後續仍走既有自助改密流程（不觸發任何強制、成功撤他裝置照舊 014 語意）。
function handleGenApply(password: string) {
  model.newPassword = password;
  model.confirmPassword = password;
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
      <!-- 015 T019：儲存前「隨機密碼」鈕（開產密浮層；(g) 本人自助射程） -->
      <NSpace :size="8">
        <NButton size="small" @click="showGen = true">{{ $t('pwdGen.title') }}</NButton>
        <NButton type="primary" size="small" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
      </NSpace>
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
            <!-- 015 T019：浮層帶入後維持遮蔽（密碼已於浮層帶入時自動複製到剪貼簿供抄存）；想看可自行點眼睛 -->
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
    <!-- 015 T019：產密浮層掛載（policy＝卡片已讀政策；userName＝本人真帳號 prop〔getProfile 源、非暱稱別名〕） -->
    <PwdGenModal v-model:show="showGen" :policy="policyItems" :user-name="userName" @apply="handleGenApply" />
  </NCard>
</template>

<style scoped>
.uc-hint {
  font-size: 12px;
  color: var(--n-text-color-disabled, rgb(153 153 153));
}
</style>
