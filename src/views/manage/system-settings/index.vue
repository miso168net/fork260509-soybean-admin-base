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

/** 密碼策略區顯示順序（固定、語意由弱到強；覆蓋 server 字母序）。未列 password_* 鍵排最後、保 server 相對序。 */
const PASSWORD_KEY_ORDER = [
  'password_min_length',
  'password_max_length',
  'password_require_lowercase',
  'password_require_uppercase',
  'password_require_digit',
  'password_require_special',
  'password_forbid_username'
];

/** settingKey → i18n label 鍵（typed literal、typecheck 驗每鍵存在）。未映射鍵 fallback item.description || settingKey。 */
const labelKeyMap: Record<string, App.I18n.I18nKey> = {
  password_min_length: 'page.manage.systemSettings.items.passwordMinLength',
  password_max_length: 'page.manage.systemSettings.items.passwordMaxLength',
  password_require_lowercase: 'page.manage.systemSettings.items.passwordRequireLowercase',
  password_require_uppercase: 'page.manage.systemSettings.items.passwordRequireUppercase',
  password_require_digit: 'page.manage.systemSettings.items.passwordRequireDigit',
  password_require_special: 'page.manage.systemSettings.items.passwordRequireSpecial',
  password_forbid_username: 'page.manage.systemSettings.items.passwordForbidUsername',
  single_session_default: 'page.manage.systemSettings.items.singleSessionDefault'
};

function labelOf(item: Api.SystemManage.SystemSetting) {
  const key = labelKeyMap[item.settingKey];
  return key ? $t(key) : item.description || item.settingKey;
}

/** 依固定順序穩定排序：未列鍵 rank＝order.length、排最後並保 server 相對序（Array.sort ES2019 起穩定）。不 mutate 入參。 */
function sortByFixedOrder(items: Api.SystemManage.SystemSetting[], order: string[]) {
  const rankOf = (key: string) => {
    const idx = order.indexOf(key);
    return idx === -1 ? order.length : idx;
  };
  return items.slice().sort((a, b) => rankOf(a.settingKey) - rankOf(b.settingKey));
}

/** 依 settingKey 前綴分區：password_* → 密碼策略（固定序）、其餘 → 會話設定（保 server 回傳順序）。空區塊自動略過。 */
const groups = computed(() => {
  const isPassword = (key: string) => key.startsWith('password_');
  const result: Array<{ titleKey: App.I18n.I18nKey; items: Api.SystemManage.SystemSetting[] }> = [
    {
      titleKey: 'page.manage.systemSettings.passwordPolicyTitle',
      items: sortByFixedOrder(
        settings.value.filter(s => isPassword(s.settingKey)),
        PASSWORD_KEY_ORDER
      )
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
                <div class="flex items-center gap-4px">
                  <span class="text-14px">{{ labelOf(item) }}</span>
                  <IconTooltip v-if="item.description" :desc="item.description" />
                </div>
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
