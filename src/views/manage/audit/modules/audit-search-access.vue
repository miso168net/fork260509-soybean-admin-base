<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 存取日誌搜尋卡（新增檔；
// 基線 example 無此路徑、零原行；憲法 §III.2 (viii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 過濾維＝httpMethod／httpStatus 等值＋httpPath 模糊含（後端 ILIKE、萬用字元字面化）＋
// operatorId／operatorName 人員擇一（同傳 id 優先）＋時間區間（共用 composable）。
// ★本分頁現況恆空表（sys_access_log 寫入面歸 B-016）＝已知態；搜尋卡照常進場、資料隨寫入面
// 落地後即用。i18n 鍵分工＝label 走分頁樹＋common、placeholder 走 form.*（譯文歸 T032）。
// rev4: 高度參照 rev4 之 audit-search-access.vue；rev5 差異＝型別取 `Api.Audit`（ADR 0019）。
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

// daterange＋reset/search 共用段（詳 use-audit-search-date-range.ts）
const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- NCollapse 預設展開：收合時 daterange picker DOM 惰性不渲染（rev4: 其 spike 注意事項、rev5 沿用） -->
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
