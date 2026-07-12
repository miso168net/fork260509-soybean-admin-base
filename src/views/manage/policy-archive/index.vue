<script setup lang="tsx">
// [rev4 net-new MODAL-WIRING(e) 009-role-admin] policy-archive：授權回收桶管理頁（憲法 §III.2 (e) 明文授權新 manage 頁；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行）。嚴格鏡像 manage 範式（search＋table＋分頁）；
// 純列表＋restore 操作（無 create/edit drawer）；★消費 U9 後端 getArchivedPolicies／restorePolicy。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api/rev4-role-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PolicyArchiveSearch from './modules/policy-archive-search.vue';

const appStore = useAppStore();

const dimensionRecord: Record<Api.SystemManage.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

const searchParams = ref<Api.SystemManage.ArchivedPolicySearchParams>({
  current: 1,
  size: 10,
  roleCode: null,
  dimension: null
});

const { columns, data, loading, getData, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetArchivedPolicies(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      width: 64,
      align: 'center',
      render: (_, index) => index + 1
    },
    {
      key: 'v0',
      title: $t('page.manage.policyArchive.sourceRole'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'dimension',
      title: $t('page.manage.policyArchive.dimension'),
      align: 'center',
      width: 110,
      render: row => <NTag>{$t(dimensionRecord[row.dimension])}</NTag>
    },
    {
      key: 'v1',
      title: $t('page.manage.policyArchive.target'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'archiveReason',
      title: $t('page.manage.policyArchive.archiveReason'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'archivedAt',
      title: $t('page.manage.policyArchive.archivedAt'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'archivedBy',
      title: $t('page.manage.policyArchive.archivedBy'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 120,
      // restorable=true→restore 鈕啟用（NPopconfirm 二次確認）；restorable=false→停用態（FR-028 旗標否停用）
      render: row =>
        row.restorable ? (
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
        ) : (
          <NButton type="primary" ghost size="small" disabled>
            {$t('page.manage.policyArchive.restore')}
          </NButton>
        )
    }
  ]
});

async function handleRestore(id: number) {
  const { error } = await fetchRestorePolicy(id);
  if (error) {
    // notRestorable(2222)／已 live NoOp(0000) 等業務碼由共用攔截器 onError 顯訊息（明細通道 U14/T031）
    return;
  }

  window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));

  await getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PolicyArchiveSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.manage.policyArchive.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <NButton size="small" @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.refresh') }}
        </NButton>
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1014"
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
