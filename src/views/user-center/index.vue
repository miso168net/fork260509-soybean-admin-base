<script setup lang="ts">
import { computed, ref } from 'vue';
import { fetchChangePassword } from '@/service/api/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserCenter'
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule, formRules, createConfirmPwdRule } = useFormRules();

interface Model {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function createDefaultModel(): Model {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}

const model = ref(createDefaultModel());

const rules = computed(() => ({
  currentPassword: defaultRequiredRule,
  newPassword: formRules.pwd,
  confirmPassword: createConfirmPwdRule(model.value.newPassword)
}));

async function handleSubmit() {
  await validate();

  const { error } = await fetchChangePassword({
    currentPassword: model.value.currentPassword,
    newPassword: model.value.newPassword
  });

  if (error) return;

  window.$message?.success($t('common.updateSuccess'));
  model.value = createDefaultModel();
  restoreValidation();
}
</script>

<template>
  <NCard title="修改密码" :bordered="false" class="card-wrapper">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100" class="max-w-400px">
      <NFormItem label="旧密码" path="currentPassword">
        <NInput v-model:value="model.currentPassword" type="password" show-password-on="click" placeholder="请输入旧密码" />
      </NFormItem>
      <NFormItem label="新密码" path="newPassword">
        <NInput v-model:value="model.newPassword" type="password" show-password-on="click" placeholder="请输入新密码" />
      </NFormItem>
      <NFormItem label="确认新密码" path="confirmPassword">
        <NInput
          v-model:value="model.confirmPassword"
          type="password"
          show-password-on="click"
          placeholder="请再次输入新密码"
        />
      </NFormItem>
      <NFormItem :show-label="false">
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped></style>
