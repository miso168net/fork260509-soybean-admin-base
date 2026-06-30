<script setup lang="tsx">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NInput, NPopconfirm } from 'naive-ui';
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api/rev3-system-manage';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
// [rev3-inline 023-list-column-sort MW(f)] 列表欄位排序 composable（受控排序 + 點擊序 + wire 字串）
import { useTableSort } from '@/hooks/common/use-table-sort';
// [rev3-inline 023-list-column-sort MW(f)] 一鍵清除排序鈕（顯式 import，避免 auto-import 不確定性）
import SortClearButton from '@/components/advanced/sort-clear-button.vue';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

defineOptions({
  name: 'PolicyArchiveTable'
});

// [rev3-inline 015-policy-governance MODAL-WIRING(e)] 授權回收桶表（list+restore；鏡像 012 audit-table + 010 menu restore）
// 頁為 R_SUPER-only（FR-009：menu policy + dynamic getUserRoutes 自動；非 super 側欄不見此頁、API 亦 policy-gated）；
// restore 鈕無獨立 button-policy 種子 → 不以 hasAuth 假碼隱藏（會對所有人隱藏、破 SC-006）；後端 require_policy 為安全邊界。
const appStore = useAppStore();

// [rev3-inline 020-role-delete-policy-archive ★ START] archiveReason（wire snake 值）→ i18n 友善標籤 key map
// 實際 3 值（C3 接地）：role_dimension_revoke（menu+button 撤銷）／role_endpoint_revoke（endpoint 撤銷）／role_soft_delete（角色刪除歸檔）；未知值 fallback 原字串
const reasonLabelKeyMap: Record<string, App.I18n.I18nKey> = {
  role_dimension_revoke: 'page.manage.policyArchive.reasonLabels.roleDimensionRevoke',
  role_endpoint_revoke: 'page.manage.policyArchive.reasonLabels.roleEndpointRevoke',
  role_soft_delete: 'page.manage.policyArchive.reasonLabels.roleSoftDelete'
};
// [rev3-inline 020-role-delete-policy-archive ★ END]

const searchParams = ref<Api.SystemManage.ArchivedPolicySearchParams>({
  current: 1,
  size: 10,
  roleCode: null,
  dimension: null
});

const route = useRoute();

// [rev3-inline 023-list-column-sort MW(f)] 排序受控狀態（須置於 useNaivePaginatedTable 之前供 columns factory 引用）
// storageKey＝route.name（per-route 持久化）、validKeys＝後端白名單欄（FR-015 還原防禦）
const { handleUpdateSorter, getColumnSortProps, sortString, clearAll } = useTableSort({
  storageKey: route.name as string,
  validKeys: ['roleCode', 'target', 'archivedTime', 'createdTime', 'archivedBy', 'archiveReason']
});

const { columns, data, loading, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  // [rev3-inline 023-list-column-sort MW(f)] sort 走 api closure 合併（不入 searchParams 型）；空字串→undefined 略過
  api: () => fetchGetArchivedPolicies({ ...searchParams.value, sort: sortString.value || undefined }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'roleCode',
      title: $t('page.manage.policyArchive.col.roleCode'),
      align: 'center',
      minWidth: 140,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('roleCode')
    },
    {
      key: 'target',
      title: $t('page.manage.policyArchive.col.target'),
      align: 'center',
      minWidth: 180,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('target')
    },
    {
      key: 'dimension',
      title: $t('page.manage.policyArchive.col.dimension'),
      align: 'center',
      minWidth: 100
      // [rev3-inline 023-list-column-sort MW(f)] dimension 為 computed/v2 衍生、非後端白名單 → 不掛排序
    },
    {
      key: 'archivedTime',
      title: $t('page.manage.policyArchive.col.archivedTime'),
      align: 'center',
      minWidth: 180,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('archivedTime')
    },
    {
      key: 'createdTime',
      title: $t('page.manage.policyArchive.col.createdTime'),
      align: 'center',
      minWidth: 180,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('createdTime'),
      // [rev3-inline §3.B/pre-波4] 原 policy 授權建立時間（createdTime，nullable）；honest null → empty
      render: row => (row.createdTime === null ? $t('page.manage.policyArchive.empty') : String(row.createdTime))
    },
    {
      key: 'archivedBy',
      title: $t('page.manage.policyArchive.col.archivedBy'),
      align: 'center',
      minWidth: 100,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('archivedBy'),
      // [rev3-inline 015] honest null → empty（不用誤導預設值）
      render: row => (row.archivedBy === null ? $t('page.manage.policyArchive.empty') : String(row.archivedBy))
    },
    {
      key: 'archiveReason',
      title: $t('page.manage.policyArchive.col.archiveReason'),
      align: 'center',
      minWidth: 160,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('archiveReason'),
      // [rev3-inline 020-role-delete-policy-archive] reason snake 值 → $t 友善標籤（已知 3 值映射、未知值 fallback 原字串、空→empty）
      render: row => {
        const labelKey = reasonLabelKeyMap[row.archiveReason];
        return labelKey ? $t(labelKey) : row.archiveReason || $t('page.manage.policyArchive.empty');
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 120,
      // [rev3-inline 015] restore 鈕（鏡像 010 menu restore）：NPopconfirm → fetchRestorePolicy → reload list
      // [rev3-inline 020-role-delete-policy-archive] 依後端單一真相 row.restorable 條件渲染：
      //   false（role_soft_delete／角色已刪或 code 重用屬舊實例）→ 停用態、無復原鈕（後端 restore 亦拒＝安全邊界）；
      //   true / undefined 容錯 → 維持既有 NPopconfirm + 復原鈕
      render: row =>
        row.restorable === false ? (
          <NButton type="default" size="small" disabled>
            {$t('page.manage.policyArchive.notRestorable')}
          </NButton>
        ) : (
          <div class="flex-center justify-center">
            <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
              {{
                default: () => $t('page.manage.policyArchive.confirmRestore'),
                trigger: () => (
                  <NButton type="primary" ghost size="small">
                    {$t('page.manage.policyArchive.restore')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        )
    }
  ]
});

// [rev3-inline 023-list-column-sort MW(f)] 排序變更 → 重抓並回第 1 頁（FR-006）
watch(sortString, () => {
  getDataByPage(1);
});

// [rev3-inline 015] 復原回收桶項（Applied/NoOp→0000、NotFound→2222；成功則 reload 當前頁）
async function handleRestore(id: number) {
  const { error } = await fetchRestorePolicy(id);
  if (!error) {
    window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));
    getDataByPage();
  }
}

function reset() {
  searchParams.value.roleCode = null;
  searchParams.value.dimension = null;
  getDataByPage();
}

function search() {
  getDataByPage();
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="policy-archive-search">
          <NForm :model="searchParams" label-placement="left" :label-width="80">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.policyArchive.col.roleCode')" class="pr-24px">
                <NInput v-model:value="searchParams.roleCode" :placeholder="$t('page.manage.policyArchive.filter.roleCode')" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.policyArchive.col.dimension')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.dimension"
                  :placeholder="$t('page.manage.policyArchive.filter.dimension')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6">
                <NSpace class="w-full" justify="end">
                  <NButton @click="reset">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </NButton>
                  <NButton type="primary" ghost @click="search">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </NButton>
                  <!-- [rev3-inline 023-list-column-sort MW(f)] 一鍵清除排序鈕（無 header 工具列頁 → 搜尋表單末 NSpace inline） -->
                  <SortClearButton @clear="clearAll" />
                </NSpace>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </NCollapseItem>
      </NCollapse>
    </NCard>
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1200"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
        @update:sorter="handleUpdateSorter"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
