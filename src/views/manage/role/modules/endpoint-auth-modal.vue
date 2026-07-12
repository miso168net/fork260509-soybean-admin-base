<script setup lang="ts">
// [rev4 net-new MODAL-WIRING(c) 009-role-admin] endpoint-auth-modal：明文授權新建 auth modal（憲法 §III.2 (c)；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行）。嚴格鏡像 menu/button-auth-modal 版式。
import { computed, shallowRef, watch } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetAllEndpoints, fetchGetRoleEndpoints, fetchUpdateRoleEndpoints } from '@/service/api/rev4-role-admin';
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

// synthKey 加固：葉鍵＝`${path}|${method}` 合成唯一鍵、群組鍵＝path。
// 全 (path,method) 對唯一→葉鍵唯一；群組鍵永為純 path、葉鍵永含 `|method` 片段→兩者不碰撞（rev3 鍵碰撞坑帶防）。
function leafKey(path: string, method: string) {
  return `${path}|${method}`;
}

// 葉鍵 → Endpoint 反查表：handleSubmit 由勾選葉鍵精確還原 Endpoint[]（查表、不 split '|'，防 path 內含分隔符誤拆）。
const leafMap = shallowRef(new Map<string, Api.SystemManage.Endpoint>());

const tree = shallowRef<TreeOption[]>([]);

async function getAllEndpoints() {
  const { error, data } = await fetchGetAllEndpoints();
  if (error) {
    return;
  }

  const groups = new Map<string, TreeOption>();
  const map = new Map<string, Api.SystemManage.Endpoint>();

  data.forEach(ep => {
    let group = groups.get(ep.path);
    if (!group) {
      group = { key: ep.path, label: ep.path, children: [] };
      groups.set(ep.path, group);
    }

    const key = leafKey(ep.path, ep.method);
    (group.children as TreeOption[]).push({ key, label: ep.method });
    map.set(key, ep);
  });

  tree.value = Array.from(groups.values());
  leafMap.value = map;
}

const checks = shallowRef<string[]>([]);

async function getChecks() {
  const { error, data } = await fetchGetRoleEndpoints(props.roleId);

  if (!error) {
    checks.value = data.map(ep => leafKey(ep.path, ep.method));
  }
}

async function handleSubmit() {
  // check-strategy="child" → checks 僅含葉鍵；經反查表精確還原 desired Endpoint[]
  const endpoints = checks.value
    .map(key => leafMap.value.get(key))
    .filter((ep): ep is Api.SystemManage.Endpoint => Boolean(ep));

  const { error } = await fetchUpdateRoleEndpoints({ roleId: props.roleId, endpoints });

  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
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
      checkable
      check-strategy="child"
      expand-on-click
      virtual-scroll
      block-line
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
