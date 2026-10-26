<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 登入嘗試搜尋卡（新增檔；上游基線無此路徑）——嘗試帳號（部分字串）、結果（下拉、可清空）、來源 IP（精確比對）、時間區間 -->
<script setup lang="ts">
// 骨架同 `audit-search-operation.vue`；出處＝rev5:src/views/manage/audit/modules/audit-search-login.vue。
// 結果下拉之值為字串 'true'／'false'（查詢參數沒有布林載體）；來源 IP 過濾為精確等值、不做字串包含。本源沒有操作者欄、故無人員過濾。
import { computed } from 'vue';
import { $t } from '@/locales';
import { useAuditSearchDateRange } from './use-audit-search-date-range';

defineOptions({
  name: 'AuditSearchLogin'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.Audit.LoginAttemptSearchParams>('model', { required: true });

// 包 computed＝切換語系時標籤跟著變；兩值標籤與清單之結果欄共用同一組鍵
const successOptions = computed<CommonType.Option<'true' | 'false'>[]>(() => [
  { label: $t('page.manage.audit.column.successOption.true'), value: 'true' },
  { label: $t('page.manage.audit.column.successOption.false'), value: 'false' }
]);

const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['audit-search-login']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-login">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.attemptedUserName')"
              path="userName"
              class="pr-24px"
            >
              <NInput
                v-model:value="model.userName"
                :placeholder="$t('page.manage.audit.search.placeholder.attemptedUserName')"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.success')"
              path="success"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.success"
                :placeholder="$t('page.manage.audit.search.placeholder.success')"
                :options="successOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.column.realIp')"
              path="realIp"
              class="pr-24px"
            >
              <NInput v-model:value="model.realIp" :placeholder="$t('page.manage.audit.search.placeholder.realIp')" />
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
