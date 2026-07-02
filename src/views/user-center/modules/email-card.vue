<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 邮箱塊：邮箱 input（col1、patternRules.email）＋預留驗證控件（col2、純佔位）；header 保存只送 userEmail（部分更新） -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持；本塊編 userEmail） */
  model: Api.UserCenter.ProfileModel;
}

defineProps<Props>();

interface Emits {
  /** 觸發 index.vue saveEmail（部分更新：只送 userEmail） */
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate } = useNaiveForm();
const { patternRules } = useFormRules();

// 信箱格式前端把關（空值容忍：pattern rule 非 required、空字串略過驗證）
const rules = {
  userEmail: patternRules.email
};

async function handleSave() {
  await validate();
  emit('save');
}

// [rev3-inline 025-user-center ★] US4 信箱驗證入口純佔位：本地 code ref（純綁定、不送出）＋點擊明示建置中、不接後端
const verifyCode = ref('');

function handleComingSoon() {
  window.$message?.info($t('page.userCenter.verify.comingSoon'));
}
</script>

<template>
  <NCard :title="$t('page.userCenter.emailTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
    </template>
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="76">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.userEmail')" path="userEmail">
            <NInput v-model:value="model.userEmail" />
          </NFormItem>
        </NGi>
        <NGi>
          <!-- [rev3-inline 025-user-center ★] US4 驗證入口預留（發送驗證碼／驗證碼／驗證；純佔位、不接後端） -->
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
