<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { fetchGetAllEndpoints, fetchGetRoleEndpoints, fetchUpdateRoleEndpoints } from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'EndpointAuthModal'
});

interface Props {
  /** the roleId */
  roleId: number;
  /** the role's code; drives root-mode (R_SUPER is read-only) */
  roleCode?: string;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.endpointAuth'));

/** root-mode: the super-admin role is read-only (server rejects edits with 2222) */
const isSuper = computed(() => props.roleCode === 'R_SUPER');

type EndpointConfig = {
  key: string;
  label: string;
};

/** encode an endpoint to the NTree composite key — its identity = `"${method} ${path}"`. */
function encodeKey(e: Api.SystemManage.Endpoint) {
  return `${e.method} ${e.path}`;
}

/** decode a composite key back to `{ method, path }` (split on the first space; the inverse of encodeKey). */
function decodeKey(k: string): Api.SystemManage.Endpoint {
  const i = k.indexOf(' ');
  return { method: k.slice(0, i), path: k.slice(i + 1) };
}

const tree = shallowRef<EndpointConfig[]>([]);

async function getAllEndpoints() {
  const { error, data } = await fetchGetAllEndpoints();

  if (!error) {
    tree.value = data.map(e => {
      const key = encodeKey(e);
      return { key, label: key };
    });
  }
}

const checks = shallowRef<string[]>([]);

async function getChecks() {
  const { error, data } = await fetchGetRoleEndpoints(props.roleId);

  if (!error) {
    checks.value = data.map(encodeKey);
  }
}

async function handleSubmit() {
  const endpoints = checks.value.map(decodeKey);

  const { error } = await fetchUpdateRoleEndpoints(props.roleId, endpoints);

  if (!error) {
    window.$message?.success?.($t('common.modifySuccess'));

    closeModal();
  }
}

function init() {
  getAllEndpoints();
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
      key-field="key"
      :disabled="isSuper"
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
        <NButton type="primary" size="small" class="mt-16px" :disabled="isSuper" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
