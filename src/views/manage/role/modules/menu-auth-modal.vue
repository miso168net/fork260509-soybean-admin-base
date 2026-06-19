<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { fetchGetAllPages, fetchGetMenuTree } from '@/service/api';
// [rev3-inline 011-role-management MW(a)] 角色×選單授權＋角色首頁 wrapper 直接路徑 import（非 barrel）
import { fetchGetRoleHome, fetchGetRoleMenu, fetchUpdateRoleHome, fetchUpdateRoleMenu } from '@/service/api/rev3-system-manage';
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
  // [rev3-inline 011-role-management MW(a)] 原 stub：console.log(props.roleId);home.value='home';
  const { error, data } = await fetchGetRoleHome(props.roleId);

  if (!error) {
    home.value = data;
  }
}

async function updateHome(val: string) {
  // [rev3-inline 011-role-management MW(a)] 原 stub：home.value = val;（真發 updateRoleHome、成功才落地新值）
  const { error } = await fetchUpdateRoleHome(props.roleId, val);

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
  // [rev3-inline 011-role-management MW(a)] 原 stub：checks.value=[1..21] hardcode（真發 getRoleMenu，回 number[]＝該角色已授權選單 id）
  const { error, data } = await fetchGetRoleMenu(props.roleId);

  if (!error) {
    checks.value = data;
  }
}

async function handleSubmit() {
  // [rev3-inline 011-role-management MW(a)] 原 stub：window.$message?.success?.($t('common.modifySuccess'));closeModal();
  // ★ 真發 updateRoleMenu（DB-first casbin WRITE）；移除受保護選單→後端 2222 menuProtected→攔截器自動在地化 toast（非靜默）
  const { error } = await fetchUpdateRoleMenu(props.roleId, checks.value);

  if (!error) {
    window.$message?.success?.($t('common.modifySuccess'));
    closeModal();
  }
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
