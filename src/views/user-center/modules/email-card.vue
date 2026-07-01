<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 邮箱卡（US1：userEmail input＋保存〔patternRules.email〕；US4 加驗證入口預留控件） -->
<script setup lang="ts">
import { ref } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持、共綁；本卡編 userEmail） */
  model: Api.UserCenter.ProfileModel;
}

defineProps<Props>();

interface Emits {
  /** 觸發共用 handleSave（送全 model） */
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate } = useNaiveForm();
const { patternRules } = useFormRules();

// 郵箱格式前端把關（空值容忍：pattern rule 非 required、空字串略過驗證）
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
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
      <NFormItem :label="$t('page.userCenter.userEmail')" path="userEmail">
        <NInput v-model:value="model.userEmail" />
      </NFormItem>
      <!-- [rev3-inline 025-user-center ★] US4 驗證入口預留（發送驗證碼／驗證碼／驗證；純佔位、不接後端） -->
      <NFormItem>
        <NInputGroup>
          <NButton @click="handleComingSoon">{{ $t('page.userCenter.verify.sendCode') }}</NButton>
          <NInput v-model:value="verifyCode" :placeholder="$t('page.userCenter.verify.codePlaceholder')" />
          <NButton type="primary" @click="handleComingSoon">{{ $t('page.userCenter.verify.verify') }}</NButton>
        </NInputGroup>
      </NFormItem>
      <NFormItem>
        <NButton type="primary" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped></style>
