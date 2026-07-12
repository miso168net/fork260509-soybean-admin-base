<script setup lang="ts">
// [rev4 net-new MODAL-WIRING(e) 009-role-admin] policy-archive-search：授權回收桶搜尋列（來源角色 roleCode × 維度 dimension 雙濾）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。嚴格鏡像 role-search.vue 版式（含 reset 補 emit('search')）。
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

const model = defineModel<Api.SystemManage.ArchivedPolicySearchParams>('model', { required: true });

const dimensionRecord: Record<Api.SystemManage.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

const dimensionOptions = transformRecordToOption(dimensionRecord);

const defaultModel = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
  // reset 後補 emit('search')（沿 rev3 拍板、鏡像 role-search）——重置即刷新列表
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
