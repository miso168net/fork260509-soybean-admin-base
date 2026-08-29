<script setup lang="ts">
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i)] 軟區狀態需 ref／watch（rev4: 同形接線）；原行: import { computed, reactive } from 'vue';
import { computed, reactive, ref, watch } from 'vue';
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] userName 連續輸入節流取題（既有 @vueuse/core、非新依賴）：下一行為純新增。
import { useDebounceFn } from '@vueuse/core';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session] 取題 wrapper（直接路徑 import、避 barrel stale-export）：下一行為純新增。
import { fetchLoginCaptcha } from '@/service/api/rev5-auth';
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
  // ★登入表單降為**必填**規則（憲法 §III.2 之 ★軌道 BASE-WEB-LOGIN-CAPTCHA-WIRING 用途 (ii)）：
  //   `formRules.userName` 是 `[required, patternRules.userName]`，那條正則要求 6~18 位英數底線——
  //   而**設得進的密碼必須登得進**。本刀讓管理端設密、管理端重設、自助改密三入口共用後端的密碼政策
  //   單一驗證點（憲法島 I5），政策鍵可由超管在運行期調整；前端若還按一組寫死的正則擋人，就會出現
  //   「密碼照政策設好了、登入頁卻說格式不對」這種前後端各執一詞的死路。格式判定一律交後端，前端只擋「沒填」。
  //   ★MUST NOT 改 `src/constants/reg.ts`（全域正則為 register／reset-pwd 等其他表單共用）；
  //   ★兩支 stub 與用途 (i) 的 captcha 軟區條件渲染行為零變更。
  //   rev4: 承 rev4 同處拍板（前端只驗必填），rev5 於本刀 U8 隨密碼政策上線一併兌現。
  // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(ii) 007-user-password-admin] 改取 `createRequiredRule`；原行: const { formRules } = useFormRules();
  const { createRequiredRule } = useFormRules();

  return {
    // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(ii) 007-user-password-admin] 帳號名只驗必填（見上方論證）；原行: userName: formRules.userName,
    userName: [createRequiredRule($t('form.userName.required'))],
    // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(ii) 007-user-password-admin] 密碼只驗必填（見上方論證）；原行: password: formRules.pwd
    password: [createRequiredRule($t('form.pwd.required'))]
  };
});

// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session START] CAPTCHA 軟區狀態＋取題（rev4: 同形接線；★(ii) formRules 放寬不帶回——R3-12、延改密端點刀）
const captchaVisible = ref(false);
const captchaId = ref('');
const captchaCode = ref('');
const captchaImg = ref('');
/** 取題失敗旗標（true＝圖的位置改渲染可點重試提示；與「首次取題尚未回來」的空圖分得開） */
const captchaError = ref(false);

/** 取（換）題：challenge 綁定帳號名；換題即清空舊輸入（舊題已失效——提交即消耗） */
async function refreshCaptcha() {
  const { data } = await fetchLoginCaptcha(model.userName);
  if (data) {
    captchaId.value = data.captchaId;
    captchaImg.value = data.captchaImg;
    captchaCode.value = '';
    captchaError.value = false;
    return;
  }
  // ★取題失敗（後端 5000 產圖/簽章失敗、或網路瞬斷）→ 舊題三欄一律清空，絕不留著：
  // 留著的 captchaId 已被後端「提交即消耗」作廢，下一發必被判重放（2222 captchaRequired）
  // → handleSubmit 再呼叫本函式 → 故障持續即無限迴圈；而 service/request 對同一 message
  // 做 toast 去重，第二輪起連訊息都不出現＝使用者卡在「圖看得到、永遠登不進、且無訊息」。
  // 清空後：不再送出失效題、圖消失並改渲染可點的重試提示＝失敗在 UI 上明確可見。
  captchaId.value = '';
  captchaImg.value = '';
  captchaCode.value = '';
  captchaError.value = true;
}

// 帳號名連續輸入時 debounce 取題（300ms、沿 search-modal useDebounceFn 慣例），避免每鍵擊一發
const debouncedRefreshCaptcha = useDebounceFn(refreshCaptcha, 300);

// 帳號名變更→重取題（challenge 綁定帳號名，跨帳號呈遞必拒）
watch(
  () => model.userName,
  () => {
    if (captchaVisible.value) {
      debouncedRefreshCaptcha();
    }
  }
);
// [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session END]

async function handleSubmit() {
  await validate();
  // [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING(i)] 軟區接線（rev4: 同形、msg key 改 rev5 新名 biz.auth.captchaRequired）；原行: await authStore.login(model.userName, model.password);
  // 驗證碼欄可見→附掛 captchaId/captchaCode；回 captchaRequired→顯欄＋清空重取
  // （首次觸發＝自動取題；已附過 captcha 仍回 captchaRequired＝答錯/過期/重放，提交即消耗→自動換新題）
  const msg = await authStore.login(
    model.userName,
    model.password,
    true,
    captchaVisible.value ? { captchaId: captchaId.value, captchaCode: captchaCode.value } : undefined
  );
  if (msg === 'biz.auth.captchaRequired') {
    captchaVisible.value = true;
    await refreshCaptcha();
  } else if (captchaVisible.value && msg) {
    // 軟區已開啟時的其他失敗一律換題。主案＝答對 captcha 但密碼錯（1000）：後端提交即消耗，
    // 舊 captchaId 已失效，不換則下一發必被判重放（2222、零計數）而空轉一輪，count 無法連續
    // 推進（T057 DoD「答對密碼錯自動換題」＋quickstart §4 的 2→3→4→5）。硬鎖（locked）那路
    // 題其實未耗（後端硬鎖判定早於 captcha gate），一併換題只是多取一張、無副作用。
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
    <!-- [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session START] CAPTCHA 軟區條件渲染：驗證碼圖（原尺寸 220×120、點圖換題）在上、輸入欄在下（w-220px wrapper 約束 NInput 寬、否則其預設寬撐滿）；文案復用 upstream 既有 i18n 鍵（零新 page.* 鍵） -->
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
          取題失敗時圖為空：改渲染可點的重試提示（沿用既有 common.* 鍵、零新 page.* 鍵），
          否則圖消失後使用者只剩一個沒有圖的輸入欄、也沒有手動重取的入口。
          ★以 captchaError 為條件而非 v-else：首次取題尚未回來時圖也是空的，用 v-else
          會在載入中先閃一次錯誤字樣
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
    <!-- [rev5-inline BASE-WEB-LOGIN-CAPTCHA-WIRING+ 003-auth-session END] -->
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
