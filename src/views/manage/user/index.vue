<script setup lang="tsx">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
// [rev3-inline 016-button-endpoint-policy D5] getUserList 改用 honest 讀型 wrapper（nickName/userPhone/userEmail string|null、消型謊）；frozen system-manage.ts 不動
// [rev3-inline 009-user-management MW(a)] 寫端 wrapper 直接路徑 import（非 barrel）
import { fetchBatchDeleteUser, fetchDeleteUser, fetchGetUserListRev3 } from '@/service/api/rev3-system-manage';
// [rev3-inline 010-menu-management MW(b) retroactive] hasAuth gating（user 寫入鈕；R_ADMIN seed 僅 user:edit）
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
// [rev3-inline 023-list-column-sort MW(f)] 列表欄位排序 composable（受控排序 + 點擊序 + wire 字串）
import { useTableSort } from '@/hooks/common/use-table-sort';
// [rev3-inline 023-list-column-sort MW(f)] 一鍵清除排序鈕（顯式 import，避免 auto-import 不確定性）
import SortClearButton from '@/components/advanced/sort-clear-button.vue';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const appStore = useAppStore();

// [rev3-inline 010-menu-management MW(b) retroactive] 寫入鈕依按鈕層權限顯隱（後端授權仍為安全邊界）
const { hasAuth } = useAuth();

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

const route = useRoute();

// [rev3-inline 023-list-column-sort MW(f)] 排序受控狀態（須置於 useNaivePaginatedTable 之前供 columns factory 引用）
// storageKey＝route.name（per-route 持久化）、validKeys＝後端白名單欄（FR-015 還原防禦）
const { handleUpdateSorter, getColumnSortProps, sortString, clearAll } = useTableSort({
  storageKey: route.name as string,
  validKeys: ['userName', 'userGender', 'nickName', 'userPhone', 'userEmail', 'status']
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  // [rev3-inline 023-list-column-sort MW(f)] sort 走 api closure 合併（不入 searchParams 型）；空字串→undefined 略過
  api: () => fetchGetUserListRev3({ ...searchParams.value, sort: sortString.value || undefined }),
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
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 100,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄：受控 sortOrder + 多欄啟用旗標
      ...getColumnSortProps('userName')
    },
    {
      key: 'userGender',
      title: $t('page.manage.user.userGender'),
      align: 'center',
      width: 100,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('userGender'),
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
      minWidth: 100,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('nickName')
    },
    {
      key: 'userPhone',
      title: $t('page.manage.user.userPhone'),
      align: 'center',
      width: 120,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('userPhone')
    },
    {
      key: 'userEmail',
      title: $t('page.manage.user.userEmail'),
      align: 'center',
      minWidth: 200,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('userEmail')
    },
    {
      key: 'status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('status'),
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
      // [rev3-inline 010-menu-management MW(b) retroactive] edit/delete 鈕依 hasAuth gating（R_ADMIN 僅 user:edit）
      render: row => (
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
        </div>
      )
    }
  ]
});

// [rev3-inline 023-list-column-sort MW(f)] 排序變更 → 重抓並回第 1 頁（FR-006）
watch(sortString, () => {
  getDataByPage(1);
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
  // [rev3-inline 009-user-management MW(a)] 原 stub：console.log(checkedRowKeys.value);onBatchDeleted();
  const { error } = await fetchBatchDeleteUser(checkedRowKeys.value);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  // [rev3-inline 009-user-management MW(a)] 原 stub：console.log(id);onDeleted();
  const { error } = await fetchDeleteUser(id);
  if (!error) {
    onDeleted();
  }
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <!-- [rev3-inline 010-menu-management MW(b) retroactive] add/batchDelete 鈕 hasAuth gating（R_ADMIN seed 僅 user:edit→無 add/delete 鈕；用 showAdd/showDelete props 守恆 slot fallback） -->
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('user:add')"
          :show-delete="hasAuth('user:delete')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!-- [rev3-inline 023-list-column-sort MW(f)] 一鍵清除排序鈕（#suffix slot） -->
          <template #suffix>
            <SortClearButton @clear="clearAll" />
          </template>
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
        @update:sorter="handleUpdateSorter"
      />
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
