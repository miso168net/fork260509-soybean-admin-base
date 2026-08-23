<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance] 授權回收桶搜尋卡（新增檔；基線 example 無此路徑、零原行）。
// 兩維＝`roleCode` 來源角色代碼**等值**（比對 casbin `v0`、空字串後端忽略）＋`dimension` 維度等值（可清空）。
// ★reset 後補 `emit('search')`：重置即刷新清單——否則畫面上條件已清、表格卻仍是舊濾的結果。
// 形照本 repo `views/manage/ip-rule/modules/ip-rule-search.vue`（NCollapse＋defineModel＋reset/search 兩鈕）。
// rev4: 高度參照 rev4 之 policy-archive-search.vue 的雙維組成；rev5 差異＝型別取 `Api.PolicyArchive.*`
// 獨立命名空間（非 `Api.SystemManage`）。
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { transformRecordToOption, translateOptions } from '@/utils/common';
import { $t } from '@/locales';

defineOptions({
  name: 'PolicyArchiveSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.PolicyArchive.ArchivedPolicyListQuery>('model', { required: true });

// 維度三值各掛一鍵（本頁 index.vue 另有同名同內容一份——照 rev4 兩處各寫、不為三行抽新檔）；
// 下拉選項於模板以 `translateOptions` 翻譯（沿 role-search.vue 形，語系切換即時反映）
const dimensionRecord: Record<Api.PolicyArchive.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

const dimensionOptions = transformRecordToOption(dimensionRecord);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
  // 重置即刷新（理由見檔頭）
  emit('search');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['policy-archive-search']">
      <NCollapseItem :title="$t('common.search')" name="policy-archive-search">
        <NForm :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.policyArchive.sourceRole')"
              path="roleCode"
              class="pr-24px"
            >
              <NInput v-model:value="model.roleCode" :placeholder="$t('page.manage.policyArchive.form.sourceRole')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.policyArchive.dimension')"
              path="dimension"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.dimension"
                :placeholder="$t('page.manage.policyArchive.form.dimension')"
                :options="translateOptions(dimensionOptions)"
                clearable
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
