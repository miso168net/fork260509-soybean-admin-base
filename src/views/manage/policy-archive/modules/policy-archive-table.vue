<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NInput, NPopconfirm } from 'naive-ui';
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api/rev3-system-manage';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

defineOptions({
  name: 'PolicyArchiveTable'
});

// [rev3-inline 015-policy-governance MODAL-WIRING(e)] 授權回收桶表（list+restore；鏡像 012 audit-table + 010 menu restore）
// 頁為 R_SUPER-only（FR-009：menu policy + dynamic getUserRoutes 自動；非 super 側欄不見此頁、API 亦 policy-gated）；
// restore 鈕無獨立 button-policy 種子 → 不以 hasAuth 假碼隱藏（會對所有人隱藏、破 SC-006）；後端 require_policy 為安全邊界。
const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.ArchivedPolicySearchParams>({
  current: 1,
  size: 10,
  roleCode: null,
  dimension: null
});

const { columns, data, loading, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetArchivedPolicies(searchParams.value),
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
      minWidth: 140
    },
    {
      key: 'target',
      title: $t('page.manage.policyArchive.col.target'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'dimension',
      title: $t('page.manage.policyArchive.col.dimension'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'archivedTime',
      title: $t('page.manage.policyArchive.col.archivedTime'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'createdTime',
      title: $t('page.manage.policyArchive.col.createdTime'),
      align: 'center',
      minWidth: 180,
      // [rev3-inline §3.B/pre-波4] 原 policy 授權建立時間（createdTime，nullable）；honest null → empty
      render: row => (row.createdTime === null ? $t('page.manage.policyArchive.empty') : String(row.createdTime))
    },
    {
      key: 'archivedBy',
      title: $t('page.manage.policyArchive.col.archivedBy'),
      align: 'center',
      minWidth: 100,
      // [rev3-inline 015] honest null → empty（不用誤導預設值）
      render: row => (row.archivedBy === null ? $t('page.manage.policyArchive.empty') : String(row.archivedBy))
    },
    {
      key: 'archiveReason',
      title: $t('page.manage.policyArchive.col.archiveReason'),
      align: 'center',
      minWidth: 160,
      render: row => row.archiveReason || $t('page.manage.policyArchive.empty')
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 120,
      // [rev3-inline 015] restore 鈕（鏡像 010 menu restore）：NPopconfirm → fetchRestorePolicy → reload list
      render: row => (
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
      />
    </NCard>
  </div>
</template>

<style scoped></style>
