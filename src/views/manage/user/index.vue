<script setup lang="tsx">
// [rev4-inline MODAL-WIRING(d) 011-user-admin] 原行: import { ref } from 'vue';
import { ref, watch } from 'vue';
// [rev4-inline MODAL-WIRING(h) 011-user-admin] 原行: import { NButton, NPopconfirm, NTag } from 'naive-ui';
// NDropdown＝operate 欄 kick/reset-pwd 維運動作收納、NInput＝reset-pwd 輕量 dialog 收新密碼（憲法 §III.2(h)）
import { NButton, NDropdown, NInput, NPopconfirm, NTag } from 'naive-ui';
// [rev4-inline MODAL-WIRING(h) 011-user-admin] 解鎖 modal 開關（鏡像 010 menu/index.vue useBoolean 慣例）
import { useBoolean } from '@sa/hooks';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
import { fetchGetUserList } from '@/service/api';
// [rev4-inline MODAL-WIRING(a) 011-user-admin] delete/batchDelete/kick/reset-pwd/回收桶接線 WRAPPER（★直接路徑、不經 barrel、避 vite stale-export）
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetDeletedUsers,
  fetchKickUser,
  fetchResetUserPassword,
  fetchRestoreUser
} from '@/service/api/rev4-user-admin';
// [rev4-inline MODAL-WIRING(b) 011-user-admin] hasAuth gating 取用（user:add/edit/delete/kick/reset-pwd/restore/unlock 按鈕顯隱）
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';
// [rev4-inline MODAL-WIRING(h) 011-user-admin] net-new 解鎖 modal（憲法 §III.2(h)、T029 Amendment 授權）
import UserUnlockModal from './modules/user-unlock-modal.vue';

const appStore = useAppStore();

// [rev4-inline MODAL-WIRING(b) 011-user-admin] hasAuth：操作鈕以 user 域按鈕碼 gating（m002＝add/edit/delete、m008＝kick/reset-pwd/restore/unlock）
const { hasAuth } = useAuth();

// [rev4-inline MODAL-WIRING(h) 011-user-admin] 頁首解鎖 modal 開關（user:unlock gating、消費 007 既有 unlockLogin 端點）
const { bool: unlockVisible, setTrue: openUnlockModal } = useBoolean();

// [rev4-inline MODAL-WIRING(d) 011-user-admin] 顯示已刪除 toggle 狀態＋回收桶分頁參（憲法 §III.2(d)；切換資料源 fetchGetUserList⇄fetchGetDeletedUsers）
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.SystemManage.DeletedUserListReq>({ current: 1, size: 10 });

