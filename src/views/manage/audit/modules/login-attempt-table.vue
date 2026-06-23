<script setup lang="tsx">
import { ref } from 'vue';
import { NInput, NSelect, NTag } from 'naive-ui';
import { fetchExportLoginAttempt, fetchGetLoginAttempt } from '@/service/api/rev3-system-manage';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { CSV_EXPORT_CAP, downloadCsv } from '@/utils/download';
import { renderConfidenceTag } from './ip-confidence-tag';
import { confidenceOptions } from './ip-confidence-options';

defineOptions({
  name: 'LoginAttemptTable'
});

const appStore = useAppStore();

// [rev3-inline 012-audit-log-query] 成败下拉（bool 精确）
// naive NSelect value 仅接受 string|number → 用字串 proxy（'1'=成功/'2'=失败）、change 时映射回 searchParams.success(boolean|null)
const resultOptions = [
  { label: () => $t('page.manage.audit.resultOption.success'), value: '1' },
  { label: () => $t('page.manage.audit.resultOption.failure'), value: '2' }
];

const resultValue = ref<string | null>(null);

function onResultChange(value: string | null) {
  resultValue.value = value;
  searchParams.value.success = value === null ? null : value === '1';
}

const searchParams = ref<Api.SystemManage.LoginAttemptSearchParams>({
  current: 1,
  size: 10,
  attemptedUserName: null,
  success: null,
  realIp: null,
  peerIp: null,
  ipConfidence: null,
  xForwardedFor: null,
  region: null,
  createdFrom: null,
  createdTo: null
});

const dateRange = ref<[number, number] | null>(null);

function onDateRangeChange(value: [number, number] | null) {
  dateRange.value = value;
  if (value) {
    searchParams.value.createdFrom = new Date(value[0]).toISOString();
    searchParams.value.createdTo = new Date(value[1]).toISOString();
  } else {
    searchParams.value.createdFrom = null;
    searchParams.value.createdTo = null;
  }
}

const { columns, data, loading, getDataByPage, pagination, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetLoginAttempt(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'createTime',
      title: $t('page.manage.audit.col.time'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'attemptedUserName',
      title: $t('page.manage.audit.col.account'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'success',
      title: $t('page.manage.audit.col.result'),
      align: 'center',
      minWidth: 90,
      render: row => {
        const type = row.success ? 'success' : 'error';
        const label = row.success
          ? $t('page.manage.audit.resultOption.success')
          : $t('page.manage.audit.resultOption.failure');

        return <NTag type={type}>{label}</NTag>;
      }
    },
    {
      // [rev3-inline 013-xff-real-ip-forensics ★] 四欄鑑識（順序 confidence→peerIp→realIp→xForwardedFor）
      key: 'ipConfidence',
      title: $t('page.manage.audit.col.confidence'),
      align: 'center',
      minWidth: 110,
      render: row => renderConfidenceTag(row.ipConfidence)
    },
    {
      key: 'peerIp',
      title: $t('page.manage.audit.col.peerIp'),
      align: 'center',
      minWidth: 130,
      render: row => row.peerIp ?? $t('page.manage.audit.empty')
    },
    {
      key: 'realIp',
      title: $t('page.manage.audit.col.realIp'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'xForwardedFor',
      title: $t('page.manage.audit.col.xForwardedFor'),
      align: 'center',
      minWidth: 180,
      render: row => row.xForwardedFor ?? $t('page.manage.audit.empty')
    },
    {
      key: 'region',
      title: $t('page.manage.audit.col.region'),
      align: 'center',
      minWidth: 140,
      render: row => row.region ?? ''
    }
  ]
});

function reset() {
  searchParams.value.attemptedUserName = null;
  searchParams.value.success = null;
  resultValue.value = null;
  searchParams.value.realIp = null;
  searchParams.value.peerIp = null;
  searchParams.value.ipConfidence = null;
  searchParams.value.xForwardedFor = null;
  searchParams.value.region = null;
  searchParams.value.createdFrom = null;
  searchParams.value.createdTo = null;
  dateRange.value = null;
  getDataByPage();
}

function search() {
  getDataByPage();
}

// [rev3-inline 017-audit-center-enhancement C-3 ★] CSV 匯出（當前篩選；後端 cap 1 萬列、F4 截斷以匯出前同篩選 list total 為準）
async function onExport() {
  const { error, data: csv } = await fetchExportLoginAttempt(searchParams.value);
  if (error) return;
  downloadCsv(csv, `login_${Date.now()}.csv`);
  if ((pagination.itemCount ?? 0) > CSV_EXPORT_CAP) {
    window.$message?.warning($t('page.manage.audit.exportTruncated'));
  }
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NForm :model="searchParams" label-placement="left" :label-width="80">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.account')" class="pr-24px">
            <NInput
              v-model:value="searchParams.attemptedUserName"
              :placeholder="$t('page.manage.audit.filter.account')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.result')" class="pr-24px">
            <NSelect
              :value="resultValue"
              :placeholder="$t('page.manage.audit.filter.result')"
              :options="resultOptions"
              clearable
              @update:value="onResultChange"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.confidence')" class="pr-24px">
            <NSelect
              v-model:value="searchParams.ipConfidence"
              :placeholder="$t('page.manage.audit.filter.ipConfidence')"
              :options="confidenceOptions"
              clearable
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.peerIp')" class="pr-24px">
            <NInput v-model:value="searchParams.peerIp" :placeholder="$t('page.manage.audit.filter.peerIp')" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.realIp')" class="pr-24px">
            <NInput v-model:value="searchParams.realIp" :placeholder="$t('page.manage.audit.filter.realIp')" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.xForwardedFor')" class="pr-24px">
            <NInput
              v-model:value="searchParams.xForwardedFor"
              :placeholder="$t('page.manage.audit.filter.xForwardedFor')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.region')" class="pr-24px">
            <NInput v-model:value="searchParams.region" :placeholder="$t('page.manage.audit.filter.region')" />
          </NFormItemGi>
          <NFormItemGi span="24 s:24 m:12" :label="$t('page.manage.audit.col.time')" class="pr-24px">
            <NDatePicker
              :value="dateRange"
              type="daterange"
              clearable
              class="w-full"
              @update:value="onDateRangeChange"
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
              <NButton @click="onExport">
                {{ $t('page.manage.audit.export') }}
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NCard>
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1300"
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
