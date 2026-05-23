<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { fetchAssignRoleEndpoints, fetchGetAllEndpoints, fetchGetRoleEndpointIds } from '@/service/api';
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

const tree = shallowRef<unknown[]>([]);
const checks = shallowRef<string[]>([]);

async function init() {
  const [allRes, idsRes] = await Promise.all([
    fetchGetAllEndpoints(),
    fetchGetRoleEndpointIds(String(props.roleId))
  ]);
  if (!allRes.error) {
    tree.value = allRes.data ?? [];
  }
  if (!idsRes.error) {
    checks.value = idsRes.data ?? [];
  }
}

async function handleSubmit() {
  const { error } = await fetchAssignRoleEndpoints({
    roleId: String(props.roleId),
    endpointIds: checks.value
  });

  if (error) {
    window.$message?.error?.('更新失敗');
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));
  closeModal();
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
      :data="(tree as any[])"
      key-field="key"
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
