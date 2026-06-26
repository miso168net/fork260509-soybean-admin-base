<script setup lang="tsx">
import { ref } from 'vue';
import { NDatePicker, NInput, NSelect } from 'naive-ui';
import { fetchExportOperationLog, fetchGetOperationLog } from '@/service/api/rev3-system-manage';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import { downloadCsv } from '@/utils/download';
import { renderConfidenceTag } from './ip-confidence-tag';
import { confidenceOptions } from './ip-confidence-options';

defineOptions({
  name: 'OperationLogTable'
});

const appStore = useAppStore();

// [rev3-inline 012-audit-log-query] 操作类型下拉（enum INSERT/UPDATE/SOFT_DELETE/RESTORE，精确）
const operationOptions = [
  { label: () => $t('page.manage.audit.operationType.insert'), value: 'INSERT' },
  { label: () => $t('page.manage.audit.operationType.update'), value: 'UPDATE' },
  { label: () => $t('page.manage.audit.operationType.softDelete'), value: 'SOFT_DELETE' },
  { label: () => $t('page.manage.audit.operationType.restore'), value: 'RESTORE' }
];

const searchParams = ref<Api.SystemManage.OperationLogSearchParams>({
  current: 1,
  size: 10,
  entityTable: null,
  operation: null,
  operatorName: null,
  operatorRealIp: null,
  operatorPeerIp: null,
  operatorIpConfidence: null,
  operatorXForwardedFor: null,
  entityId: null,
  traceId: null,
  createdFrom: null,
  createdTo: null
});

// [rev3-inline 012-audit-log-query] NDatePicker daterange emit ms timestamp → 转 ISO 字串塞 searchParams
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

const { columns, data, loading, getDataByPage, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetOperationLog(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      type: 'expand',
      // [rev3-inline 012-audit-log-query] op-log 行展开看 payload before/after（US6/SC-004）
      // payload 为 unknown（casbin 列=string[]、role/user 列=物件、任意 JSON）→ 渲染前判 null、JSON.stringify
      renderExpand: row => {
        const renderPayload = (payload: unknown) =>
          payload === null || payload === undefined ? (
            <span class="text-gray-400">{$t('page.manage.audit.empty')}</span>
          ) : (
            <pre class="max-h-300px overflow-auto whitespace-pre-wrap break-all text-12px">
              {JSON.stringify(payload, null, 2)}
            </pre>
          );

        return (
          <div class="flex-col gap-12px p-12px">
            <div>
              <div class="mb-4px font-bold">{$t('page.manage.audit.col.payloadBefore')}</div>
              {renderPayload(row.payloadBefore)}
            </div>
            <div>
              <div class="mb-4px font-bold">{$t('page.manage.audit.col.payloadAfter')}</div>
              {renderPayload(row.payloadAfter)}
            </div>
          </div>
        );
      }
    },
    {
      key: 'createTime',
      title: $t('page.manage.audit.col.time'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'operatorName',
      title: $t('page.manage.audit.col.operator'),
      align: 'center',
      minWidth: 100,
      // [rev3-inline 012-audit-log-query] null 如实显示空（FR-011，不用误导预设值）
      render: row => row.operatorName ?? ''
    },
    {
      key: 'operation',
      title: $t('page.manage.audit.col.operation'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'entityTable',
      title: $t('page.manage.audit.col.entityTable'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'entityId',
      title: $t('page.manage.audit.col.entityId'),
      align: 'center',
      minWidth: 80,
      render: row => row.entityId ?? ''
    },
    {
      // [rev3-inline 013-xff-real-ip-forensics ★] 四欄鑑識（operator_ 前綴；順序 confidence→peerIp→realIp→xForwardedFor）
      key: 'operatorIpConfidence',
      title: $t('page.manage.audit.col.confidence'),
      align: 'center',
      minWidth: 110,
      render: row => renderConfidenceTag(row.operatorIpConfidence)
    },
    {
      key: 'operatorPeerIp',
      title: $t('page.manage.audit.col.peerIp'),
      align: 'center',
      minWidth: 130,
      render: row => row.operatorPeerIp ?? $t('page.manage.audit.empty')
    },
    {
      key: 'operatorRealIp',
      title: $t('page.manage.audit.col.realIp'),
      align: 'center',
      minWidth: 130,
      render: row => row.operatorRealIp ?? $t('page.manage.audit.empty')
    },
    {
      key: 'operatorXForwardedFor',
      title: $t('page.manage.audit.col.xForwardedFor'),
      align: 'center',
      minWidth: 180,
      render: row => row.operatorXForwardedFor ?? $t('page.manage.audit.empty')
    }
  ]
});

function reset() {
  searchParams.value.entityTable = null;
  searchParams.value.operation = null;
  searchParams.value.operatorName = null;
  searchParams.value.operatorRealIp = null;
  searchParams.value.operatorPeerIp = null;
  searchParams.value.operatorIpConfidence = null;
  searchParams.value.operatorXForwardedFor = null;
  searchParams.value.entityId = null;
  searchParams.value.traceId = null;
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
  const { error, data } = await fetchExportOperationLog(searchParams.value);
  if (error || !data) return;
  downloadCsv(data.csv, `operation_${Date.now()}.csv`);
  if (data.truncated) {
    window.$message?.warning($t('page.manage.audit.exportTruncated'));
  }
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('common.search')" name="audit-operation-search">
          <NForm :model="searchParams" label-placement="left" :label-width="80">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.entityTable')" class="pr-24px">
                <NInput v-model:value="searchParams.entityTable" :placeholder="$t('page.manage.audit.filter.entityTable')" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.operation')" class="pr-24px">
                <NSelect
                  v-model:value="searchParams.operation"
                  :placeholder="$t('page.manage.audit.filter.operation')"
                  :options="operationOptions"
                  clearable
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.operator')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.operatorName"
                  :placeholder="$t('page.manage.audit.filter.operatorName')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.confidence')" class="pr-24px">
                <NSelect
                  v-model:value="searchParams.operatorIpConfidence"
                  :placeholder="$t('page.manage.audit.filter.operatorIpConfidence')"
                  :options="confidenceOptions"
                  clearable
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.peerIp')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.operatorPeerIp"
                  :placeholder="$t('page.manage.audit.filter.operatorPeerIp')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.realIp')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.operatorRealIp"
                  :placeholder="$t('page.manage.audit.filter.operatorRealIp')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.xForwardedFor')" class="pr-24px">
                <NInput
                  v-model:value="searchParams.operatorXForwardedFor"
                  :placeholder="$t('page.manage.audit.filter.operatorXForwardedFor')"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.entityId')" class="pr-24px">
                <NInputNumber
                  v-model:value="searchParams.entityId"
                  :placeholder="$t('page.manage.audit.filter.entityId')"
                  class="w-full"
                />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.audit.col.traceId')" class="pr-24px">
                <NInput v-model:value="searchParams.traceId" :placeholder="$t('page.manage.audit.filter.traceId')" />
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
        :scroll-x="1500"
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
