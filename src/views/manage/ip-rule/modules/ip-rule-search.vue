<script setup lang="ts">
// [rev4 net-new 013-ip-rule-admin] IP 規則三維搜尋卡（user-search 範式：NCollapse＋useNaiveForm＋emit search＋重置/搜索鈕）；
// 三維＝wbipCidr NInput 模糊（比對面與 wire 顯示值同形、含 /32、/128 遮罩後綴可搜）
// 　　＋wbipType NSelect clearable（allow/deny、標籤走 ruleTypeMap i18n）
// 　　＋狀態 NSelect 三態（現役／已刪除／全部、★預設「全部」＝D1 混排全景；憲法 §III.2(d) v1.11.0 錨點控件）；
// ★狀態下拉不設 clearable——「全部」本身即三態選項之一、避免 null 與 'all' 雙重表徵（工程自決）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。
import { computed, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'IpRuleSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.IpRuleListQuery>('model', { required: true });

// 類型二值選項（標籤走 ruleTypeMap i18n；computed 使語系切換即時生效——照 audit-search-login successOptions 先例）
const ruleTypeOptions = computed<CommonType.Option<Api.SystemManage.IpRuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

// 狀態三態選項（契約 §2 deleted tri-state：active／deleted／all、缺省 all）
const statusOptions = computed<CommonType.Option<Api.SystemManage.IpRuleDeletedFilter>[]>(() => [
  { label: $t('page.manage.ipRule.statusActive'), value: 'active' },
  { label: $t('page.manage.ipRule.statusDeleted'), value: 'deleted' },
  { label: $t('page.manage.ipRule.statusAll'), value: 'all' }
]);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="ip-rule-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
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
            <!-- 狀態三態（現役／已刪除／全部）：預設 all＝混排全景；不 clearable（全部即第三選項、避免雙重表徵） -->
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.ipRule.status')" path="deleted" class="pr-24px">
              <NSelect
                v-model:value="model.deleted"
                :placeholder="$t('page.manage.ipRule.form.status')"
                :options="statusOptions"
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
