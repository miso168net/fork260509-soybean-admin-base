<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { fetchGetAllButtons, fetchGetRoleButton, fetchUpdateRoleButton } from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'ButtonAuthModal'
});

interface Props {
  /** the roleId */
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

type ButtonConfig = {
  code: string;
  label: string;
};

const tree = shallowRef<ButtonConfig[]>([]);

async function getAllButtons() {
  const { error, data } = await fetchGetAllButtons();

  if (!error) {
    tree.value = data.map(b => ({ code: b.code, label: b.desc }));
  }
}

const checks = shallowRef<string[]>([]);

async function getChecks() {
  const { error, data } = await fetchGetRoleButton(props.roleId);

  if (!error) {
    checks.value = data;
  }
}

async function handleSubmit() {
  const { error } = await fetchUpdateRoleButton(props.roleId, checks.value);

  if (!error) {
    window.$message?.success?.($t('common.modifySuccess'));

    closeModal();
  }
}

function init() {
  getAllButtons();
  getChecks();
}

watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      key-field="code"
      block-line
      checkable
      expand-on-click
      virtual-scroll
      class="h-280px"
    />
    <template #footer>
      <NSpace justify="end">
        <NButton size="small" class="mt-16px" @click="closeModal">
          {{ $t('common.cancel') }}
        </NButton>
        <NButton type="primary" size="small" class="mt-16px" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
