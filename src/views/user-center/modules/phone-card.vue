<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center)：net-new 手機卡——rev3 025 藍本逐項復刻（手機號碼 input col1＋驗證碼
  佔位組 col2）；儲存只送 {userPhone} 單欄（部分更新、FR-008）；佔位組純前端、點擊 comingSoon 零網路寫入（FR-012）；
  與 email-card.vue 刻意同構。憲法 §III.2(g) 授權。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { ref } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchUpdateProfile } from '@/service/api/rev4-user-center';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PhoneCard'
});

interface Props {
  /** 個人中心 canonical model（index.vue 持有、三卡 prop 共綁；本卡編 userPhone） */
  model: Api.UserCenter.ProfileRes;
}

const props = defineProps<Props>();

interface Emits {
  /** 儲存成功後通知 index.vue 重拉 getProfile（無酬載單事件形照 rev3；rev4 卡內自呼 fetch、事件語意＝已存妥） */
  (e: 'saved'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate } = useNaiveForm();
const { patternRules } = useFormRules();

// 手機格式前端寬鬆把關（trigger=change、非 required 空值容忍——與管理面同水位、後端不驗格式）
const rules = {
  userPhone: patternRules.phone
};

async function handleSave() {
  await validate();
  // 部分更新（FR-008）只送本卡單欄（null 防禦性 coalesce ''、清欄回 NULL 不做）。
  const { error } = await fetchUpdateProfile({
    userPhone: props.model.userPhone ?? ''
  });
  if (!error) {
    // 成功 toast 沿 common.updateSuccess（D3 專屬鍵僅屬改密卡）；顯示值刷新由父層重拉承接。
    window.$message?.success($t('common.updateSuccess'));
    emit('saved');
  }
}

// 驗證碼佔位組（FR-012）：本地 code ref 純綁定不送出；點擊一律 comingSoon toast、零網路寫入。
const verifyCode = ref('');

function handleComingSoon() {
  window.$message?.info($t('page.userCenter.verify.comingSoon'));
}
</script>

<template>
  <NCard :title="$t('page.userCenter.phoneTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
    </template>
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="76">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.userPhone')" path="userPhone">
            <NInput v-model:value="model.userPhone" />
          </NFormItem>
        </NGi>
        <NGi>
          <!-- 驗證碼佔位組（發送驗證碼＋驗證碼框＋驗證、全 enabled；純佔位不接後端、FR-012） -->
          <NFormItem>
            <NInputGroup>
              <NButton @click="handleComingSoon">{{ $t('page.userCenter.verify.sendCode') }}</NButton>
              <NInput v-model:value="verifyCode" :placeholder="$t('page.userCenter.verify.codePlaceholder')" />
              <NButton type="primary" @click="handleComingSoon">{{ $t('page.userCenter.verify.verify') }}</NButton>
            </NInputGroup>
          </NFormItem>
        </NGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped></style>
