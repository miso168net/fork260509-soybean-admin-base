<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 會話事件搜尋卡（新增檔；
// 基線 example 無此路徑、零原行；憲法 §III.2 (viii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 過濾維＝userId（數字）或 userName（文字）人員擇一（事件主體、同傳 id 優先——data-model §2）＋
// eventType／reason 等值＋時間區間（共用 composable）。
// i18n 鍵分工＝label 走分頁樹＋common、placeholder 走 form.*（譯文歸 T032）。
// rev4: 高度參照 rev4 之 audit-search-session.vue；rev5 差異＝型別取 `Api.Audit`（ADR 0019）。
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

// daterange＋reset/search 共用段（詳 use-audit-search-date-range.ts）
const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- NCollapse 預設展開：收合時 daterange picker DOM 惰性不渲染（rev4: 其 spike 注意事項、rev5 沿用） -->
    <NCollapse :default-expanded-names="['audit-search-session']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-session">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.session.userId')"
              path="userId"
              class="pr-24px"
            >
              <NInputNumber
                v-model:value="model.userId"
                :placeholder="$t('page.manage.audit.form.userId')"
                :show-button="false"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.session.userName')"
              path="userName"
              class="pr-24px"
            >
              <NInput v-model:value="model.userName" :placeholder="$t('page.manage.audit.form.userName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.session.eventType')"
              path="eventType"
              class="pr-24px"
            >
              <NInput v-model:value="model.eventType" :placeholder="$t('page.manage.audit.form.eventType')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.session.reason')"
              path="reason"
              class="pr-24px"
            >
              <NInput v-model:value="model.reason" :placeholder="$t('page.manage.audit.form.reason')" />
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
