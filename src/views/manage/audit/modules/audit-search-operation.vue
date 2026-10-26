<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 操作日誌搜尋卡（新增檔；上游基線無此路徑）——資料表／動作（等值）、操作者 id 或名稱、時間區間 -->
<script setup lang="ts">
// 骨架同 `views/manage/ip-rule/modules/ip-rule-search.vue`（NCollapse＋defineModel＋重設／搜尋兩鈕），時間區間與重設走共用 composable；
// 出處＝rev5:src/views/manage/audit/modules/audit-search-operation.vue。
// 動作過濾為大小寫敏感之等值比對，輸入提示之範例取庫內實際寫入之小寫字面（`update`、`kick`）。
// 操作者 id 與名稱同時給時後端以 id 為準。
import { $t } from '@/locales';
import { useAuditSearchDateRange } from './use-audit-search-date-range';

defineOptions({
  name: 'AuditSearchOperation'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Audit.OperationLogSearchParams>('model', { required: true });

const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['audit-search-operation']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-operation">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.entityTable')"
              path="entityTable"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.entityTable"
                :placeholder="$t('page.manage.audit.search.placeholder.entityTable')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.operation')"
              path="operation"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.operation"
                :placeholder="$t('page.manage.audit.search.placeholder.operation')"
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
