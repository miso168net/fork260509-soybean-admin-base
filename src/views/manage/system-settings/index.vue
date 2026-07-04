<!-- MODAL-WIRING(e) §III.2 (004-system-settings)：系統設定 KV 頁（static、super-only、標準 manage 頁形） -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchGetSystemSettings, fetchUpdateSystemSetting } from '@/service/api/rev4-system-settings';
import { $t } from '@/locales';

const settings = ref<Api.SystemManage.SystemSetting[]>([]);
const loading = ref(false);

/** number 型 per-key 顯示界（UX 護欄；真值約束由後端型驗 registry 把關）。未列鍵→不設界。 */
const numberRanges: Record<string, { min?: number; max?: number }> = {
  password_min_length: { min: 1, max: 128 },
  password_max_length: { min: 1, max: 256 }
};

/** 依 settingKey 前綴分區：password_* → 密碼策略、其餘 → 會話設定（空區塊自動略過、保 server 回傳順序） */
const groups = computed(() => {
  const isPassword = (key: string) => key.startsWith('password_');
  const result: Array<{ titleKey: App.I18n.I18nKey; items: Api.SystemManage.SystemSetting[] }> = [
    {
      titleKey: 'page.manage.systemSettings.passwordPolicyTitle',
      items: settings.value.filter(s => isPassword(s.settingKey))
    },
    {
      titleKey: 'page.manage.systemSettings.sessionTitle',
      items: settings.value.filter(s => !isPassword(s.settingKey))
    }
  ];
  return result.filter(g => g.items.length > 0);
});

/** 解析 "enum:on,off" → ['on', 'off']（第 0 位＝開啟值）；非二元 enum 型回 null */
function parseEnumValues(settingType: string): [string, string] | null {
  const [kind, rest] = settingType.split(':');
  if (kind !== 'enum' || !rest) return null;
  const values = rest.split(',');
  if (values.length !== 2) return null;
  return [values[0], values[1]];
}

function rangeOf(settingKey: string) {
  return numberRanges[settingKey] ?? {};
}

async function getSettings() {
  loading.value = true;
  const { data, error } = await fetchGetSystemSettings();
  if (!error && data) {
    settings.value = data;
  }
  loading.value = false;
}

/** 提交後恆 refetch server 真值：成功彈 toast，失敗由攔截器彈 modal，兩路皆回 server 真值 */
async function submitAndRefetch(settingKey: string, settingValue: string) {
  const { error } = await fetchUpdateSystemSetting(settingKey, settingValue);
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
  }
  await getSettings();
}

/** NSwitch 切換 → 送 on/off 值 → refetch */
async function handleToggle(item: Api.SystemManage.SystemSetting, checked: boolean) {
  const pair = parseEnumValues(item.settingType);
  if (!pair) return;
  const [onValue, offValue] = pair;
  await submitAndRefetch(item.settingKey, checked ? onValue : offValue);
}

/** NInputNumber 失焦提交 → refetch；清空（null）不送更新、僅 refetch 回退受控值到 server 真值 */
async function handleNumberUpdate(item: Api.SystemManage.SystemSetting, value: number | null) {
  if (value === null) {
    await getSettings();
    return;
  }
  await submitAndRefetch(item.settingKey, String(value));
}

onMounted(getSettings);
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <NSpin :show="loading">
      <NEmpty v-if="!loading && settings.length === 0" class="py-32px" />
      <NSpace v-else vertical :size="16">
        <NCard
          v-for="group in groups"
          :key="group.titleKey"
          :title="$t(group.titleKey)"
          :bordered="false"
          size="small"
          segmented
          class="card-wrapper"
        >
          <NGrid cols="1 s:2" :x-gap="24" :y-gap="16" responsive="screen">
            <NGi v-for="item in group.items" :key="item.settingKey">
              <div class="flex items-center justify-between gap-12px">
                <span class="text-14px">{{ item.description || item.settingKey }}</span>
                <template v-if="parseEnumValues(item.settingType)">
                  <NSwitch
                    :value="item.settingValue === parseEnumValues(item.settingType)![0]"
                    @update:value="(checked: boolean) => handleToggle(item, checked)"
                  />
                </template>
                <template v-else-if="item.settingType === 'number'">
                  <NInputNumber
                    :value="Number(item.settingValue)"
                    :min="rangeOf(item.settingKey).min"
                    :max="rangeOf(item.settingKey).max"
                    :step="1"
                    :precision="0"
                    :update-value-on-input="false"
                    class="w-140px"
                    @update:value="(v: number | null) => handleNumberUpdate(item, v)"
                  />
                </template>
                <span v-else>{{ item.settingValue }}</span>
              </div>
            </NGi>
          </NGrid>
        </NCard>
      </NSpace>
    </NSpin>
  </div>
</template>

<style scoped></style>
