<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center、020-email-verify-smtp 接真)：net-new 信箱卡——020 信箱驗證流
  （contracts C10 動線：驗證態徽章含時刻＋captcha 取題點圖換題與發碼失敗原地換題＋發碼冷卻倒數〔純前端 60s、
  誤按由 emailCooldown 拒因 remainingSeconds 重建〕＋回填驗證→saved 重拉＋解綁 NPopconfirm 二次確認〔未綁定
  不顯示〕；獨立儲存鈕退場、信箱不再走 updateProfile——C5）。憲法 §III.2(g) 擴字串 v1.15.0 信箱驗證流授權。
  U9 佈局改造（user 2026-08-01 拍板）：卡面右欄改 Phone 同構三件式（Send Code 開浮窗＋碼輸入常駐＋Verify）、
  captcha 圖與答案輸入整組移入 Send Code Layer 浮窗（NModal、沿 pwd-gen-modal 先例形）——C10 行為保留
  （點圖換題／倒數 remainingSeconds 重建／回填態清理等），兩點有意變化（U10 勘註誠實化）：①取題時機
  改開層時（頁載零取題）②冷卻中卡面無 captcha 圖（圖僅存在於浮窗內；卡面倒數承載狀態）。
  ★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
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
// U9：captchaAnswer 輸入移入浮窗後不在 NForm 樹內、rules 不生效——改浮窗內手動守衛（空值 warning 不送）、
// 卡面 rules 只留 newEmail（原 U4 required 規則等價替代）。
// U10：captchaAnswer 遷出 form reactive 改獨立 ref（見下 captcha 狀態組）——form 與 NForm rules 樹一致。
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

// captcha 狀態（C1；沿 pwd-login 慣例、實作獨立於 login 軌道；answer 走浮窗內手動守衛——U9、
// U10 起獨立 ref 不入 form reactive）
const captchaId = ref('');
const captchaImg = ref('');
const captchaAnswer = ref('');

/**
 * 取（換）題：challenge 提交即消耗——點圖換題＋發碼失敗原地換題（U10：成功不再換題、
 * 下次開層自取新題）；換題即清空舊輸入（舊題已失效）。回傳取題成敗供開層守衛判定
 * （U10 review 修：去 captchaImg 副作用判定）。
 */
async function refreshCaptcha() {
  const { data } = await fetchEmailCaptcha();
  if (data) {
    captchaId.value = data.captchaId;
    captchaImg.value = data.captchaImg;
    captchaAnswer.value = '';
  }
  return Boolean(data);
}

// U9：Send Code Layer 浮窗開關（沿 pwd-gen-modal v-model:show 先例形、本卡內聯毋需獨立元件）。
// 取題時機＝開層時（原 onMounted 取題退場——卡面不再顯圖、頁載零取題請求）。
const showSend = ref(false);

/**
 * 開層守衛（U9/U10）：validate 過（空/壞形不開層——naive validate 失敗以 promise rejection 拋、
 * try/catch 捕捉即 return）→清舊 captcha 態（重開浮窗零舊圖閃現）→await 取題成功才開層
 * （取題失敗不開層：失敗 toast 由攔截層統一顯示、亦順帶消除空圖層）。
 */
// 開層取題 in-flight 防重（U10 review 修：連點零重複取題請求；與同檔 sending/verifying/unbinding 同形）
const opening = ref(false);

async function handleOpenSend() {
  if (opening.value) {
    return;
  }
  try {
    await validate();
  } catch {
    return;
  }
  opening.value = true;
  // 清舊 captcha 三態（id/圖/答案對稱清理——重開浮窗零舊圖閃現、零殘留舊題憑據）
  captchaId.value = '';
  captchaImg.value = '';
  captchaAnswer.value = '';
  const fetched = await refreshCaptcha();
  opening.value = false;
  if (!fetched) {
    return;
  }
  showSend.value = true;
}

// 冷卻倒數（C10：純前端 60s、重整即消失；誤按由 emailCooldown 拒因 remainingSeconds 重建——clarify Q4）
const { count, isCounting, start } = useCountDown(60);

const sending = ref(false);

// 發送鈕雙態 label（idle 顯發送、counting 顯倒數——{seconds} 佔位照 C8 字面）；
// U9：倒數落卡面開層鈕（冷卻中 disabled）、浮窗內真發碼鈕同步 disabled（label 恆顯 sendCode）
const sendBtnLabel = computed(() =>
  isCounting.value
    ? $t('page.userCenter.verify.cooldown', { seconds: count.value })
    : $t('page.userCenter.verify.sendCode')
);

// U9 浮窗標題＝動態組合「Send Code 段 - 區塊名段」（sendCode＋字面「 - 」＋emailTitle）：
// zh-TW 顯「傳送驗證碼 - 信箱」、en-US 顯「Send Code - Email」。
// ★共用性設計：組合式零新 i18n 鍵——日後 Phone 的 Send Code 浮窗同形換 phoneTitle 即可。
const sendModalTitle = computed(() => `${$t('page.userCenter.verify.sendCode')} - ${$t('page.userCenter.emailTitle')}`);

