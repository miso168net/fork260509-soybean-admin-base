<script setup lang="ts">
// [rev4 net-new 012-audit-admin] 存取日誌搜尋列（policy-archive-search 輕量範式＋U8 daterange 用法）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。httpPath 模糊比對；人員過濾＝operatorId（數字）或 operatorName（文字）擇一。
import { $t } from '@/locales';
import { useAuditSearchDateRange } from './use-audit-search-date-range';

defineOptions({
  name: 'AuditSearchAccess'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.SystemManage.AccessLogSearchParams>('model', { required: true });

// daterange＋reset/search 共用段（B-096 提煉、詳 use-audit-search-date-range.ts）
const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['audit-search-access']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-access">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.access.httpMethod')"
              path="httpMethod"
              class="pr-24px"
            >
              <NInput v-model:value="model.httpMethod" :placeholder="$t('page.manage.audit.form.httpMethod')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.access.httpStatus')"
              path="httpStatus"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.httpStatus"
                :placeholder="$t('page.manage.audit.form.httpStatus')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.access.httpPath')"
              path="httpPath"
              class="pr-24px"
            >
              <NInput v-model:value="model.httpPath" :placeholder="$t('page.manage.audit.form.httpPath')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.common.operatorId')"
              path="operatorId"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.operatorId"
                :placeholder="$t('page.manage.audit.form.operatorId')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.common.operatorName')"
              path="operatorName"
              class="pr-24px"
            >
              <NInput v-model:value="model.operatorName" :placeholder="$t('page.manage.audit.form.operatorName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 m:12"
              :label="$t('page.manage.audit.common.timeRange')"
              path="timeRange"
              class="pr-24px"
            >
              <NDatePicker
                v-model:value="dateRange"
                type="datetimerange"
                clearable
                class="w-full"
                :placeholder="$t('page.manage.audit.form.timeRange')"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:12" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="resetModel">
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
</template>

<style scoped></style>
