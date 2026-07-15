<script setup lang="ts">
// [rev4 net-new 012-audit-admin] 操作日誌搜尋列（policy-archive-search 輕量範式＋U8 daterange 用法）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。人員過濾＝operatorId（數字）或 operatorName（文字）擇一（後端同傳 Id 優先）。
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditSearchOperation'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.SystemManage.OperationLogSearchParams>('model', { required: true });

// daterange 控件值型＝兩元素毫秒 timestamp 陣列或 null（U8 spike 實測）；search/reset 時轉 wire timeFrom/timeTo（逐端 UTC RFC3339、null 略去）
const dateRange = ref<[number, number] | null>(null);

function applyDateRange() {
  if (dateRange.value) {
    model.value.timeFrom = new Date(dateRange.value[0]).toISOString();
    model.value.timeTo = new Date(dateRange.value[1]).toISOString();
  } else {
    model.value.timeFrom = null;
    model.value.timeTo = null;
  }
}

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
  dateRange.value = null;
  applyDateRange();
  // reset 後補 emit('search')（鏡像 policy-archive-search）——重置即刷新列表
  emit('search');
}

function search() {
  applyDateRange();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- NCollapse 預設展開：收合時 daterange picker DOM 惰性不渲染（U8 spike 注意事項） -->
    <NCollapse :default-expanded-names="['audit-search-operation']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-operation">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.operation.entityTable')"
              path="entityTable"
              class="pr-24px"
            >
              <NInput v-model:value="model.entityTable" :placeholder="$t('page.manage.audit.form.entityTable')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.operation.operation')"
              path="operation"
              class="pr-24px"
            >
              <NInput v-model:value="model.operation" :placeholder="$t('page.manage.audit.form.operation')" />
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
