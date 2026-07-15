<script setup lang="ts">
// [rev4 net-new 012-audit-admin] 會話事件搜尋列（policy-archive-search 輕量範式＋U8 daterange 用法）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。人員過濾＝userId（數字）或 userName（文字）擇一；eventType/reason 等值。
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditSearchSession'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.SystemManage.SessionEventSearchParams>('model', { required: true });

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
  emit('search');
}

function search() {
  applyDateRange();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
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
