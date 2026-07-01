<!-- [rev3-inline MODAL-WIRING(e) §III.2 008-system-settings ★] 系統設定 KV 頁（static、不套分頁/drawer；波1 打樣） -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetSystemSettings, fetchUpdateSystemSetting } from '@/service/api/rev3-system-settings';
import { $t } from '@/locales';

const settings = ref<Api.SystemManage.SystemSetting[]>([]);
const loading = ref(false);

/** 解析 "enum:on,off" → ['on', 'off']；非 enum 型回 null */
function parseEnumValues(valueType: string): [string, string] | null {
  const [kind, rest] = valueType.split(':');
  if (kind !== 'enum' || !rest) return null;
  const values = rest.split(',');
  if (values.length !== 2) return null;
  return [values[0], values[1]];
}

async function getSettings() {
  loading.value = true;
  const { data, error } = await fetchGetSystemSettings();
  if (!error && data) {
    settings.value = data;
  }
  loading.value = false;
}

/** NSwitch toggle → update → toast + refetch（保持與 server 真值一致） */
async function handleToggle(item: Api.SystemManage.SystemSetting, checked: boolean) {
  const pair = parseEnumValues(item.valueType);
  if (!pair) return;
  const [onValue, offValue] = pair;
  const newValue = checked ? onValue : offValue;
  const { error } = await fetchUpdateSystemSetting(item.settingKey, newValue);
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
  }
  // 成功或失敗（失敗已由攔截器彈 modal）都 refetch，回到 server 真值
  await getSettings();
}

/** NInputNumber 提交 → update → toast + refetch（鏡像 handleToggle；value 為 null（清空）則忽略） */
async function handleNumberUpdate(item: Api.SystemManage.SystemSetting, value: number | null) {
  // 清空欄位（value=null）：不送更新，但 refetch 讓受控 NInputNumber 顯示回退到 server 真值（對齊 handleToggle 恆 refetch 語意）
  if (value === null) {
    await getSettings();
    return;
  }
  const { error } = await fetchUpdateSystemSetting(item.settingKey, String(value));
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
  }
  // 成功或失敗（失敗已由攔截器彈 modal）都 refetch，回到 server 真值
  await getSettings();
}

onMounted(getSettings);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.systemSettings.title')" :bordered="false" size="small" class="card-wrapper">
      <NSpin :show="loading">
        <NEmpty v-if="!loading && settings.length === 0" class="py-32px" />
        <NSpace v-else vertical :size="16">
          <NCard v-for="item in settings" :key="item.settingKey" size="small" embedded :bordered="false">
            <div class="flex items-center justify-between gap-16px">
              <div class="flex-col gap-4px">
                <span class="font-medium">{{ item.settingKey }}</span>
                <span v-if="item.description" class="text-12px text-gray-400">{{ item.description }}</span>
              </div>
              <div class="flex items-center gap-8px">
                <template v-if="parseEnumValues(item.valueType)">
                  <NSwitch
                    :value="item.settingValue === parseEnumValues(item.valueType)![0]"
                    @update:value="(checked: boolean) => handleToggle(item, checked)"
                  />
                </template>
                <!-- [rev3-inline MODAL-WIRING(e)+] number 型設定可編輯控件；upstream 衝突風險 nil（rev3 自撰檔）-->
                <template v-else-if="item.valueType === 'number'">
                  <NInputNumber
                    :value="Number(item.settingValue)"
                    :min="1"
                    :max="1024"
                    :step="1"
                    :precision="0"
                    :update-value-on-input="false"
                    class="w-160px"
                    @update:value="(v: number | null) => handleNumberUpdate(item, v)"
                  />
                </template>
                <span v-else>{{ item.settingValue }}</span>
              </div>
            </div>
          </NCard>
        </NSpace>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped></style>
