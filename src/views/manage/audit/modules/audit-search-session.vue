<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 工作階段事件搜尋卡（新增檔；上游基線無此路徑）——事件主體 id 或名稱、事件型／原因（等值）、時間區間 -->
<script setup lang="ts">
// 骨架同 `audit-search-operation.vue`；出處＝rev5:src/views/manage/audit/modules/audit-search-session.vue。
// 人員過濾針對事件主體（不是觸發者），id 與名稱同時給時後端以 id 為準；事件型輸入提示之範例取庫內實際寫入之字面（`kicked`、`idle`）。
import { $t } from '@/locales';
import { useAuditSearchDateRange } from './use-audit-search-date-range';

defineOptions({
  name: 'AuditSearchSession'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Audit.SessionEventSearchParams>('model', { required: true });

const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['audit-search-session']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-session">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.search.userId')"
              path="userId"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.userId"
                :placeholder="$t('page.manage.audit.search.placeholder.userId')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.user')"
              path="userName"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.userName"
                :placeholder="$t('page.manage.audit.search.placeholder.userName')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.eventType')"
              path="eventType"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.eventType"
                :placeholder="$t('page.manage.audit.search.placeholder.eventType')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.reason')"
              path="reason"
              class="pr-24px"
            >
              <NInput v-model:value="model.reason" :placeholder="$t('page.manage.audit.search.placeholder.reason')" />
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
