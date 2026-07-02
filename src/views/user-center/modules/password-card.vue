<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 修改密码塊：验证方式 radio（旧密码 default 真改密／邮箱・手机验证码 純佔位）＋新/确认密码；header 保存＝旧密码路徑改密、其餘 toast 建置中 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef, watch } from 'vue';
import { fetchChangePassword, fetchGetPasswordPolicy } from '@/service/api/rev3-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();

// 验证方式：old=旧密码（唯一真的能改密）／email/phone=驗證碼（純佔位、保存→建置中；手機/信箱驗證預留、不接後端）
type VerifyMethod = 'old' | 'email' | 'phone';
const verifyMethod = ref<VerifyMethod>('old');

const model = reactive({
  // 前方輸入框（回填）：old→旧密码、email/phone→验证码
  credential: '',
  newPassword: '',
  confirmPassword: ''
});

// ★ 切換验证方式即清空回填框：credential 的 :type 隨方式翻 password↔text，
//   不清空會讓已輸入的舊密碼在切到驗證碼模式時明文顯示（shoulder-surfing）。
watch(verifyMethod, () => {
  model.credential = '';
});

// 前方輸入框的 placeholder＝當前驗證方式（回填提示）
const credentialLabel = computed(() => {
  const map: Record<VerifyMethod, string> = {
    old: $t('page.userCenter.oldPassword'),
    email: $t('page.userCenter.verify.emailCode'),
    phone: $t('page.userCenter.verify.phoneCode')
  };
  return map[verifyMethod.value];
});

// 新密規則：預設僅 required；onMounted 讀當前政策後動態擴充（min/max/字元類別）。
const newPasswordRules = ref<App.Global.FormRule[]>([createRequiredRule($t('form.pwd.required'))]);

// 依當前 7 個密碼政策鍵組 naive rule（number 鍵 parseInt、bool 鍵 === 'on'）；
// 訊息統一用「不符合密碼複雜度政策」；後端 validate_password_complexity 為權威把關。
function buildPolicyRules(settings: Api.UserCenter.PasswordPolicyItem[]): App.Global.FormRule[] {
  const map = new Map(settings.map(s => [s.settingKey, s.settingValue]));
  const num = (key: string) => {
    const parsed = Number.parseInt(map.get(key) ?? '', 10);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const on = (key: string) => map.get(key) === 'on';
  const message = $t('backend.biz.password.tooWeak');
  const trigger = ['input', 'blur'];

  const rules: App.Global.FormRule[] = [createRequiredRule($t('form.pwd.required'))];
  const min = num('password_min_length');
  if (min !== null) rules.push({ type: 'string', min, message, trigger });
  const max = num('password_max_length');
  if (max !== null) rules.push({ type: 'string', max, message, trigger });
  if (on('password_require_uppercase')) rules.push({ pattern: /[A-Z]/, message, trigger });
  if (on('password_require_lowercase')) rules.push({ pattern: /[a-z]/, message, trigger });
  if (on('password_require_digit')) rules.push({ pattern: /[0-9]/, message, trigger });
  if (on('password_require_special')) rules.push({ pattern: /[^A-Za-z0-9]/, message, trigger });
  return rules;
}

// 動態 rules（新密用政策 rule；旧密不標 required、後端 verify 把關）。
// ★ confirm rule 傳 toRef（非值快照）：validator 執行時 toValue 動態讀當下 newPassword、
//   消除「rules computed 未 flush 前 validate 用舊快照」的時序耦合（CDP 同 tick 設值+點擊實測踩到）。
const rules = computed(() => ({
  newPassword: newPasswordRules.value,
  confirmPassword: createConfirmPwdRule(toRef(model, 'newPassword'))
}));

async function loadPolicyRules() {
  // 讀 auth-only /userCenter/getPasswordPolicy（任一登入者可讀、僅 7 個政策 KV）；
  // 刻意不讀 super-only /systemManage/getSystemSettings（非-super 會撞 403 toast＋政策靜默退化）。
  const { data, error } = await fetchGetPasswordPolicy();
  if (!error && data) {
    newPasswordRules.value = buildPolicyRules(data);
  }
}

async function handleSave() {
  // 驗證方式非旧密码＝手機/信箱驗證預留（不接後端）→ toast 建置中、不送出。
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
  // 失敗由攔截器 toast biz 訊息（backend.biz.password.*／backend.biz.user.notFound）。
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
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
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
      <!-- row1：验证方式（旧密码 radio + 前方輸入框 | 邮箱/手机验证码 radio + 回填提示）；三 radio 同一 group -->
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
      <!-- row2：新密码 | 确认新密码（required、標 *） -->
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
