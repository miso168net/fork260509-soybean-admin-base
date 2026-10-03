<!-- [rev6-inline MANAGE-POLICY-ARCHIVE-VIEW+ 006-authz-governance] 授權回收桶搜尋卡（新增檔；上游基線無此路徑）——來源角色代碼（文字、等值）×維度（下拉、可清空），重設後隨即重查 -->
<script setup lang="ts">
// 骨架同 `views/manage/ip-rule/modules/ip-rule-search.vue`（NCollapse＋defineModel＋重設／搜尋兩鈕）；出處＝rev5:src/views/manage/policy-archive/modules/policy-archive-search.vue。
// 來源角色給文字欄、不給角色下拉：後端拿它與歸檔快照裡的角色代碼做等值比對，已刪或停用角色留下的歸檔列也要查得到，而角色下拉只列現役角色。
// 與 ip-rule 搜尋卡不同，重設後會接著送出搜尋：否則條件已清空、表格卻仍停在舊篩選的結果。
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

const model = defineModel<Api.Authz.ArchivedPolicyListQuery>('model', { required: true });

// 維度三值到標籤鍵的對照；頁面主檔另有一份同內容的對照——抽成共用檔就多一支 006 刀新增檔清單以外的檔（該刀出口斷言新增檔恰五支），故兩處各寫。
// 選項標籤留在模板裡翻譯（同 role-search.vue），切換語系即時跟著變。
const dimensionRecord: Record<Api.Authz.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

const dimensionOptions = transformRecordToOption(dimensionRecord);

// 掛載當下的值即「重設」要回到的狀態
const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
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
