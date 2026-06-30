<script setup lang="tsx">
import { ref, watch } from 'vue';
import { NInput, NSelect } from 'naive-ui';
import type { SelectOption } from 'naive-ui';
import { fetchExportAccessLog, fetchGetAccessLog } from '@/service/api/rev3-system-manage';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
// [rev3-inline 023-list-column-sort MW(f)] 列表欄位排序 composable（受控排序 + 點擊序 + wire 字串）
import { useTableSort } from '@/hooks/common/use-table-sort';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { downloadCsv } from '@/utils/download';
import { renderConfidenceTag } from './ip-confidence-tag';
import { confidenceOptions } from './ip-confidence-options';

defineOptions({
  name: 'AccessLogTable'
});

const appStore = useAppStore();

// [rev3-inline 012-audit-log-query] HTTP method 下拉（精确）
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

// [rev3-inline 017-audit-center-enhancement C-1 ★] http_status 類別 quick-filter 下拉
// 「全部」value=null（pruneNullParams 剔除→wire 缺席→後端 None）；2xx/4xx/5xx 字面硬編、與精確 httpStatus 並存＝AND
// value:null 為 naive-ui 清除態（runtime 合法、型上 SelectOption.value 為 string|number、故單欄 cast）
const statusClassOptions: SelectOption[] = [
  { label: () => $t('page.manage.audit.statusClassAll'), value: null as unknown as string },
  { label: '2xx', value: '2xx' },
  { label: '4xx', value: '4xx' },
  { label: '5xx', value: '5xx' }
];

const searchParams = ref<Api.SystemManage.AccessLogSearchParams>({
  current: 1,
  size: 10,
  operatorName: null,
  method: null,
  path: null,
  httpStatus: null,
  httpStatusClass: null,
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
    // H-4 off-by-one：NDatePicker daterange 結束值落當日 00:00:00（本地），補到當日末刻 23:59:59.999
    // 後端對完整 RFC3339 as-is（不再延），前端延即可、互不重複調整。
    const end = new Date(value[1]);
    end.setHours(23, 59, 59, 999);
    searchParams.value.createdTo = end.toISOString();
  } else {
    searchParams.value.createdFrom = null;
    searchParams.value.createdTo = null;
  }
}

// [rev3-inline 023-list-column-sort MW(f)] 排序受控狀態（須置於 useNaivePaginatedTable 之前供 columns factory 引用）
const { handleUpdateSorter, getColumnSortProps, sortString } = useTableSort();

const { columns, data, loading, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  // [rev3-inline 023-list-column-sort MW(f)] sort 走 api closure 合併（不入 searchParams 型）；空字串→undefined 略過
  api: () => fetchGetAccessLog({ ...searchParams.value, sort: sortString.value || undefined }),
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
      minWidth: 180,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('createTime')
    },
    {
      key: 'operatorName',
      title: $t('page.manage.audit.col.operator'),
      align: 'center',
      minWidth: 100,
      // [rev3-inline 023-list-column-sort MW(f)] operatorName 為衍生 join、非後端白名單 → 不掛排序
      render: row => row.operatorName ?? ''
    },
    {
      key: 'method',
      title: $t('page.manage.audit.col.method'),
      align: 'center',
      minWidth: 80,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('method')
    },
    {
      key: 'path',
      title: $t('page.manage.audit.col.path'),
      minWidth: 200,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('path')
    },
    {
      key: 'httpStatus',
      title: $t('page.manage.audit.col.status'),
      align: 'center',
      minWidth: 80,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('httpStatus')
    },
    {
      // [rev3-inline 013-xff-real-ip-forensics ★] 四欄鑑識（順序 confidence→peerIp→realIp→xForwardedFor）
      key: 'ipConfidence',
      title: $t('page.manage.audit.col.confidence'),
      align: 'center',
      minWidth: 110,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('ipConfidence'),
      render: row => renderConfidenceTag(row.ipConfidence)
    },
    {
      key: 'peerIp',
      title: $t('page.manage.audit.col.peerIp'),
      align: 'center',
      minWidth: 130,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('peerIp'),
      render: row => row.peerIp ?? $t('page.manage.audit.empty')
    },
    {
      key: 'realIp',
      title: $t('page.manage.audit.col.realIp'),
      align: 'center',
      minWidth: 130,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('realIp')
    },
    {
      key: 'xForwardedFor',
      title: $t('page.manage.audit.col.xForwardedFor'),
      align: 'center',
      minWidth: 180,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('xForwardedFor'),
      render: row => row.xForwardedFor ?? $t('page.manage.audit.empty')
    },
    {
      key: 'region',
      title: $t('page.manage.audit.col.region'),
      align: 'center',
      minWidth: 140,
      // [rev3-inline 023-list-column-sort MW(f)] 可排序欄
      ...getColumnSortProps('region'),
      render: row => row.region ?? ''
    }
  ]
});

// [rev3-inline 023-list-column-sort MW(f)] 排序變更 → 重抓並回第 1 頁（FR-006）
watch(sortString, () => {
  getDataByPage(1);
});

function reset() {
  searchParams.value.operatorName = null;
  searchParams.value.method = null;
  searchParams.value.path = null;
  searchParams.value.httpStatus = null;
  searchParams.value.httpStatusClass = null;
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

// [rev3-inline 017-audit-center-enhancement C-3＋F4 ★] CSV 匯出（當前篩選；後端 cap 1 萬列、截斷以後端 truncated 旗標為準、非 stale list total）
async function onExport() {
  // [rev3-inline 023-list-column-sort MW(f)/FR-016] 匯出帶入當前排序（CSV 列序與畫面一致）
  const { error, data } = await fetchExportAccessLog({ ...searchParams.value, sort: sortString.value || undefined });
  if (error || !data) return;
  downloadCsv(data.csv, `access_${Date.now()}.csv`);
  if (data.truncated) {
    window.$message?.warning($t('page.manage.audit.exportTruncated'));
  }
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="audit-access-search">
          <NForm :model="searchParams" label-placement="left" :label-width="80">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.operator')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.operatorName"
                  :placeholder="$t('page.manage.audit.filter.operatorName')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.method')" class="pr-24px">
                <NSelect
                  v-model:value="searchParams.method"
                  :placeholder="$t('page.manage.audit.filter.method')"
                  :options="methodOptions"
                  clearable
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.path')" class="pr-24px">
                <NInput v-model:value="searchParams.path" :placeholder="$t('page.manage.audit.filter.path')" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.status')" class="pr-24px">
                <NInputNumber
                  v-model:value="searchParams.httpStatus"
                  :placeholder="$t('page.manage.audit.filter.status')"
                  class="w-full"
                />
              </NFormItemGi>
              <!-- [rev3-inline 017-audit-center-enhancement C-1 ★] http_status 類別 quick-filter（與精確 status 並存＝AND） -->
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.statusClass')" class="pr-24px">
                <NSelect
                  v-model:value="searchParams.httpStatusClass"
                  :placeholder="$t('page.manage.audit.filter.statusClass')"
                  :options="statusClassOptions"
                  clearable
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
        </NCollapseItem>
      </NCollapse>
    </NCard>
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1400"
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
