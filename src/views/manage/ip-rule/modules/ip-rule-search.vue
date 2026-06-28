<script setup lang="ts">
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import { ruleTypeOptions } from './shared';

// [rev3-inline 022-ip-access-control MODAL-WIRING] IP 規則搜尋（cidr 模糊 / ruleType 精確；沿 user-search 範式、可收合）
defineOptions({
  name: 'IpRuleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.SystemManage.IpRuleSearchParams>('model', { required: true });

const defaultModel = jsonClone(toRaw(model.value));

function reset() {
  Object.assign(model.value, defaultModel);
  emit('search');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="ip-rule-search">
        <NForm :model="model" label-placement="left" :label-width="100">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.cidr')" class="pr-24px">
              <NInput v-model:value="model.cidr" :placeholder="$t('page.manage.ipRule.form.cidr')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.ruleType')" class="pr-24px">
              <NSelect
                v-model:value="model.ruleType"
                :placeholder="$t('page.manage.ipRule.form.ruleType')"
                :options="translateOptions(ruleTypeOptions)"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
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