// 回填態（C10）：verifyToken 非空＝已發碼；碼輸入與驗證鈕 U9 起常駐顯示（Phone 同構、非 v-if）——
// sentEmail＝發碼當下標的（憑據烤定該位址）——輸入改動或解綁致分岔即清回填態（U4 review 修繕：
// 防「畫面位址與憑據綁定位址分岔」燒嘗試額度或誤導顯示）。
const verifyToken = ref('');
const code = ref('');
const sentEmail = ref('');

watch(
  () => form.newEmail,
  val => {
    if (verifyToken.value && val !== sentEmail.value) {
      verifyToken.value = '';
      code.value = '';
    }
  }
);

async function handleSendCode() {
  // U9：captcha 空答手動守衛（原 required 規則等價替代——浮窗內輸入不在 NForm 樹、rules 不生效；
  // 空答案送出僅白耗一次往返與換題、前端先擋）
  if (!captchaAnswer.value) {
    window.$message?.warning($t('page.userCenter.verify.captchaPlaceholder'));
    return;
  }
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
    // 成功才啟動倒數（hooks/business/captcha.ts 先例）；進回填態＋清舊碼＋記發碼標的＋關浮窗（U9）
    verifyToken.value = data.verifyToken;
    code.value = '';
    sentEmail.value = form.newEmail;
    window.$message?.success($t('page.userCenter.verify.sendSuccess'));
    start();
    showSend.value = false;
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
    // challenge 單次消耗：失敗且層仍開著→原地換新題（答錯／其他拒因該題皆已耗）；
    // U10：成功分支不再換題——層已關、下次開層自取新題（刪冗餘取題請求）
    await refreshCaptcha();
  }
  sending.value = false;
}

const verifying = ref(false);

async function handleVerify() {
  if (verifying.value) {
    return;
  }
  // 六位碼前端形制守衛（U4 review 修繕）：空值／壞形不打後端——verify 第三步即 INCR 嘗試計數、
  // 上限僅 3 次，空按三下就把額度燒光而重發又受冷卻與日上限管制。
  // U9 碼輸入常駐後未發碼即按驗證：六位守衛先擋壞形；過形而 verifyToken 空由後端拒因 toast 承接（權威判）。
  if (!/^\d{6}$/.test(code.value)) {
    window.$message?.warning($t('page.userCenter.verify.codePlaceholder'));
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

const unbinding = ref(false);

async function handleUnbind() {
  // in-flight 防重（U4 review 修繕）：與同檔 sending／verifying 同形——重複點擊二次解綁
  // 會在鎖內重讀撞 emailNotBound、成功 toast 後緊接錯誤 toast。
  if (unbinding.value) {
    return;
  }
  unbinding.value = true;
  const { error } = await fetchUnbindEmail();
  if (!error) {
    // 解綁成功：沿 common.updateSuccess（C8 無專屬解綁成功鍵）；清空顯示由父層重拉承接
    window.$message?.success($t('common.updateSuccess'));
    emit('saved');
  }
  unbinding.value = false;
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
                  <NButton size="small" :loading="unbinding">{{ $t('page.userCenter.verify.unbind') }}</NButton>
                </template>
                {{ $t('page.userCenter.verify.unbindConfirm') }}
              </NPopconfirm>
            </div>
          </NFormItem>
        </NGi>
        <NGi>
          <!-- U9 右欄三件式（Phone 卡同構、user 拍板）：Send Code（開浮窗；冷卻中顯倒數 disabled）＋
            碼輸入（常駐非 v-if）＋Verify（primary）；captcha 整組移入下方浮窗 -->
          <NFormItem>
            <NInputGroup>
              <NButton :disabled="isCounting" :loading="opening" @click="handleOpenSend">{{ sendBtnLabel }}</NButton>
              <NInput v-model:value="code" :placeholder="$t('page.userCenter.verify.codePlaceholder')" />
              <NButton type="primary" :loading="verifying" @click="handleVerify">
                {{ $t('page.userCenter.verify.verify') }}
              </NButton>
            </NInputGroup>
          </NFormItem>
        </NGi>
      </NGrid>
    </NForm>
    <!-- U9 Send Code Layer（NModal preset card、沿 pwd-gen-modal 先例形、寬 340px＋U10 小螢幕
      lt-sm 退 300px 響應式）：行 1＝captcha 圖置中（點擊換題）；行 2＝captcha 答案輸入＋真發碼鈕
      （NInputGroup）；標題＝sendModalTitle 組合式（共用性設計、零新鍵） -->
    <NModal v-model:show="showSend" preset="card" :title="sendModalTitle" class="w-340px lt-sm:w-300px">
      <NSpace vertical :size="16">
        <div class="flex justify-center">
          <img
            v-if="captchaImg"
            :src="captchaImg"
            :alt="$t('page.userCenter.verify.captchaPlaceholder')"
            class="h-120px w-220px cursor-pointer"
            @click="refreshCaptcha"
          />
        </div>
        <NInputGroup>
          <NInput v-model:value="captchaAnswer" :placeholder="$t('page.userCenter.verify.captchaPlaceholder')" />
          <NButton type="primary" :disabled="isCounting" :loading="sending" @click="handleSendCode">
            {{ $t('page.userCenter.verify.sendCode') }}
          </NButton>
        </NInputGroup>
      </NSpace>
    </NModal>
  </NCard>
</template>

<style scoped></style>
