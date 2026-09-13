<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';
// [rev6-inline BASE-WEB-AUTH-WIRING(b)+ 003-auth-session] 下一行為純新增：替代登入 stub wrapper 以直接路徑 import（避 barrel 於 vite HMR 殘留舊 export、沿 rev6-auth.ts 檔頭自陳）。
import { fetchCodeLoginStub } from '@/service/api/rev6-auth';

defineOptions({
  name: 'CodeLogin'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  phone: string;
  code: string;
}

const model: FormModel = reactive({
  phone: '',
  code: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    phone: formRules.phone,
    code: formRules.code
  };
});

async function handleSubmit() {
  await validate();
  // request
  // [rev6-inline BASE-WEB-AUTH-WIRING(b) 003-auth-session] 送出改打後端誠實 stub（恆 2222、攔截器經 backend.* 轉譯後顯「該功能尚未開放」）、upstream 的假成功 toast 就此消滅；原行: window.$message?.success($t('page.login.common.validateSuccess'));
  await fetchCodeLoginStub(model.phone, model.code);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="phone">
      <NInput v-model:value="model.phone" :placeholder="$t('page.login.common.phonePlaceholder')" />
    </NFormItem>
    <NFormItem path="code">
      <div class="w-full flex-y-center gap-16px">
        <NInput v-model:value="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <NButton size="large" :disabled="isCounting" :loading="loading" @click="getCaptcha(model.phone)">
          {{ label }}
        </NButton>
      </div>
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
