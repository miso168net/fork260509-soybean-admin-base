<script setup lang="tsx">
import { computed, onMounted, ref } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NPopconfirm } from 'naive-ui';
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api';
import { $t } from '@/locales';

// 034 US5:權限回收桶 — 單一 archive 列表頁(無 live/deleted toggle,archive 無 live 對應)。
// 後端 getArchivedPolicies/restorePolicy 為 Super-only(enforce_mw 強制),已排除 menu-soft-delete archive。

const loading = ref(false);
const archived = ref<Api.SystemManage.ArchivedPolicy[]>([]);

// 客端篩選:維度(下拉) + 角色(輸入)。後端回傳全量、前端 filter。
const filterDimension = ref<string | null>(null);
const filterRoleCode = ref<string>('');

const dimensionOptions = [
  { label: 'menu', value: 'menu' },
  { label: 'button', value: 'button' },
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'DELETE', value: 'DELETE' }
];

const filteredData = computed(() =>
  archived.value.filter(row => {
    const dimMatch = !filterDimension.value || row.dimension === filterDimension.value;
    const roleMatch =
      !filterRoleCode.value || row.roleCode.toLowerCase().includes(filterRoleCode.value.trim().toLowerCase());
    return dimMatch && roleMatch;
  })
);

async function loadArchived() {
  loading.value = true;
  const { data, error } = await fetchGetArchivedPolicies();
  loading.value = false;
  if (error || !data) {
    return;
  }
  archived.value = data;
}

async function handleRestore(id: Api.SystemManage.ArchivedPolicy['id']) {
  const { error } = await fetchRestorePolicy(Number(id));
  if (!error) {
    window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));
    loadArchived();
  }
}

const columns = computed<DataTableColumns<Api.SystemManage.ArchivedPolicy>>(() => [
  {
    key: 'dimension',
    title: $t('page.manage.policyArchive.dimension'),
    align: 'center',
    width: 100
  },
  {
    key: 'roleCode',
    title: $t('page.manage.policyArchive.roleCode'),
    align: 'center',
    minWidth: 120
  },
  {
    key: 'target',
    title: $t('page.manage.policyArchive.target'),
    align: 'center',
    minWidth: 160
  },
  {
    key: 'reason',
    title: $t('page.manage.policyArchive.reason'),
    align: 'center',
    minWidth: 140
  },
  {
    key: 'archivedAt',
    title: $t('page.manage.policyArchive.archivedAt'),
    align: 'center',
    minWidth: 160
  },
  {
    key: 'archivedBy',
    title: $t('page.manage.policyArchive.archivedBy'),
    align: 'center',
    width: 100,
    render: row => <span>{row.archivedBy ?? '-'}</span>
  },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 120,
    render: row => (
      <div class="flex-center">
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
]);

onMounted(loadArchived);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard
      :title="$t('page.manage.policyArchive.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <div class="flex-y-center gap-12px">
          <NSelect
            v-model:value="filterDimension"
            :options="dimensionOptions"
            clearable
            size="small"
            class="w-140px"
            :placeholder="$t('page.manage.policyArchive.dimension')"
          />
          <NInput
            v-model:value="filterRoleCode"
            clearable
            size="small"
            class="w-160px"
            :placeholder="$t('page.manage.policyArchive.roleCode')"
          />
          <NButton size="small" :loading="loading" @click="loadArchived">
            {{ $t('common.refresh') }}
          </NButton>
        </div>
      </template>
      <NDataTable
        :columns="columns"
        :data="filteredData"
        size="small"
        :loading="loading"
        :row-key="row => row.id"
        :scroll-x="800"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
