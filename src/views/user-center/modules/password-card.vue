<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin] 個人中心「修改密碼」卡（新增檔；基線
// example 無此路徑、零原行；憲法 §III.2 (vi) 列明文「password-card.vue 為 rev5 新增型新檔、不入名冊」）。
// ★**只有舊密碼一路**（spec FR-037 逐字）：無信箱／手機驗證碼 radio——rev4 那三顆 radio 之中，兩顆是
// 「功能建置中」的純佔位（點下去只出一則 toast、零網路請求），把使用者引到一條走不通的路上＝rev5 拍板
// 差異點不帶回（ADR 0019）。
// 即時規則來自 hooks/business/pwd-policy.ts（政策七欄投影 → naive rules；取不到靜默降 required）；
// ★後端仍是唯一裁判——政策違規明細（`passwordPolicy{violations}`）、節流、冷卻、舊密不符等拒因一律由
// service/request 共用攔截層轉譯後 toast，本卡零拒因專屬 UI。
import { computed, onMounted, reactive, toRef } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（沿 rev5-user-admin／rev5-role-admin 消費先例）
import { fetchChangePassword } from '@/service/api/rev5-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { usePwdPolicy, usePwdPolicyRules } from '@/hooks/business/pwd-policy';
import { $t } from '@/locales';

defineOptions({
  name: 'PasswordCard'
});

interface Props {
  /**
   * 本人**登入帳號名**（政策 `forbidUsername` 的即時比對源；空字串＝略過該條提示）
   *
   * ★★**絕不可綁 `authStore.userInfo.userName`**：後端 `getUserInfo` 的該欄實為
   * `nick_name.unwrap_or(user_name)`＝**顯示名**，暱稱與帳號名不同的使用者拿到的會是對錯對象
   * 的規則提示（「不可與使用者名稱相同」比的是暱稱），比沒有提示更誤導。
   * ★rev5 as-shipped **沒有**任何前端可取的真帳號名來源（本刀個人中心零 profile 端點、
   * `Api.UserCenter` 只有政策與改密兩支）⇒ 父層刻意不綁此 prop、該條即時提示結構性缺席，
   * 由後端單一驗證點承擔（FR-031「前端提示為輔、後端唯一裁判」）。日後若補上 profile 讀端，
   * 綁上去即自動生效——這個 prop 就是那條接縫。
   */
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), { userName: '' });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();
const { buildPolicyRules } = usePwdPolicyRules();
// 政策投影的取得與快取（模組層單例、與 user 管理頁的產密浮層共用同一份；本卡只讀）
const { policy, ensureLoaded: ensurePolicy } = usePwdPolicy();

const model = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

/**
 * 新密碼的政策規則（★`policy` 為 `null`＝政策尚未載入或讀失敗 ⇒ buildPolicyRules 只回 required、
 * **靜默降級**不擋送出）。政策讀取失敗不彈錯：那是我方基建的問題，不該變成使用者改不了密碼。
 */
const rules = computed(() => ({
  oldPassword: createRequiredRule($t('form.pwd.required')),
  newPassword: [
    // userName 傳 getter：validator 執行時才讀當下 prop 值（見 pwd-policy.ts 該參數說明）
    ...buildPolicyRules(policy.value, () => props.userName),
    {
      // 新≠舊的即時提示：端點固有規則、非政策鍵（後端守門序 `passwordSameAsOld` 為權威）
      validator: (_rule, value: string) => !(value !== '' && value === model.oldPassword),
      message: $t('backend.biz.user.passwordSameAsOld'),
      trigger: ['input', 'blur']
    } satisfies App.Global.FormRule
  ],
  // ★confirm 規則傳 toRef 而非值快照：validator 執行時才讀當下 newPassword，
  // 免得「rules 尚未 flush 就送出」時拿舊值比對而誤判一致。
  confirmPassword: createConfirmPwdRule(toRef(model, 'newPassword'))
}));

async function handleSubmit() {
  await validate();

  const { error } = await fetchChangePassword({
    oldPassword: model.oldPassword,
    newPassword: model.newPassword,
    confirmPassword: model.confirmPassword
  });

  if (error) {
    return;
  }

  // ★成功 toast 用專屬鍵、不用 common.updateSuccess：改密成功會撤掉本人**其他裝置**的登入
  // （當前裝置保留），那是使用者需要當場知道的副作用。
  window.$message?.success($t('page.userCenter.password.success'));

  model.oldPassword = '';
  model.newPassword = '';
  model.confirmPassword = '';
  restoreValidation();
}

// 掛載即取政策（規則要在使用者開始打字之前就備妥）；已有快取即零請求、讀失敗靜默降級（見 hook 註）
onMounted(ensurePolicy);
</script>

<template>
  <NCard :title="$t('page.userCenter.password.title')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="handleSubmit">
        {{ $t('page.userCenter.password.submit') }}
      </NButton>
    </template>
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.password.oldPassword')" path="oldPassword">
            <NInput v-model:value="model.oldPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NGi>
        <NGi />
        <NGi>
          <NFormItem :label="$t('page.userCenter.password.newPassword')" path="newPassword">
            <NInput v-model:value="model.newPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.password.confirmPassword')" path="confirmPassword">
            <NInput v-model:value="model.confirmPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NGi>
      </NGrid>
      <!-- 副作用逐字告知（純文字插值）：成功後其他裝置需重新登入、當前裝置保留 -->
      <span class="text-12px text-#999">{{ $t('page.userCenter.password.hint') }}</span>
    </NForm>
  </NCard>
</template>

<style scoped></style>
