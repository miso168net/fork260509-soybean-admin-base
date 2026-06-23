<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
// [rev3-inline 016-button-endpoint-policy MW(c)] 角色×API 端點授權 wrapper 直接路徑 import（非 barrel）
import { fetchGetAllEndpoints, fetchGetRoleEndpoints, fetchUpdateRoleEndpoints } from '@/service/api/rev3-system-manage';
import { $t } from '@/locales';

defineOptions({
  name: 'EndpointAuthModal'
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

const title = computed(() => $t('common.edit') + $t('page.manage.role.endpointAuth'));

/**
 * NTree 節點：key＝(method,path) 合成字串（method+空格+path，如 "GET /systemManage/getUserList"）。
 *
 * - method 不含空格 → 以「第一個空格」拆解可無歧義還原 (method, path)（path 即便含空格亦完整保留）。
 * - 合成與拆解須對稱（synthKey ↔ parseKey）。
 */
type EndpointNode = {
  key: string;
  label: string;
  children?: EndpointNode[];
};

function synthKey(ep: Api.SystemManage.Endpoint) {
  return `${ep.method} ${ep.path}`;
}

function parseKey(key: string): Api.SystemManage.Endpoint {
  const idx = key.indexOf(' ');
  return {
    method: key.slice(0, idx),
    path: key.slice(idx + 1)
  };
}

const tree = shallowRef<EndpointNode[]>([]);

async function getAllEndpoints() {
  const { error, data } = await fetchGetAllEndpoints();

  if (!error) {
    // [rev3-inline §3.H/pre-波4] 依 path 第一段分組（/systemManage、/auth…）折成 NTree 父節點；
    //   group key 前綴 grp: 防與 leaf synthKey 衝突；NTree check-strategy=child → checkedKeys 只含 leaf、submit 邏輯不變
    const groups = new Map<string, EndpointNode[]>();
    for (const ep of data) {
      const seg = ep.path.split('/').filter(Boolean)[0] || 'other';
      const leaf: EndpointNode = {
        key: synthKey(ep),
        label: ep.label ? `${ep.method} ${ep.path}（${ep.label}）` : `${ep.method} ${ep.path}`
      };
      const bucket = groups.get(seg);
      if (bucket) bucket.push(leaf);
      else groups.set(seg, [leaf]);
    }
    tree.value = [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([seg, children]) => ({ key: `grp:${seg}`, label: `/${seg}`, children }));
  }
}

const checks = shallowRef<string[]>([]);

async function getChecks() {
  const { error, data } = await fetchGetRoleEndpoints(props.roleId);

  if (!error) {
    checks.value = data.map(synthKey);
  }
}

async function handleSubmit() {
  // ★ 動真實 (role,path,method) enforce 列；撤含受保護核心→後端整批拒 2222 endpointProtected（攔截器自動在地化、防誤鎖出）
  const endpoints = checks.value.map(parseKey);
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
      label-field="label"
      check-strategy="child"
      default-expand-all
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
