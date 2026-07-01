<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 基本资料卡（US1：userName/roles 唯讀＋gender/nick 可改＋保存；US3 加 created/updated 唯讀列） -->
<script setup lang="ts">
import { userGenderOptions } from '@/constants/business';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持、共綁；本卡編 gender/nick） */
  model: Api.UserCenter.ProfileModel;
}

defineProps<Props>();

interface Emits {
  /** 觸發共用 handleSave（送全 model） */
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();
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
