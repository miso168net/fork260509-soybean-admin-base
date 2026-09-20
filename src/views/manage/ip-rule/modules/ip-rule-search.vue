<!-- [rev6-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則搜尋卡（新增檔；上游基線無此路徑）——網段片段（模糊）／規則類型（等值、可清空）／狀態三態 -->
<script setup lang="ts">
// 骨架同 `views/manage/role/modules/role-search.vue`（NCollapse＋defineModel＋重設／搜尋兩鈕）；出處＝rev5:src/views/manage/ip-rule/modules/ip-rule-search.vue。
// 狀態下拉不給 clearable：「全部」已是三態之一，再允許清成 null 等於同一個意思有兩種寫法。
import { computed, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { $t } from '@/locales';

defineOptions({
  name: 'IpRuleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.IpRule.IpRuleListQuery>('model', { required: true });

// 兩組選項都包 computed＝切換語系時標籤跟著變
const ruleTypeOptions = computed<CommonType.Option<Api.IpRule.RuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

const statusOptions = computed<CommonType.Option<Api.IpRule.DeletedFilter>[]>(() => [
  { label: $t('page.manage.ipRule.statusActive'), value: 'active' },
  { label: $t('page.manage.ipRule.statusDeleted'), value: 'deleted' },
  { label: $t('page.manage.ipRule.statusAll'), value: 'all' }
]);

// 掛載當下的值即「重設」要回到的狀態
const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['ip-rule-search']">
      <NCollapseItem :title="$t('common.search')" name="ip-rule-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.wbipCidr')" path="wbipCidr" class="pr-24px">
              <NInput v-model:value="model.wbipCidr" :placeholder="$t('page.manage.ipRule.form.wbipCidr')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.wbipType')" path="wbipType" class="pr-24px">
              <NSelect
                v-model:value="model.wbipType"
                :placeholder="$t('page.manage.ipRule.form.wbipType')"
                :options="ruleTypeOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.status')" path="deleted" class="pr-24px">
              <NSelect
                v-model:value="model.deleted"
                :placeholder="$t('page.manage.ipRule.form.status')"
                :options="statusOptions"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6">
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
