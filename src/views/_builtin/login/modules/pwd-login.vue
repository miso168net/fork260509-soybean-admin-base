<script setup lang="ts">
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 003-auth-session] 軟區狀態需 ref／watch；原行: import { computed, reactive } from 'vue';
import { computed, reactive, ref, watch } from 'vue';
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：帳號名連續輸入時節流取題（@vueuse/core 為 base-web 既有依賴、零新依賴）
import { useDebounceFn } from '@vueuse/core';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 下一行為純新增：取題 wrapper 以直接路徑 import（避 barrel 於 vite HMR 殘留舊 export）
import { fetchLoginCaptcha } from '@/service/api/rev6-auth';
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

// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session START] 軟區狀態＋取題（★(ii) formRules 放寬不在授權內、不動；rev5:pwd-login.vue 同形接線、msg key 同名）
const captchaVisible = ref(false);
const captchaId = ref('');
const captchaCode = ref('');
const captchaImg = ref('');
/** 取題失敗旗標：true＝圖的位置改渲染可點的重試提示（與「首次取題尚未回來」的空圖分得開） */
const captchaError = ref(false);

/** 取（換）題：題目綁帳號名；換題即清空舊輸入——舊題已作廢（後端提交即消耗） */
async function refreshCaptcha() {
  const { data } = await fetchLoginCaptcha(model.userName);
  if (data) {
    captchaId.value = data.captchaId;
    captchaImg.value = data.captchaImg;
    captchaCode.value = '';
    captchaError.value = false;
    return;
  }
  // ★取題失敗（後端 5000 產圖／簽章失敗、或網路瞬斷）→ 三欄一律清空、絕不留失效題：
  // 留著的 captchaId 已被後端消耗，下一發必判重放（2222 captchaRequired）→ handleSubmit 又呼叫本函式
  // → 只要故障不退就會陷入無限迴圈；再加上 service/request 會把相同 message 的 toast 去重，第二輪起連訊息都不出現＝
  // 使用者卡在「圖看得到、永遠登不進、且無提示」。清空後圖消失、改渲染可點的重試提示＝失敗在 UI 上可見。
  captchaId.value = '';
  captchaImg.value = '';
  captchaCode.value = '';
  captchaError.value = true;
}

// 帳號名連續輸入時 debounce 取題（300ms、沿 search-modal 的 useDebounceFn 慣例），不每個鍵擊打一發
const debouncedRefreshCaptcha = useDebounceFn(refreshCaptcha, 300);

// 帳號名一變就換題：題目綁定帳號名、跨帳號呈遞後端必拒
watch(
  () => model.userName,
  () => {
    if (captchaVisible.value) {
      debouncedRefreshCaptcha();
    }
  }
);
// [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session END]

async function handleSubmit() {
  await validate();
  // [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i) 003-auth-session] 軟區接線：驗證碼欄可見才附掛 captchaId／captchaCode、非軟區送出形與原行全等；原行: await authStore.login(model.userName, model.password);
  const msg = await authStore.login(
    model.userName,
    model.password,
    true,
    captchaVisible.value ? { captchaId: captchaId.value, captchaCode: captchaCode.value } : undefined
  );
  if (msg === 'biz.auth.captchaRequired') {
    // 首次收到＝進軟區、顯欄並自動取題；已附題仍收到＝答錯／過期／重放（提交即消耗）→ 自動換新題
    captchaVisible.value = true;
    await refreshCaptcha();
  } else if (captchaVisible.value && msg) {
    // 軟區換題契約（contracts/wire-auth.md）：軟區內任何其他失敗一律換題並清輸入。主案＝答對題但密碼錯（1000）：
    // 後端提交即消耗、舊 captchaId 已作廢，不換則下一發必判重放（2222、零計數）空轉一輪。鎖定（locked）那路
    // 題其實未耗（後端鎖定判定早於 captcha gate），一併換題只是多取一張、無副作用。
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
    <!-- [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session START] 軟區條件渲染：上方為驗證碼圖（保持原尺寸 220×120、點圖即換題），下方為輸入欄（外層以 w-220px wrapper 包住、約束 NInput 寬度）；文案沿用 upstream 既有 i18n 鍵、零新 page.* 鍵 -->
    <NFormItem v-if="captchaVisible">
      <div class="w-full flex-col items-start gap-10px">
        <img
          v-if="captchaImg"
          :src="captchaImg"
          :alt="$t('page.login.codeLogin.imageCodePlaceholder')"
          class="h-120px w-220px cursor-pointer"
          @click="refreshCaptcha"
        />
        <!--
          取題失敗時沒有圖可顯示：這裡改渲染一個可點擊的重試提示（沿用既有 common.error／common.refresh 鍵）；少了它，
          圖一消失畫面就只剩孤零零的輸入欄，使用者也找不到手動重新取題的入口。★判斷條件用 captchaError、不用
          v-else：第一次取題的回應還沒到時圖同樣是空的，若用 v-else，載入期間會先閃過一次錯誤字樣
        -->
        <div
          v-else-if="captchaError"
          class="h-120px w-220px flex-center cursor-pointer border border-#e5e5e5 rounded text-14px text-#999"
          @click="refreshCaptcha"
        >
          {{ $t('common.error') }} - {{ $t('common.refresh') }}
        </div>
        <div class="w-220px">
          <NInput v-model:value="captchaCode" :placeholder="$t('page.login.codeLogin.imageCodePlaceholder')" />
        </div>
      </div>
    </NFormItem>
    <!-- [rev6-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session END] -->
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
