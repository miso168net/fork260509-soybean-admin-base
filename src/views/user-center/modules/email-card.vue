<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center、020-email-verify-smtp 接真)：net-new 信箱卡——020 信箱驗證流
  （contracts C10 動線：驗證態徽章含時刻＋captcha 取題點圖換題與發碼後自動換題＋發碼冷卻倒數〔純前端 60s、
  誤按由 emailCooldown 拒因 remainingSeconds 重建〕＋回填驗證→saved 重拉＋解綁 NPopconfirm 二次確認〔未綁定
  不顯示〕；獨立儲存鈕退場、信箱不再走 updateProfile——C5）。憲法 §III.2(g) 擴字串 v1.15.0 信箱驗證流授權。
  ★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useCountDown } from '@sa/hooks';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import {
  fetchEmailCaptcha,
  fetchSendEmailCode,
  fetchUnbindEmail,
  fetchVerifyEmailCode
} from '@/service/api/rev4-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'EmailCard'
});

interface Props {
  /** 個人中心 canonical model（index.vue 持有、三卡 prop 共綁；本卡讀 userEmail 現值＋emailVerifiedAt 驗證態） */
  model: Api.UserCenter.ProfileRes;
}

const props = defineProps<Props>();

interface Emits {
  /** 驗證／解綁成功後通知 index.vue 重拉 getProfile（無酬載單事件形；綁定值與徽章時刻由重拉刷新） */
  (e: 'saved'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate } = useNaiveForm();
const { formRules } = useFormRules();

// 發碼標的＝本地輸入值（非直綁 model.userEmail——驗證成功前庫值不動、成功後由 saved 重拉刷新）；
// 載入／重拉後同步現值進輸入框（US2 AC1：admin 預填之未驗證現值可直接發碼補驗）。
const form = reactive({ newEmail: '' });

watch(
  () => props.model.userEmail,
  val => {
    form.newEmail = val ?? '';
  },
  { immediate: true }
);

// 發碼必填＋格式規則（required＋pattern；後端 emailFormatInvalid 為終判、前端先擋空值與明顯壞形）
const rules = {
  newEmail: formRules.email
};

/** RFC3339（帶 offset）→ 顯示形 `YYYY-MM-DD HH:mm:ss`（同目錄 basic-info-card 先例形、零 dayjs） */
function formatDateTime(value: string | null) {
  if (!value) {
    return '';
  }
  return value.replace('T', ' ').slice(0, 19);
}

// captcha 狀態三件（C1；沿 pwd-login 慣例、實作獨立於 login 軌道）
const captchaId = ref('');
const captchaAnswer = ref('');
const captchaImg = ref('');

/** 取（換）題：challenge 提交即消耗——點圖換題＋每次發碼後一律換新題；換題即清空舊輸入（舊題已失效） */
async function refreshCaptcha() {
  const { data } = await fetchEmailCaptcha();
  if (data) {
    captchaId.value = data.captchaId;
    captchaImg.value = data.captchaImg;
    captchaAnswer.value = '';
  }
}

onMounted(refreshCaptcha);

// 冷卻倒數（C10：純前端 60s、重整即消失；誤按由 emailCooldown 拒因 remainingSeconds 重建——clarify Q4）
const { count, isCounting, start } = useCountDown(60);

const sending = ref(false);

// 發送鈕雙態 label（idle 顯發送、counting 顯倒數——{seconds} 佔位照 C8 字面）
const sendBtnLabel = computed(() =>
  isCounting.value
    ? $t('page.userCenter.verify.cooldown', { seconds: count.value })
    : $t('page.userCenter.verify.sendCode')
);

// 回填態（C10）：verifyToken 非空＝已發碼、顯示碼輸入＋驗證鈕
const verifyToken = ref('');
const code = ref('');

async function handleSendCode() {
  await validate();
  if (sending.value) {
    return;
  }
  sending.value = true;
  const { data, error } = await fetchSendEmailCode({
    newEmail: form.newEmail,
    captchaId: captchaId.value,
    captchaAnswer: captchaAnswer.value
  });
  if (!error && data) {
    // 成功才啟動倒數（hooks/business/captcha.ts 先例）；進回填態＋清舊碼
    verifyToken.value = data.verifyToken;
    code.value = '';
    window.$message?.success($t('page.userCenter.verify.sendSuccess'));
    start();
  } else if (error) {
    // 拒因分流（toast 譯文由攔截層 onError 統一顯示、此處只按拒因調 UI 行為）：
    // error.response.data＝後端信封（msg=i18n key、data=結構化明細）——flatRequest AxiosError 形
    const envelope = error.response?.data;
    if (envelope?.msg === 'biz.userCenter.emailCooldown') {
      // 冷卻中誤按（含重整後倒數遺失）：以 data.remainingSeconds 重建倒數
      const detail = envelope.data as { remainingSeconds?: number } | null;
      const remaining = Number(detail?.remainingSeconds);
      if (Number.isFinite(remaining) && remaining > 0) {
        start(remaining);
      }
    }
  }
  // challenge 單次消耗：答錯（emailCaptchaInvalid）自動換題；其餘成敗該題皆已耗→一律換新題
  await refreshCaptcha();
  sending.value = false;
}

const verifying = ref(false);

async function handleVerify() {
  if (verifying.value) {
    return;
  }
  verifying.value = true;
  const { error } = await fetchVerifyEmailCode({
    verifyToken: verifyToken.value,
    code: code.value
  });
  if (!error) {
    // 一步寫入成功：清回填態、通知父層重拉（綁定值＋徽章時刻由 getProfile 刷新）
    verifyToken.value = '';
    code.value = '';
    window.$message?.success($t('page.userCenter.verify.verifySuccess'));
    emit('saved');
  }
  // 失敗（錯碼／過期／憑據作廢等）：拒因 toast 由攔截層顯示；作廢類須重新發碼（重發受冷卻管制）
  verifying.value = false;
}

async function handleUnbind() {
  const { error } = await fetchUnbindEmail();
  if (!error) {
    // 解綁成功：沿 common.updateSuccess（C8 無專屬解綁成功鍵）；清空顯示由父層重拉承接
    window.$message?.success($t('common.updateSuccess'));
    emit('saved');
  }
}
</script>

<template>
  <NCard :title="$t('page.userCenter.emailTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <!-- 驗證態徽章（FR-009）：emailVerifiedAt 非 null＝已驗證含時刻；否則灰標未驗證 -->
      <NTag v-if="model.emailVerifiedAt" type="success" size="small">
        {{ $t('page.userCenter.verify.verified', { time: formatDateTime(model.emailVerifiedAt) }) }}
      </NTag>
      <NTag v-else size="small">{{ $t('page.userCenter.verify.notVerified') }}</NTag>
    </template>
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" :label-width="76">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <!-- 信箱輸入（發碼標的；載入同步現值）＋解綁鈕（US1 AC10：未綁定不顯示；NPopconfirm 二次確認） -->
          <NFormItem :label="$t('page.userCenter.userEmail')" path="newEmail">
            <div class="w-full flex-y-center gap-12px">
              <NInput v-model:value="form.newEmail" />
              <NPopconfirm v-if="model.userEmail" @positive-click="handleUnbind">
                <template #trigger>
                  <NButton size="small">{{ $t('page.userCenter.verify.unbind') }}</NButton>
                </template>
                {{ $t('page.userCenter.verify.unbindConfirm') }}
              </NPopconfirm>
            </div>
          </NFormItem>
        </NGi>
        <NGi>
          <!-- captcha 組（C1）：圖（點擊換題、220×120 沿 pwd-login 尺寸）＋答案輸入＋發送鈕（冷卻中禁用顯倒數） -->
          <NFormItem>
            <div class="w-full flex-col items-start gap-10px">
              <img
                v-if="captchaImg"
                :src="captchaImg"
                :alt="$t('page.userCenter.verify.captchaPlaceholder')"
                class="h-120px w-220px cursor-pointer"
                @click="refreshCaptcha"
              />
              <NInputGroup>
                <NInput v-model:value="captchaAnswer" :placeholder="$t('page.userCenter.verify.captchaPlaceholder')" />
                <NButton type="primary" :disabled="isCounting" :loading="sending" @click="handleSendCode">
                  {{ sendBtnLabel }}
                </NButton>
              </NInputGroup>
            </div>
          </NFormItem>
        </NGi>
        <NGi>
          <!-- 回填態（C10）：已發碼才顯示——碼輸入＋驗證鈕；驗證成功 emit saved 重拉 -->
          <NFormItem v-if="verifyToken">
            <NInputGroup>
              <NInput v-model:value="code" :placeholder="$t('page.userCenter.verify.codePlaceholder')" />
              <NButton type="primary" :loading="verifying" @click="handleVerify">
                {{ $t('page.userCenter.verify.verify') }}
              </NButton>
            </NInputGroup>
          </NFormItem>
        </NGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped></style>
