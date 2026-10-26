<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 存取日誌搜尋卡（新增檔；上游基線無此路徑）——請求方法／狀態碼（等值）、路徑（部分字串）、操作者 id 或名稱、時間區間 -->
<script setup lang="ts">
// 骨架同 `audit-search-operation.vue`；出處＝rev5:src/views/manage/audit/modules/audit-search-access.vue。
// 本卡不設來源位址過濾欄：存取日誌之查詢參數型本無此欄（rev5 同形）。
// 路徑過濾為部分字串比對、萬用字元一律當字面；狀態碼過濾的是 HTTP 狀態碼、不是業務碼。
import { $t } from '@/locales';
import { useAuditSearchDateRange } from './use-audit-search-date-range';

defineOptions({
  name: 'AuditSearchAccess'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Audit.AccessLogSearchParams>('model', { required: true });

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
              :label="$t('page.manage.audit.column.httpMethod')"
              path="httpMethod"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.httpMethod"
                :placeholder="$t('page.manage.audit.search.placeholder.httpMethod')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.httpStatus')"
              path="httpStatus"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.httpStatus"
                :placeholder="$t('page.manage.audit.search.placeholder.httpStatus')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.httpPath')"
              path="httpPath"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.httpPath"
                :placeholder="$t('page.manage.audit.search.placeholder.httpPath')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.search.operatorId')"
              path="operatorId"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.operatorId"
                :placeholder="$t('page.manage.audit.search.placeholder.operatorId')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.search.operatorName')"
              path="operatorName"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.operatorName"
                :placeholder="$t('page.manage.audit.search.placeholder.operatorName')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 m:12"
              :label="$t('page.manage.audit.search.timeRange')"
              path="timeRange"
              class="pr-24px"
            >
              <NDatePicker
                v-model:value="dateRange"
                type="datetimerange"
                clearable
                class="w-full"
                :placeholder="$t('page.manage.audit.search.placeholder.timeRange')"
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
