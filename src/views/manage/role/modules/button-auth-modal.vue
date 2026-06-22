<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
// [rev3-inline 016-button-endpoint-policy MW(c)] 角色×按鈕授權 wrapper 直接路徑 import（非 barrel）
import { fetchGetAllButtons, fetchGetRoleButton, fetchUpdateRoleButton } from '@/service/api/rev3-system-manage';
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

const tree = shallowRef<Api.SystemManage.Button[]>([]);

async function getAllButtons() {
  // [rev3-inline 016 MW(c)] 原 mock：硬塞 button1..10（真發 getAllButtons，自 sys_menu.buttons 萃取 {code,label}）
  const { error, data } = await fetchGetAllButtons();

  if (!error) {
    tree.value = data;
  }
}

const checks = shallowRef<string[]>([]);

async function getChecks() {
  // [rev3-inline 016 MW(c)] 原 mock：console.log+checks=[1..5]（真發 getRoleButton，回 string[]＝該角色已授權按鈕 code）
  const { error, data } = await fetchGetRoleButton(props.roleId);

  if (!error) {
    checks.value = data;
  }
}

async function handleSubmit() {
  // [rev3-inline 016 MW(c)] 原 mock：console.log+無條件 success（真發 updateRoleButton、DB-first casbin WRITE；撤的進回收桶可復原）
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
      label-field="label"
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
