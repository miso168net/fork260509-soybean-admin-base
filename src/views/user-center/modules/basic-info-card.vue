<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 基本资料卡（US1：userName/roles 唯讀＋gender/nick 可改＋保存；US3 加 created/updated 唯讀列） -->
<script setup lang="ts">
import { computed } from 'vue';
import { userGenderOptions } from '@/constants/business';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持、共綁；本卡編 gender/nick、顯示 US3 created/updated 唯讀列） */
  model: Api.UserCenter.ProfileModel;
}

const props = defineProps<Props>();

interface Emits {
  /** 觸發共用 handleSave（送全 model） */
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();

// 建立來源訊息（通用類別、不洩露哪個管理員；FR-013）
const createdOriginMsg = computed(() => {
  const originKey = {
    system: 'page.userCenter.origin.system',
    self: 'page.userCenter.origin.selfCreated',
    admin: 'page.userCenter.origin.adminCreated'
  } as const;
  return $t(originKey[props.model.createdBy]);
});

// rfc3339 → 可讀 `YYYY-MM-DD HH:mm:ss`（去時區尾綴、UX 顯示用）
function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '';
}
</script>

<template>
  <NCard :title="$t('page.userCenter.basicInfoTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <NForm :model="model" label-placement="left" :label-width="80">
      <NFormItem :label="$t('page.userCenter.userName')">
        <NInput :value="model.userName" disabled />
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.roles')">
        <NInput :value="model.roles.join('，')" disabled />
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.createdAt')">
        <NInput :value="`${formatDateTime(model.createdAt)}（${createdOriginMsg}）`" disabled />
      </NFormItem>
      <NFormItem v-if="model.adminUpdatedAt" :label="$t('page.userCenter.updatedAt')">
        <NInput
          :value="`${formatDateTime(model.adminUpdatedAt)}（${$t('page.userCenter.origin.adminUpdated')}）`"
          disabled
        />
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.gender')">
        <NRadioGroup v-model:value="model.userGender">
          <NRadio
            v-for="item in userGenderOptions"
            :key="item.value"
            :value="Number(item.value)"
            :label="$t(item.label)"
          />
        </NRadioGroup>
      </NFormItem>
      <NFormItem :label="$t('page.userCenter.nickName')">
        <NInput v-model:value="model.nickName" />
      </NFormItem>
      <NFormItem>
        <NButton type="primary" @click="emit('save')">{{ $t('page.userCenter.save') }}</NButton>
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped></style>
