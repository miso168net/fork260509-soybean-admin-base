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
// checks 為 NTree 勾選的 leaf key 集合；leaf key 是 numeric string（display_id.to_string()、NTree shape 要 string）。
// submit 時 .map(Number) 轉 i64 給 rust DTO（rust 端 Vec<i64>、見 fetchAssignRoleEndpoints）。
const checks = shallowRef<string[]>([]);

async function init() {
  const [allRes, idsRes] = await Promise.all([
    fetchGetAllEndpoints(),
    fetchGetRoleEndpointIds(props.roleId)
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
    roleId: props.roleId,
    endpointIds: checks.value.map(Number)
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
