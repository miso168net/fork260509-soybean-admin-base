<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: import { computed, shallowRef } from 'vue';
// [rev4-inline MODAL-WIRING(a) 009-role-admin] button 授權讀寫 WRAPPER（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchGetAllButtons, fetchGetRoleButton, fetchUpdateRoleButton } from '@/service/api/rev4-role-admin';
// [rev4-inline MODAL-WIRING(a) 009-role-admin] protectedRevoke 明細呼叫端渲染 helper（R4 第 2 層／ADR 0050）
import { showProtectedRevokeDetail } from './protected-revoke-detail';
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
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] id 欄復用為 tree 節點鍵＝button code；key-field="id" 不動 template（task 允「映射」、避 template-region 原行）
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: id: number;
  id: string;
  label: string;
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: code: string;
};

const tree = shallowRef<ButtonConfig[]>([]);

async function getAllButtons() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: tree.value = [
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 1, label: 'button1', code: 'code1' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 2, label: 'button2', code: 'code2' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 3, label: 'button3', code: 'code3' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 4, label: 'button4', code: 'code4' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 5, label: 'button5', code: 'code5' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 6, label: 'button6', code: 'code6' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 7, label: 'button7', code: 'code7' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 8, label: 'button8', code: 'code8' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 9, label: 'button9', code: 'code9' },
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: { id: 10, label: 'button10', code: 'code10' }
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: ];
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 後端 getAllButtons 回 string[]（button code 聯集去重）→ 映成 tree 項（id=label=code）
  const { error, data } = await fetchGetAllButtons();
  if (!error) {
    tree.value = data.map(code => ({ id: code, label: code }));
  }
}

// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: const checks = shallowRef<number[]>([]);
const checks = shallowRef<string[]>([]);

async function getChecks() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(props.roleId);
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: checks.value = [1, 2, 3, 4, 5];
  const { error, data } = await fetchGetRoleButton(props.roleId);
  if (!error) {
    checks.value = data;
  }
}

// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: function handleSubmit() {
async function handleSubmit() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleButton({ roleId: props.roleId, buttons: checks.value });
  if (error) {
    // [rev4-inline MODAL-WIRING(a) 009-role-admin] protectedRevoke 明細：讀信封 data.blocked[] 結構化列出被擋目標（與共用層泛化 toast 並存）
    showProtectedRevokeDetail(error.response?.data);
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllButtons();
  getChecks();
}

// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: init();
// [rev4-inline MODAL-WIRING(a) 009-role-admin] 改於 modal 開啟重取：roleId 隨編輯角色而變、鏡像 menu-auth-modal 的 watch(visible)；避免初掛後切換角色讀到舊 checks
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
      key-field="id"
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
