<script setup lang="ts">
// BASE-WEB-MODAL-WIRING(h) (011-user-admin)：net-new 解鎖 modal（憲法 §III.2(h)、T029 Amendment 授權——
// 「使用者頁既有後端維運端點之觸發 UI」）。dimension select（帳號維/IP 源維）＋條件目標輸入→
// POST unlockLogin（007 既有端點、super-only、解鎖冪等）；★新檔零原行（example 基線無此檔）。
import { computed, ref, watch } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchUnlockLogin } from '@/service/api/rev4-user-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserUnlockModal'
});

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

interface UnlockModel {
  /** 鎖定維度（user＝帳號維／ip＝IP 源維；007/008 unlockLogin wire） */
  dimension: 'user' | 'ip';
  /** 帳號維標的（dimension='user' 必填） */
  userName: string;
  /** IP 源維標的（dimension='ip' 必填、IP 位址字面） */
  target: string;
}

const model = ref<UnlockModel>(createDefaultModel());

function createDefaultModel(): UnlockModel {
  return {
    dimension: 'user',
    userName: '',
    target: ''
  };
}

// 表單驗證 required（僅渲染中欄位觸發——條件輸入欄以 v-if 切換、隱欄不驗）
const rules: Record<'dimension' | 'userName' | 'target', App.Global.FormRule> = {
  dimension: defaultRequiredRule,
  userName: defaultRequiredRule,
  target: defaultRequiredRule
};

const dimensionOptions = computed<CommonType.Option<UnlockModel['dimension']>[]>(() => [
  { label: $t('page.manage.user.unlock.dimensionLabel.user'), value: 'user' },
  { label: $t('page.manage.user.unlock.dimensionLabel.ip'), value: 'ip' }
]);

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // 帳號維送 userName、IP 源維送 target（wire 消歧——非法/缺目標拒因 invalidTarget/invalidDimension 由攔截層 toast）
  const { error } = await fetchUnlockLogin(
    model.value.dimension === 'user'
      ? { dimension: 'user', userName: model.value.userName }
      : { dimension: 'ip', target: model.value.target }
  );
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.user.unlock.success'));
  closeModal();
}

watch(visible, () => {
  if (visible.value) {
    model.value = createDefaultModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="$t('page.manage.user.unlock.title')" preset="card" class="w-400px">
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.manage.user.unlock.dimension')" path="dimension">
        <NSelect
          v-model:value="model.dimension"
          :options="dimensionOptions"
          :placeholder="$t('page.manage.user.unlock.form.dimension')"
        />
      </NFormItem>
      <NFormItem
        v-if="model.dimension === 'user'"
        :label="$t('page.manage.user.unlock.target')"
        path="userName"
      >
        <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.unlock.form.userName')" />
      </NFormItem>
      <NFormItem v-else :label="$t('page.manage.user.unlock.target')" path="target">
        <NInput v-model:value="model.target" :placeholder="$t('page.manage.user.unlock.form.target')" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
