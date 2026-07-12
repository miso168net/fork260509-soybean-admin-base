<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { fetchGetRoleList } from '@/service/api';
// [rev4-inline MODAL-WIRING(a) 009-role-admin] delete/batchDelete 接線 WRAPPER（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchBatchDeleteRole, fetchDeleteRole } from '@/service/api/rev4-role-admin';
// [rev4-inline MODAL-WIRING(b) 009-role-admin] hasAuth gating 取用（role:add/edit/delete 按鈕顯隱）
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

const appStore = useAppStore();

// [rev4-inline MODAL-WIRING(b) 009-role-admin] hasAuth：操作鈕以 role:add/edit/delete 按鈕碼 gating
const { hasAuth } = useAuth();

const searchParams = ref<Api.SystemManage.RoleSearchParams>({
  current: 1,
  size: 10,
  roleName: null,
  roleCode: null,
  status: null
});

const { columns, columnChecks, data, loading, getData, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetRoleList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
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
      width: 64,
      align: 'center',
      render: (_, index) => index + 1
    },
    {
      key: 'roleName',
      title: $t('page.manage.role.roleName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roleCode',
      title: $t('page.manage.role.roleCode'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'roleDesc',
      title: $t('page.manage.role.roleDesc'),
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.role.roleStatus'),
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
      width: 130,
      // [rev4-inline MODAL-WIRING(b) 009-role-admin] 列操作鈕 hasAuth gating：edit→role:edit、delete→role:delete v-if 顯隱
      render: row => (
        <div class="flex-center gap-8px">
          {hasAuth('role:edit') && (
            <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
              {$t('common.edit')}
            </NButton>
          )}
          {hasAuth('role:delete') && (
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

async function handleBatchDelete() {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteRole(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部復用凍結 fetchGetRoleList（getData）刷新列表＋清選取
  onBatchDeleted();
}

// [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev4-inline MODAL-WIRING(a) 009-role-admin] 原行: console.log(id);
  const { error } = await fetchDeleteRole(id);
  if (error) {
    return;
  }

  // onDeleted 內部復用凍結 fetchGetRoleList（getData）刷新列表
  onDeleted();
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.role.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!-- [rev4-inline MODAL-WIRING(b) 009-role-admin START] 覆寫 default slot、以 role:add/role:delete 顯隱 add/batchDelete 鈕（憲法 §III MODAL-WIRING (b)；不動共用 table-header-operation.vue、gating 全落 index.vue） -->
          <template #default>
            <NButton v-if="hasAuth('role:add')" size="small" ghost type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </NButton>
            <NPopconfirm v-if="hasAuth('role:delete')" @positive-click="handleBatchDelete">
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
          </template>
          <!-- [rev4-inline MODAL-WIRING(b) 009-role-admin END] -->
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="702"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
