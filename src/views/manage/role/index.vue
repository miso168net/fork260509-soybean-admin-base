<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 清單、單刪、批刪改打角色管理 wrapper（直接路徑、不經 barrel；barrel 的同名 demo 版一行不動）；原行: import { fetchGetRoleList } from '@/service/api';
import { fetchBatchDeleteRole, fetchDeleteRole, fetchGetRoleList } from '@/service/api/rev6-role-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

const appStore = useAppStore();

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 型改角色管理清單的 wire 查詢型（狀態為字串形）；首屏物件字面不動＝首屏查詢串照舊三個篩選欄皆空值；原行: const searchParams = ref<Api.SystemManage.RoleSearchParams>({
const searchParams = ref<Api.RoleAdmin.RoleListQuery>({
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註欄：超管自由輸入的文字，不設 render、交表格預設輸出成純文字節點（null 即留白）
    {
      key: 'roleMemo',
      title: $t('page.manage.role.roleMemo'),
      minWidth: 120
    },
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </NButton>
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
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 批刪接真：任一標的被拒即整批不動；拒因提示由共用攔截層轉譯、本頁只看成敗（勾選鍵實為列 id、逐一轉數值）；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteRole(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  onBatchDeleted();
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改 async：要等刪除回應定成敗；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 單刪接真：拒因提示由共用攔截層轉譯、本頁只看成敗；原行: console.log(id);
  const { error } = await fetchDeleteRole(id);
  if (error) {
    return;
  }

  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 清掉已刪列的勾選：勾選鍵跨刷新保留，已刪 id 若留著、下一次批刪會因查無而整批被拒
  checkedRowKeys.value = checkedRowKeys.value.filter(key => Number(key) !== id);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
        />
      </template>
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 下方 :scroll-x 隨新增備註欄（minWidth 120）改 822＝各欄 width／minWidth 之和；標記無法置於標籤屬性之間、故緊鄰本元件之上；原行: :scroll-x="702" -->
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="822"
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
