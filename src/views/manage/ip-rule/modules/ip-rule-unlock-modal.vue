<script setup lang="ts">
import { ref, watch } from 'vue';
// [rev3-inline 022-ip-access-control MW] 手動解鎖 wrapper 直接路徑 import（非 barrel）
import { fetchUnlockLogin } from '@/service/api/rev3-system-manage';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import { unlockDimensionOptions } from './shared';

// [rev3-inline 022-ip-access-control T029] 管理者手動解鎖登入鎖定（dimension user|ip + value；both-dims 提示）
defineOptions({
  name: 'IpRuleUnlockModal'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const model = ref(createDefaultModel());

function createDefaultModel(): Api.SystemManage.IpRuleUnlockModel {
  return {
    dimension: 'user',
    value: ''
  };
}

const rules: Record<keyof Api.SystemManage.IpRuleUnlockModel, App.Global.FormRule> = {
  dimension: defaultRequiredRule,
  value: defaultRequiredRule
};

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { error } = await fetchUnlockLogin(model.value);

  if (!error) {
    window.$message?.success($t('page.manage.ipRule.unlock.success'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    model.value = createDefaultModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="$t('page.manage.ipRule.unlock.title')" preset="card" class="w-520px">
    <NAlert type="info" class="mb-16px">
      {{ $t('page.manage.ipRule.unlock.bothDimsHint') }}
    </NAlert>
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
      <NFormItem :label="$t('page.manage.ipRule.unlock.dimension')" path="dimension">
        <NSelect v-model:value="model.dimension" :options="translateOptions(unlockDimensionOptions)" />
      </NFormItem>
      <NFormItem :label="$t('page.manage.ipRule.unlock.value')" path="value">
        <NInput v-model:value="model.value" :placeholder="$t('page.manage.ipRule.unlock.form.value')" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace :size="16" justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
