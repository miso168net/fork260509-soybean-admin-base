<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 基本资料塊：账号/角色/创建时间/修改时间 唯讀純文字（非輸入框、不送 api）＋昵称/性别 可編；header 保存只送 gender/nick（部分更新） -->
<script setup lang="ts">
import { computed } from 'vue';
import { userGenderOptions } from '@/constants/business';
import { $t } from '@/locales';

interface Props {
  /** 個人中心 canonical model（index.vue 持；本塊編 gender/nick、唯讀顯示 账号/角色/创建/修改时间） */
  model: Api.UserCenter.ProfileModel;
}

const props = defineProps<Props>();

interface Emits {
  /** 觸發 index.vue saveBasic（部分更新：只送 userGender/nickName） */
  (e: 'save'): void;
}

const emit = defineEmits<Emits>();

// rfc3339 → 可讀 `YYYY-MM-DD HH:mm:ss`（去時區尾綴、UX 顯示用）
function formatDateTime(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : '';
}

// 创建时间：self→只顯示時間（無標註）；system→（系统创建）；admin→（管理员创建）。通用類別、不洩露哪個管理員（FR-013）
const createdText = computed(() => {
  const ts = formatDateTime(props.model.createdAt);
  switch (props.model.createdBy) {
    case 'system':
      return `${ts}（${$t('page.userCenter.origin.systemCreated')}）`;
    case 'admin':
      return `${ts}（${$t('page.userCenter.origin.adminCreated')}）`;
    default:
      return ts; // self：不標註
  }
});

// 修改时间：updatedAt null→「未修改」（一律顯示、不隱藏行）；self→只顯示時間；system→（系统修改）；admin→（管理员修改）
const updatedText = computed(() => {
  if (!props.model.updatedAt) return $t('page.userCenter.notModified');
  const ts = formatDateTime(props.model.updatedAt);
  switch (props.model.updatedBy) {
    case 'system':
      return `${ts}（${$t('page.userCenter.origin.systemUpdated')}）`;
    case 'admin':
      return `${ts}（${$t('page.userCenter.origin.adminUpdated')}）`;
    default:
      return ts; // self：不標註
  }
});
</script>

<template>
  <NCard :title="$t('page.userCenter.basicInfoTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="emit('save')">{{ $t('page.userCenter.save') }}</NButton>
    </template>
    <NForm :model="model" label-placement="left" :label-width="76">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.userName')">
            <span class="uc-readonly">{{ model.userName }}</span>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.roles')">
            <span class="uc-readonly">{{ model.roles.join('，') }}</span>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.nickName')">
            <NInput v-model:value="model.nickName" />
          </NFormItem>
        </NGi>
        <NGi>
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
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.createdAt')">
            <span class="uc-readonly">{{ createdText }}</span>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.updatedAt')">
            <span class="uc-readonly">{{ updatedText }}</span>
          </NFormItem>
        </NGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped>
/* 唯讀純文字：用一般文字色（非 disabled input 的淺灰）、與 form control 高度對齊 */
.uc-readonly {
  line-height: 34px;
  color: var(--n-text-color, rgb(51 54 57));
}
</style>
