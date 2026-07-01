<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 修改密码卡（US2：舊/新/確認 input＋動態密碼 rule＋改密码送出） -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchChangePassword, fetchGetPasswordPolicy } from '@/service/api/rev3-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();

const model = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 新密規則：預設僅 required；onMounted 讀當前政策後動態擴充（min/max/字元類別）。
const newPasswordRules = ref<App.Global.FormRule[]>([createRequiredRule($t('form.pwd.required'))]);

// 依當前 7 個密碼政策鍵組 naive rule（number 鍵 parseInt、bool 鍵 === 'on'）；
// 訊息統一用「不符合密碼複雜度政策」（避免新增 i18n 鍵）；後端 validate_password_complexity 為權威把關。
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

// 動態 rules（confirmPassword 綁 newPassword、隨其變化重算；newPassword 用政策 rule）。
const rules = computed(() => ({
  oldPassword: createRequiredRule($t('form.required')),
  newPassword: newPasswordRules.value,
  confirmPassword: createConfirmPwdRule(model.newPassword)
}));

async function loadPolicyRules() {
  // 讀 auth-only /userCenter/getPasswordPolicy（任一登入者可讀、僅 7 個政策 KV）；
  // 刻意不讀 super-only /systemManage/getSystemSettings（非-super 會撞 403 toast＋政策靜默退化）。
  const { data, error } = await fetchGetPasswordPolicy();
  if (!error && data) {
    newPasswordRules.value = buildPolicyRules(data);
  }
}

async function handleChangePwd() {
  await validate();
  const { error } = await fetchChangePassword({
    oldPassword: model.oldPassword,
    newPassword: model.newPassword,
    confirmPassword: model.confirmPassword
  });
  // 失敗由攔截器 toast biz 訊息（backend.biz.password.*／backend.biz.user.notFound）。
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    model.oldPassword = '';
    model.newPassword = '';
    model.confirmPassword = '';
    restoreValidation();
  }
}

onMounted(loadPolicyRules);
</script>

<template>
  <NCard :title="$t('page.userCenter.passwordTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
      <NFormItem :label="$t('page.userCenter.oldPassword')" path="oldPassword">
        <NInput v-model:value="model.oldPassword" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.newPassword')" path="newPassword">
        <NInput v-model:value="model.newPassword" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.confirmPassword')" path="confirmPassword">
        <NInput v-model:value="model.confirmPassword" type="password" show-password-on="click" />
      </NFormItem>
      <NFormItem>
        <NButton type="primary" @click="handleChangePwd">{{ $t('page.userCenter.changePwdBtn') }}</NButton>
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped></style>
