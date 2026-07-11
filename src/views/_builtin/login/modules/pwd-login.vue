<script setup lang="ts">
// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 原行: import { computed, reactive } from 'vue';
import { computed, reactive, ref, watch } from 'vue';
// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) B-075①] userName 連續輸入節流取題（用既有 @vueuse/core、非新依賴）
import { useDebounceFn } from '@vueuse/core';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 取題 wrapper（直接路徑 import、避 barrel stale-export）
import { fetchLoginCaptcha } from '@/service/api/rev4-login-captcha';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  userName: string;
  password: string;
}

const model: FormModel = reactive({
  userName: 'Soybean',
  password: '123456'
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd
  };
});

// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle START] CAPTCHA 軟區狀態＋取題（ADR 0040 一用途 (i)）
const captchaVisible = ref(false);
const captchaId = ref('');
const captchaCode = ref('');
const captchaImg = ref('');

/** 取（換）題：challenge 綁定帳號名；換題即清空舊輸入（舊題已失效） */
async function refreshCaptcha() {
  const { data } = await fetchLoginCaptcha(model.userName);
  if (data) {
    captchaId.value = data.captchaId;
    captchaImg.value = data.captchaImg;
    captchaCode.value = '';
  }
}

// B-075①：帳號名連續輸入時 debounce 取題（300ms、沿 search-modal useDebounceFn 慣例），避免每鍵擊一發
const debouncedRefreshCaptcha = useDebounceFn(refreshCaptcha, 300);

// 帳號名變更→重取題（challenge 綁定帳號名，跨帳號呈遞必拒——spec US2 場景 5）
watch(
  () => model.userName,
  () => {
    if (captchaVisible.value) {
      debouncedRefreshCaptcha();
    }
  }
);
// [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle END]

async function handleSubmit() {
  await validate();
  // [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle] 原行: await authStore.login(model.userName, model.password);
  // 軟區接线：驗證碼欄可見→附掛 captchaId/captchaCode；回 captchaRequired→顯欄＋清空重取
  // （首次觸發＝自動取題；已附過 captcha 仍回 captchaRequired＝答錯/過期/重放，提交即消耗→自動換新題）
  const msg = await authStore.login(
    model.userName,
    model.password,
    true,
    captchaVisible.value ? { captchaId: captchaId.value, captchaCode: captchaCode.value } : undefined
  );
  if (msg === 'auth.login.captchaRequired') {
    captchaVisible.value = true;
    await refreshCaptcha();
  }
}

type AccountKey = 'super' | 'admin' | 'user';

interface Account {
  key: AccountKey;
  label: string;
  userName: string;
  password: string;
}

const accounts = computed<Account[]>(() => [
  {
    key: 'super',
    label: $t('page.login.pwdLogin.superAdmin'),
    userName: 'Super',
    password: '123456'
  },
  {
    key: 'admin',
    label: $t('page.login.pwdLogin.admin'),
    userName: 'Admin',
    password: '123456'
  },
  {
    key: 'user',
    label: $t('page.login.pwdLogin.user'),
    userName: 'User',
    password: '123456'
  }
]);

async function handleAccountLogin(account: Account) {
  await authStore.login(account.userName, account.password);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="userName">
      <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <!-- [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle START] CAPTCHA 軟區條件渲染：驗證碼圖（原尺寸 220×120、點圖換題）在上、輸入欄在下（w-220px wrapper 約束 NInput 寬、否則其預設寬撐滿）；文案復用 upstream 既有 i18n 鍵（FR-018 零新 page.* 鍵） -->
    <NFormItem v-if="captchaVisible">
      <div class="w-full flex-col items-start gap-10px">
        <img
          v-if="captchaImg"
          :src="captchaImg"
          :alt="$t('page.login.codeLogin.imageCodePlaceholder')"
          class="h-120px w-220px cursor-pointer"
          @click="refreshCaptcha"
        />
        <div class="w-220px">
          <NInput v-model:value="captchaCode" :placeholder="$t('page.login.codeLogin.imageCodePlaceholder')" />
        </div>
      </div>
    </NFormItem>
    <!-- [rev4-inline ★BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 007-login-throttle END] -->
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div>
      <NDivider class="text-14px text-#666 !m-0">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</NDivider>
      <div class="flex-center gap-12px">
        <NButton v-for="item in accounts" :key="item.key" type="primary" @click="handleAccountLogin(item)">
          {{ item.label }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>

<style scoped></style>
