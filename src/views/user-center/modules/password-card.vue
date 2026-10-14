<!-- [rev6-inline USER-CENTER-VIEW+ 007-user-password-admin] 個人中心「修改密碼」卡（新增檔；上游基線無此路徑）——驗舊密碼後改登入者本人之密碼，新密碼欄掛密碼政策即時規則 -->
<script setup lang="ts">
// 不變式（spec FR-049、FR-038；契約＝specs/007-user-password-admin/contracts/wire-user-center.md 端點 2）：
// · 只走舊密碼一路：卡上沒有信箱或手機驗證碼之選項——個人中心之後端端點只有讀政策與改密碼兩支，那兩路無處可接。
// · 新密碼欄＝政策七鍵投影轉成之即時規則，另加「不得與舊密碼相同」一條（端點自有之守門、不屬政策鍵；訊息借後端同義拒因之譯文）；
//   確認欄驗兩次輸入一致。政策尚未載入或讀不到＝政策規則退為只驗必填一條（「不得與舊密碼相同」與確認欄照驗）；政策讀取失敗本身不擋送出。
// · ★政策「禁止與帳號名相同」一條刻意不給即時提示：前端唯一拿得到之 `userInfo.userName` 是顯示名（後端暱稱優先、無暱稱才退帳號名），
//   拿它比會讓有暱稱者得到比錯對象之提示、比沒有提示更誤導；後端沒有本人資料之讀端（BL-00141） ⇒ 該條提示結構性缺席，交後端驗證點判。
// · 後端是唯一裁判：政策違規明細、設密冷卻、舊密碼不符、猜錯過多之節流等拒因一律由共用請求層轉譯後出提示，本卡只判成敗、不另寫拒因文案。
// · 成功即出專屬提示並清空三欄與驗證狀態：改密成功會讓本人其他裝置之登入失效（當前裝置保留），這個副作用要讓使用者當場知道，
//   故不借通用之「更新成功」。
// · 「儲存」鈕送出期間載入中（按鈕於載入中不觸發點擊）、處理器另有重入守——連點只送出一次（第二發帶之舊密碼已非現行密碼＝必被拒：
//   成功提示之後多跳一則「舊密碼不正確」，並推進改密節流桶一格）。
// 出處：rev5:src/views/user-center/modules/password-card.vue（版式、三欄與規則、成功處置）。rev6 差異：政策 hook 與請求包裝改取 rev6 新檔；
// 不設帳號名 prop（rev5 留作接縫而父層從未傳值），改以空字串直接略過該條；「儲存」鈕送出中載入中、處理器另有重入守
// （rev5 送出期間仍可再按）。
import { computed, onMounted, reactive, ref, toRef } from 'vue';
// 包裝以直接路徑匯入：WRAPPER 軌道新檔不入 `service/api/index.ts` 之 barrel
import { fetchChangePassword } from '@/service/api/rev6-user-center';
import { usePwdPolicy, usePwdPolicyRules } from '@/hooks/business/pwd-policy';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PasswordCard'
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();
const { policy, ensureLoaded } = usePwdPolicy();
const { buildPolicyRules } = usePwdPolicyRules();

const model = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

/** 送出中：處理器起手置真、一切出口（成功、失敗、驗證不過之拋出）由 finally 解除；「儲存」鈕據之載入中、處理器據之重入守 */
const submitting = ref(false);

/** 規則放在 computed 內：切換語言、政策載入完成後皆隨之重算 */
const rules = computed(() => ({
  oldPassword: createRequiredRule($t('form.pwd.required')),
  newPassword: [
    // 帳號名傳空字串＝略過「禁止與帳號名相同」一條（成因見檔頭第三條）
    ...buildPolicyRules(policy.value, ''),
    {
      // 空值交必填那條判、此處放行
      validator: (_rule, value: string) => value === '' || value !== model.oldPassword,
      message: $t('backend.biz.user.passwordSameAsOld'),
      trigger: ['input', 'blur']
    } satisfies App.Global.FormRule
  ],
  // 傳 ref 而非字串值：驗證當下才讀新密碼之現值，不拿規則建立當時之舊值比對
  confirmPassword: createConfirmPwdRule(toRef(model, 'newPassword'))
}));

async function handleSubmit() {
  if (submitting.value) {
    return;
  }

  submitting.value = true;

  try {
    await validate();

    const { error } = await fetchChangePassword({
      oldPassword: model.oldPassword,
      newPassword: model.newPassword,
      confirmPassword: model.confirmPassword
    });

    if (error) {
      return;
    }

    window.$message?.success($t('page.userCenter.password.success'));

    model.oldPassword = '';
    model.newPassword = '';
    model.confirmPassword = '';
    restoreValidation();
  } finally {
    submitting.value = false;
  }
}

// 掛載即備妥政策（使用者開始輸入前規則就位）：已有快取即零請求、讀失敗維持 null（見 pwd-policy.ts）
onMounted(ensureLoaded);
</script>

<template>
  <NCard :title="$t('page.userCenter.password.title')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" :loading="submitting" @click="handleSubmit">
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
      <!-- 副作用說明（純文字插值）：其他裝置需重新登入、當前裝置保留 -->
      <span class="text-12px text-#999">{{ $t('page.userCenter.password.hint') }}</span>
    </NForm>
  </NCard>
</template>

<style scoped></style>
