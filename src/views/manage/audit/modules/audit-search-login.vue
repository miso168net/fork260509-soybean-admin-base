<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 登入嘗試搜尋卡（新增檔；
// 基線 example 無此路徑、零原行；憲法 §III.2 (viii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 過濾維＝userName（attempted_user_name 模糊）＋success（'true'/'false' 字串下拉、值域外＝未設
// ——wire 契約 §2）＋realIp（★精確等值 /32、/128、非模糊——FR-B08）＋時間區間（共用 composable）。
// ★本源無人員過濾維（created_by 恆 NULL＝匿名寫入）；節流短路遭拒不落表的語意告示由
// index.vue 之 NAlert 承載（FR-E06、歸 T030）、非本卡射程。
// i18n 鍵分工＝label 走分頁樹＋common、placeholder 走 form.*（譯文歸 T032）。
// rev4: 高度參照 rev4 之 audit-search-login.vue；rev5 差異＝型別取 `Api.Audit`（ADR 0019）。
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

// success 值域收斂＝'true'/'false' 字串（query 無 boolean 載體——rev5-audit.d.ts 逐字）；label 走 i18n
const successOptions = computed<CommonType.Option<'true' | 'false'>[]>(() => [
  { label: $t('page.manage.audit.login.successOption.true'), value: 'true' },
  { label: $t('page.manage.audit.login.successOption.false'), value: 'false' }
]);

// daterange＋reset/search 共用段（詳 use-audit-search-date-range.ts）
const { dateRange, resetModel, search } = useAuditSearchDateRange(model, emit);
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <!-- NCollapse 預設展開：收合時 daterange picker DOM 惰性不渲染（rev4: 其 spike 注意事項、rev5 沿用） -->
    <NCollapse :default-expanded-names="['audit-search-login']">
      <NCollapseItem :title="$t('common.search')" name="audit-search-login">
        <NForm :model="model" label-placement="left" :label-width="90">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.login.attemptedUserName')"
              path="userName"
              class="pr-24px"
            >
              <NInput v-model:value="model.userName" :placeholder="$t('page.manage.audit.form.attemptedUserName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.login.success')"
              path="success"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.success"
                :placeholder="$t('page.manage.audit.form.success')"
                :options="successOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.audit.common.realIp')"
              path="realIp"
              class="pr-24px"
            >
              <NInput v-model:value="model.realIp" :placeholder="$t('page.manage.audit.form.realIp')" />
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
