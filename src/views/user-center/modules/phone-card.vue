<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 手机号卡（US1：userPhone input＋保存〔patternRules.phone〕；US4 加驗證入口預留控件） -->
<script setup lang="ts">
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持、共綁；本卡編 userPhone） */
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

// 手機格式前端把關（空值容忍：pattern rule 非 required、空字串略過驗證）
const rules = {
  userPhone: patternRules.phone
};

async function handleSave() {
  await validate();
  emit('save');
}
</script>

<template>
  <NCard :title="$t('page.userCenter.phoneTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
      <NFormItem :label="$t('page.userCenter.userPhone')" path="userPhone">
        <NInput v-model:value="model.userPhone" />
      </NFormItem>
      <NFormItem>
        <NButton type="primary" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped></style>
