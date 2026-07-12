<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { fetchGetAllPages, fetchGetMenuTree } from '@/service/api';
// [rev4-inline MODAL-WIRING(a) 009-role-admin] menu 授權＋roleHome 讀寫 WRAPPER（★直接路徑、不經 barrel、避 vite stale-export）
import {
  fetchGetRoleHome,
  fetchGetRoleMenu,
  fetchUpdateRoleHome,
  fetchUpdateRoleMenu
} from '@/service/api/rev4-role-admin';
import { $t } from '@/locales';

defineOptions({
  name: 'MenuAuthModal'
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

const title = computed(() => $t('common.edit') + $t('page.manage.role.menuAuth'));

const home = shallowRef('');

async function getHome() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(props.roleId);
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: home.value = 'home';
  const { error, data } = await fetchGetRoleHome(props.roleId);
  if (!error) {
    home.value = data;
  }
}

async function updateHome(val: string) {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] home 寫端接線（updateRoleHome；成功才落 home=val、失敗不改本地）
  const { error } = await fetchUpdateRoleHome({ roleId: props.roleId, home: val });
  if (!error) {
    home.value = val;
  }
}

const pages = shallowRef<string[]>([]);

async function getPages() {
  const { error, data } = await fetchGetAllPages();

  if (!error) {
    pages.value = data;
  }
}

const pageSelectOptions = computed(() => {
  const opts: CommonType.Option[] = pages.value.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

const tree = shallowRef<Api.SystemManage.MenuTree[]>([]);

async function getTree() {
  const { error, data } = await fetchGetMenuTree();

  if (!error) {
    tree.value = data;
  }
}

const checks = shallowRef<number[]>([]);

async function getChecks() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(props.roleId);
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: checks.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const { error, data } = await fetchGetRoleMenu(props.roleId);
  if (!error) {
    checks.value = data;
  }
}

// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: function handleSubmit() {
async function handleSubmit() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleMenu({ roleId: props.roleId, menuIds: checks.value });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getHome();
  getPages();
  getTree();
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
    <div class="flex-y-center gap-16px pb-12px">
      <div>{{ $t('page.manage.menu.home') }}</div>
      <NSelect :value="home" :options="pageSelectOptions" size="small" class="w-160px" @update:value="updateHome" />
    </div>
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      key-field="id"
      checkable
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
