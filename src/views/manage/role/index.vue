<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 資料源＋刪除批刪換 rev5 wrapper（直接路徑、不經 barrel——沿 rev5-ip-rule 先例；demo 版 fetchGetRoleList 續留 barrel 供 demo 頁）；原行: import { fetchGetRoleList } from '@/service/api';
import { fetchBatchDeleteRole, fetchDeleteRole, fetchGetRoleList } from '@/service/api/rev5-role-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

const appStore = useAppStore();

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 型別切 rev5 獨立命名空間（contracts §1 查詢形；欄集同 demo 型、僅命名空間換）；原行: const searchParams = ref<Api.SystemManage.RoleSearchParams>({
const searchParams = ref<Api.RoleAdmin.ListQuery>({
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
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 新增 roleMemo 欄（FR-043 memo 欄兌現；
      // R_ADMIN 可見——wire 面 getRoleList 帶、getAllRoles 不帶）。★使用者可寫的自由文字：不設 render、
      // 走 NDataTable 預設純文字渲染（照 004 wbip_memo 範式；null 整格空白＝本頁對 null 的既有慣例）
      key: 'roleMemo',
      title: $t('page.manage.role.roleMemo'),
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.role.roleStatus'),
      align: 'center',
      width: 100,
      render: row => {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 接真後 status 恆 '1'|'2'（後端二值收斂、wire 契約非 null）——demo 型的 null 分支結構性不可達、刪之（留著即 typecheck TS2367 紅）；原行: if (row.status === null) {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: return null;
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
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 批刪接真（rev4: 同形接線）：契約 §6 id 升冪逐項全套守門、任一違規整批拒（no-partial）；拒因 toast 由共用攔截層轉譯 backend.biz.role.*、此處只看 error；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteRole(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部以 getData 刷新列表＋清選取；★成功後零追加「生效」呼叫（免 reload＝ADR 0050 §2）
  onBatchDeleted();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改 async 接真（rev4: 同形接線）；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 單刪接真：契約 §5 三層守門固定序 seeded→in-use→self-role；拒因 toast 由攔截層出、此處只看 error；原行: console.log(id);
  const { error } = await fetchDeleteRole(id);
  if (error) {
    return;
  }

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
      <!--
        新增 roleMemo 欄（minWidth 120）⇒ scroll-x 隨欄寬總和 702+120＝822（欄寬總和不變式：scroll-x＝Σ(width|minWidth)，增刪欄時必須同批改）。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: :scroll-x="702"
      -->
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