const searchParams = ref<Api.SystemManage.UserSearchParams>({
  current: 1,
  size: 10,
  status: null,
  userName: null,
  userGender: null,
  nickName: null,
  userPhone: null,
  userEmail: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  // [rev4-inline MODAL-WIRING(d) 011-user-admin] 原行: api: () => fetchGetUserList(searchParams.value),
  api: () => (showDeleted.value ? fetchGetDeletedUsers(deletedSearchParams.value) : fetchGetUserList(searchParams.value)),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
    // [rev4-inline MODAL-WIRING(d) 011-user-admin] 回收桶分頁同步（鏡像 010 menu/index.vue；僅已刪模式消費 deletedSearchParams）
    deletedSearchParams.value.current = params.page ?? 1;
    deletedSearchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userGender',
      title: $t('page.manage.user.userGender'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.userGender === null) {
          return null;
        }

        const tagMap: Record<Api.SystemManage.UserGender, NaiveUI.ThemeColor> = {
          1: 'primary',
          2: 'error'
        };

        const label = $t(userGenderRecord[row.userGender]);

        return <NTag type={tagMap[row.userGender]}>{label}</NTag>;
      }
    },
    {
      key: 'nickName',
      title: $t('page.manage.user.nickName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userPhone',
      title: $t('page.manage.user.userPhone'),
      align: 'center',
      width: 120
    },
    {
      key: 'userEmail',
      title: $t('page.manage.user.userEmail'),
      align: 'center',
      minWidth: 200
    },
    {
      key: 'status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      // [rev4-inline MODAL-WIRING(h) 011-user-admin] 原行: width: 130,
      // edit/delete＋NDropdown 維運動作（kick/reset-pwd）三控件並列、加寬容納
      width: 200,
      // [rev4-inline MODAL-WIRING(d) 011-user-admin] 原行: render: row => (
      render: row =>
        // [rev4-inline MODAL-WIRING(d) 011-user-admin] 已刪模式操作欄換逐列 restore 鈕、隱 edit/delete/維運動作（憲法 §III.2(d)；鏡像 010 menu/index.vue）
        showDeleted.value ? (
          <div class="flex-center gap-8px">
            {hasAuth('user:restore') && (
              <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
                {{
                  default: () => $t('page.manage.user.confirmRestore'),
                  trigger: () => (
                    <NButton type="primary" ghost size="small">
                      {$t('page.manage.policyArchive.restore')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
            )}
          </div>
        ) : (
          // [rev4-inline MODAL-WIRING(b) 011-user-admin] edit→user:edit、delete→user:delete 顯隱 gating；(h) kick/reset-pwd NDropdown 收納
          <div class="flex-center gap-8px">
            {hasAuth('user:edit') && (
              <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
                {$t('common.edit')}
              </NButton>
            )}
            {hasAuth('user:delete') && (
              <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
                {{
                  default: () => $t('common.confirmDelete'),
                  trigger: () => (
                    <NButton type="error" ghost size="small">
                      {$t('common.delete')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
            )}
            {(hasAuth('user:kick') || hasAuth('user:reset-pwd')) && (
              <NDropdown
                options={getOperateDropdownOptions()}
                onSelect={key => handleOperateSelect(String(key), row)}
              >
                <NButton size="small" ghost>
                  {$t('common.action')}
                </NButton>
              </NDropdown>
            )}
          </div>
        )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, 'id', getData);

// [rev4-inline MODAL-WIRING(d) 011-user-admin] 切換顯示已刪除 → 回第一頁重取（憲法 §III.2(d)；鏡像 010 menu/index.vue）
watch(showDeleted, () => {
  getDataByPage(1);
});

async function handleBatchDelete() {
  // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: console.log(checkedRowKeys.value);
  // batchDeleteUser fail-fast 整批拒——違規拒因（seededProtected/cannotDeleteSelf/userNotFound）由攔截層 toast
  const { error } = await fetchBatchDeleteUser(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部復用凍結 fetchGetUserList（getData）刷新列表＋清選取
  onBatchDeleted();
}

// [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: console.log(id);
  const { error } = await fetchDeleteUser(id);
  if (error) {
    return;
  }

  onDeleted();
}

// [rev4-inline MODAL-WIRING(d) 011-user-admin START] 復原已刪使用者（憲法 §III.2(d)；鏡像 010 handleRestore：error 即 return→success toast→getData 刷新；零回灌＝復原後零角色、須重新指派）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreUser(id);
  if (error) {
    // userNameExists（活性同名衝突）／userNotFound 等業務拒因由共用攔截層 onError 彈訊息
    return;
  }

  window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));

  await getData();
}
// [rev4-inline MODAL-WIRING(d) 011-user-admin END]

// [rev4-inline MODAL-WIRING(h) 011-user-admin START] operate 欄維運動作：kick（confirmKick 確認→kickUser→kickSuccess toast）＋reset-pwd（輕量 dialog 收新密碼→resetUserPassword→resetPwdSuccess＋resetPwdUnlockHint 指引）——憲法 §III.2(h)、T029 Amendment 授權
function getOperateDropdownOptions() {
  const options: { label: string; key: string }[] = [];
  if (hasAuth('user:kick')) {
    options.push({ label: $t('page.manage.user.kick'), key: 'kick' });
  }
  if (hasAuth('user:reset-pwd')) {
    options.push({ label: $t('page.manage.user.resetPwd'), key: 'resetPwd' });
  }
  return options;
}

function handleOperateSelect(key: string, row: Api.SystemManage.User) {
  if (key === 'kick') {
    handleKick(row);
  } else if (key === 'resetPwd') {
    handleResetPwd(row);
  }
}

function handleKick(row: Api.SystemManage.User) {
  window.$dialog?.warning({
    title: $t('page.manage.user.kick'),
    content: $t('page.manage.user.confirmKick'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      // 踢除不改列資料（帳號仍活）——毋需刷新列表；cannotKickSelf/userNotFound 拒因由攔截層 toast
      const { error } = await fetchKickUser(row.id);
      if (error) {
        return;
      }
      window.$message?.success($t('page.manage.user.kickSuccess'));
    }
  });
}

function handleResetPwd(row: Api.SystemManage.User) {
  const pwd = ref('');
  window.$dialog?.create({
    title: `${$t('page.manage.user.resetPwd')}：${row.userName}`,
    content: () => (
      <NInput
        value={pwd.value}
        type="password"
        showPasswordOn="click"
        placeholder={$t('page.manage.user.form.password')}
        onUpdateValue={val => {
          pwd.value = val;
        }}
      />
    ),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    onPositiveClick: async () => {
      // 空值前端擋一道；密碼政策為後端權威驗證、違規明細經攔截層渲染（U12 T024、前端零加工）
      if (!pwd.value) {
        return false;
      }
      const { error } = await fetchResetUserPassword({ id: row.id, password: pwd.value });
      if (error) {
        // 政策違規等——留 dialog 供修正重送
        return false;
      }
      window.$message?.success($t('page.manage.user.resetPwdSuccess'));
      // ★重設不解登入節流鎖定——附另行解鎖指引（FR-025）
      window.$message?.info($t('page.manage.user.resetPwdUnlockHint'));
      return true;
    }
  });
}
// [rev4-inline MODAL-WIRING(h) 011-user-admin END]

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- [rev4-inline MODAL-WIRING(d) 011-user-admin] 原行: <UserSearch v-model:model="searchParams" @search="getDataByPage" />
      已刪模式隱搜尋卡（getDeletedUsers 僅收分頁參、搜尋不適用——誠實隱藏防「搜了沒反應」）
    -->
    <UserSearch v-if="!showDeleted" v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!-- [rev4-inline MODAL-WIRING(d) 011-user-admin START] 顯示已刪除 toggle（憲法 §III.2(d)；鏡像 010 menu/index.vue prefix slot、i18n 複用 page.manage.menu.showDeleted） -->
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.menu.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
          <!-- [rev4-inline MODAL-WIRING(d) 011-user-admin END] -->
          <!-- [rev4-inline MODAL-WIRING(b) 011-user-admin START] 覆寫 default slot：add→user:add、batchDelete→user:delete 顯隱（已刪模式雙隱）＋(h) 頁首解鎖鈕→user:unlock（憲法 §III.2(b)(h)；不動共用 table-header-operation.vue、gating 全落 index.vue） -->
          <template #default>
            <NButton v-if="!showDeleted && hasAuth('user:add')" size="small" ghost type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </NButton>
            <NPopconfirm v-if="!showDeleted && hasAuth('user:delete')" @positive-click="handleBatchDelete">
              <template #trigger>
                <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                  <template #icon>
                    <icon-ic-round-delete class="text-icon" />
                  </template>
                  {{ $t('common.batchDelete') }}
                </NButton>
              </template>
              {{ $t('common.confirmDelete') }}
            </NPopconfirm>
            <NButton v-if="hasAuth('user:unlock')" size="small" ghost @click="openUnlockModal">
              {{ $t('page.manage.user.unlock.title') }}
            </NButton>
          </template>
          <!-- [rev4-inline MODAL-WIRING(b) 011-user-admin END] -->
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <!-- [rev4-inline MODAL-WIRING(h) 011-user-admin] net-new 解鎖 modal 掛載（憲法 §III.2(h)、T029 Amendment 授權） -->
      <UserUnlockModal v-model:visible="unlockVisible" />
    </NCard>
  </div>
</template>

<style scoped></style>
