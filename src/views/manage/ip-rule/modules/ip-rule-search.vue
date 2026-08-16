<script setup lang="ts">
// [rev5-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則三維搜尋卡（新增檔；基線 example 無此路徑、零原行）。
// 三維＝`wbipCidr` 模糊（比對面即清單顯示值、含 `/32` 遮罩後綴故可直接搜）＋`wbipType` 等值（可清空）
// ＋`deleted` 三態（現役／已刪除／全部）。
// ★狀態下拉刻意**不設 clearable**：「全部」本身就是三態之一，再給一個 null 會讓同一語意有兩種表徵。
// 形照本 repo `views/manage/role/modules/role-search.vue`（NCollapse＋defineModel＋reset/search 兩鈕）。
// rev4: 高度參照 rev4 之 ip-rule-search.vue 的三維組成；rev5 差異＝型別取 `Api.IpRule.*` 獨立命名空間。
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

const model = defineModel<Api.IpRule.ListQuery>('model', { required: true });

// 選項用 computed 包一層，語系切換即時反映（純陣列字面會凍在首次求值的語系）
const ruleTypeOptions = computed<CommonType.Option<Api.IpRule.RuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

const statusOptions = computed<CommonType.Option<Api.IpRule.DeletedFilter>[]>(() => [
  { label: $t('page.manage.ipRule.statusActive'), value: 'active' },
  { label: $t('page.manage.ipRule.statusDeleted'), value: 'deleted' },
  { label: $t('page.manage.ipRule.statusAll'), value: 'all' }
]);

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
            <!-- 三態狀態：預設「全部」＝混排全景；不 clearable（理由見檔頭） -->
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
