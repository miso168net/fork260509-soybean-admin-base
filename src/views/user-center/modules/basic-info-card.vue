<!-- BASE-WEB-MODAL-WIRING(g) (014-user-center)：net-new 基本資料卡——rev3 025 藍本逐項復刻（帳號/角色/建立/修改
  時間唯讀 .uc-readonly 純文字＋三態後綴＋「未修改」＋暱稱 input/性別 radio 可編）；儲存只送 {userGender, nickName}
  兩欄（部分更新、FR-008）；憲法 §III.2(g) 授權。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchUpdateProfile } from '@/service/api/rev4-user-center';
import { userGenderOptions } from '@/constants/business';
import { $t } from '@/locales';

defineOptions({
  name: 'BasicInfoCard'
});

interface Props {
  /** 個人中心 canonical model（index.vue 持有、三卡 prop 共綁；本卡編 userGender/nickName、唯讀顯示帳號/角色/建立/修改時間） */
  model: Api.UserCenter.ProfileRes;
}

const props = defineProps<Props>();

interface Emits {
  /** 儲存成功後通知 index.vue 重拉 getProfile（無酬載單事件形照 rev3；rev4 卡內自呼 fetch、事件語意＝已存妥） */
  (e: 'saved'): void;
}

const emit = defineEmits<Emits>();

/** RFC3339（帶 offset）→ 顯示形 `YYYY-MM-DD HH:mm:ss`（去 T 分隔與時區尾綴、UX 顯示用） */
function formatDateTime(value: string | null) {
  if (!value) {
    return '';
  }
  return value.replace('T', ' ').slice(0, 19);
}

// 建立時間三態後綴（classify_operator 折疊值、data-model §3.1）：system→（系統建立）、admin→（管理員建立）、
// self／null→僅時間無後綴——通用類別、不洩漏操作者身分（FR-009）。
const createdText = computed(() => {
  const ts = formatDateTime(props.model.createdAt);
  switch (props.model.createdByType) {
    case 'system':
      return `${ts}（${$t('page.userCenter.origin.systemCreated')}）`;
    case 'admin':
      return `${ts}（${$t('page.userCenter.origin.adminCreated')}）`;
    default:
      return ts; // self：本人操作不標註
  }
});

// 修改時間：updatedAt null→「未修改」（一律顯示、不隱藏行）；其餘同建立時間三態後綴形。
const updatedText = computed(() => {
  if (!props.model.updatedAt) {
    return $t('page.userCenter.notModified');
  }
  const ts = formatDateTime(props.model.updatedAt);
  switch (props.model.updatedByType) {
    case 'system':
      return `${ts}（${$t('page.userCenter.origin.systemUpdated')}）`;
    case 'admin':
      return `${ts}（${$t('page.userCenter.origin.adminUpdated')}）`;
    default:
      return ts; // self：本人操作不標註
  }
});

async function handleSave() {
  // 部分更新（FR-008）只送本卡兩欄：nickName 恆送（null 防禦性 coalesce ''、清欄回 NULL 不做）；
  // userGender 可空（radio 未選＝null）→缺欄不送、後端 Unchanged 不動既有值。
  const { error } = await fetchUpdateProfile({
    nickName: props.model.nickName ?? '',
    userGender: props.model.userGender ?? undefined
  });
  if (!error) {
    // 成功 toast 沿 common.updateSuccess（D3 專屬鍵僅屬改密卡）；顯示值刷新由父層重拉承接。
    window.$message?.success($t('common.updateSuccess'));
    emit('saved');
  }
}
</script>

<template>
  <NCard :title="$t('page.userCenter.basicInfoTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <template #header-extra>
      <NButton type="primary" size="small" @click="handleSave">{{ $t('page.userCenter.save') }}</NButton>
    </template>
    <!-- canonical model 由 index.vue 持有、可編欄直接雙向綁定（rev3 資料流：三卡 prop 共綁單一真相）；本卡無格式 rules 不掛 formRef -->
    <NForm :model="model" label-placement="left" :label-width="76">
      <NGrid cols="1 s:2" responsive="screen" :x-gap="24">
        <NGi>
          <NFormItem :label="$t('page.userCenter.userName')">
            <span class="uc-readonly">{{ model.userName }}</span>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.userCenter.roles')">
            <!-- 角色＝role code 陣列、全形逗號 join 展示（rev3 藍本形） -->
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
            <!-- 性別 radio 可空；value 直用 '1'|'2' 字串（rev4 wire_enum12 字面、不照抄 rev3 Number() 轉型） -->
            <NRadioGroup v-model:value="model.userGender">
              <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
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
/* 唯讀純文字（非 disabled input 的淺灰）：一般文字色、與 form control 高度對齊（rev3 藍本 .uc-readonly 形） */
.uc-readonly {
  line-height: 34px;
  color: var(--n-text-color, rgb(51 54 57));
}
</style>
