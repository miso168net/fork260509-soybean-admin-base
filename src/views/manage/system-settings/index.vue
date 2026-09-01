<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vii)+ 008-audit-settings-pages] 系統設定管理頁（新增檔；基線
// example 無此路徑、零原行；憲法 §III.2 (vii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 內容＝資料驅動控件（伺服器回的 settingType 決定 render：二值 enum→開關、number→數字輸入、
// 其他→唯讀呈現，前端不硬編鍵→控件對應；spec FR-D01）＋四組固定序分區（密碼策略／工作階段／
// IP 源登入／帳號登入，依鍵前綴歸組、未列鍵排組尾保伺服器相對序、空組整卡不渲染；FR-D02）＋
// 逐項即改即存（開關切換即提交、數字欄失焦提交、清空不送；成功失敗皆 refetch 收斂到伺服器
// 真值；FR-D03）。
// ★頁內零按鈕碼 gating（憲法 (vii) 專屬差異②：門＝頁級 menu 維政策僅 R_SUPER＋後端端點政策；
// 判準＝ADR 0063 款三）——本頁不引 useAuth、不做任何角色分支。
// ★接**既備** rev5-settings 接線層（002／ADR 0018）、後端與接線層零改動；★直接路徑 import、
// 不經 barrel（rev4: rev4-system-settings.ts 自陳理由＝避 vite stale-export；rev5-settings.ts 檔頭同旨）。
// ★拒因（invalidValue／notFound）一律由 service/request 共用攔截層轉譯 backend.biz.systemSettings.*
// 後 toast，頁內零拒因專屬 UI；失敗路徑仍 refetch 回退畫面。
// ★本目錄下一切原始 HTML 注入用法（指令／屬性／DOM API）皆禁（機器守＝tools/view-render-guard.py，
// ★該守門逐字掃本目錄原文、不解析註解，故此處**刻意不寫出被禁字面**——寫了就自撞）；本頁所有
// 動態文字皆走 Vue 模板插值、由 Vue 逸出。
// rev4: 高度參照 rev4 之 views/manage/system-settings/index.vue（資料驅動控件、四組分區、
// labelKeyMap／helpKeyMap 16 鍵、逐項存恆 refetch）；rev5 差異＝fetchUpdateSystemSetting 改收
// 單一 req 物件（rev5 三態 description 欄——本頁不帶該欄＝不動說明、僅改值）。
import { computed, onMounted, ref } from 'vue';
import { fetchGetSystemSettings, fetchUpdateSystemSetting } from '@/service/api/rev5-settings';
import { $t } from '@/locales';

const settings = ref<Api.SystemManage.SystemSetting[]>([]);
const loading = ref(false);

/**
 * number 型 per-key 顯示界（UX 護欄；真值約束恆在後端 validation registry——spec FR-D04）。
 * 未列鍵→不設界。★鍵集與界值照 rev4 終態（FR-D04 逐字「數字欄顯示界照 rev4」）；
 * 後端 NUMBER_RANGES 另有 ip_*／session_idle_timeout／password_change_min_interval 五鍵的
 * 真值界，rev4 顯示層即未列（不設界＝交後端拒收＋refetch 回退），rev5 沿之。
 */
const numberRanges: Record<string, { min?: number; max?: number }> = {
  password_min_length: { min: 1, max: 128 },
  password_max_length: { min: 1, max: 256 },
  login_throttle_max_fails: { min: 1, max: 100 },
  login_throttle_window_minutes: { min: 1, max: 1440 },
  login_throttle_captcha_after: { min: 1, max: 100 }
};

/** 密碼策略區固定序（語意由弱到強、覆蓋伺服器字母序）。未列 password_* 鍵排組尾、保伺服器相對序。 */
const PASSWORD_KEY_ORDER = [
  'password_min_length',
  'password_max_length',
  'password_require_lowercase',
  'password_require_uppercase',
  'password_require_digit',
  'password_require_special',
  'password_forbid_username',
  'password_change_min_interval'
];

/** 工作階段區固定序（單一在線→閒置逾時）。 */
const SESSION_KEY_ORDER = ['single_session_default', 'session_idle_timeout'];
/** IP 源登入區固定序（窗口→上限→驗證碼）。 */
const IP_KEY_ORDER = ['ip_window_minutes', 'ip_max_fails', 'ip_captcha_after'];
/** 帳號登入區固定序（窗口→上限→驗證碼）。 */
const ACCOUNT_KEY_ORDER = ['login_throttle_window_minutes', 'login_throttle_max_fails', 'login_throttle_captcha_after'];

/**
 * settingKey → i18n label 鍵（typed literal——每值必須是既存 I18nKey、typecheck 機器驗；
 * 16 鍵集＝後端 SEED_EXPECTED 逐鍵對齊）。未映射新鍵 fallback description（spec FR-D04）。
 */
const labelKeyMap: Record<string, App.I18n.I18nKey> = {
  password_min_length: 'page.manage.systemSettings.items.passwordMinLength',
  password_max_length: 'page.manage.systemSettings.items.passwordMaxLength',
  password_require_lowercase: 'page.manage.systemSettings.items.passwordRequireLowercase',
  password_require_uppercase: 'page.manage.systemSettings.items.passwordRequireUppercase',
  password_require_digit: 'page.manage.systemSettings.items.passwordRequireDigit',
  password_require_special: 'page.manage.systemSettings.items.passwordRequireSpecial',
  password_forbid_username: 'page.manage.systemSettings.items.passwordForbidUsername',
  password_change_min_interval: 'page.manage.systemSettings.items.passwordChangeMinInterval',
  single_session_default: 'page.manage.systemSettings.items.singleSessionDefault',
  session_idle_timeout: 'page.manage.systemSettings.items.sessionIdleTimeout',
  ip_window_minutes: 'page.manage.systemSettings.items.ipWindowMinutes',
  ip_max_fails: 'page.manage.systemSettings.items.ipMaxFails',
  ip_captcha_after: 'page.manage.systemSettings.items.ipCaptchaAfter',
  login_throttle_window_minutes: 'page.manage.systemSettings.items.loginThrottleWindowMinutes',
  login_throttle_max_fails: 'page.manage.systemSettings.items.loginThrottleMaxFails',
  login_throttle_captcha_after: 'page.manage.systemSettings.items.loginThrottleCaptchaAfter'
};

/** label 文案：有映射走 $t、未映射 fallback 後端 description、再無則裸鍵（頁面不壞——spec 邊界案）。 */
function labelOf(item: Api.SystemManage.SystemSetting) {
  const key = labelKeyMap[item.settingKey];
  return key ? $t(key) : item.description || item.settingKey;
}

/** settingKey → i18n help 鍵（tooltip 說明；typed literal 同 labelKeyMap、16 鍵集同源對齊）。 */
const helpKeyMap: Record<string, App.I18n.I18nKey> = {
  password_min_length: 'page.manage.systemSettings.help.passwordMinLength',
  password_max_length: 'page.manage.systemSettings.help.passwordMaxLength',
  password_require_lowercase: 'page.manage.systemSettings.help.passwordRequireLowercase',
  password_require_uppercase: 'page.manage.systemSettings.help.passwordRequireUppercase',
  password_require_digit: 'page.manage.systemSettings.help.passwordRequireDigit',
  password_require_special: 'page.manage.systemSettings.help.passwordRequireSpecial',
  password_forbid_username: 'page.manage.systemSettings.help.passwordForbidUsername',
  password_change_min_interval: 'page.manage.systemSettings.help.passwordChangeMinInterval',
  single_session_default: 'page.manage.systemSettings.help.singleSessionDefault',
  session_idle_timeout: 'page.manage.systemSettings.help.sessionIdleTimeout',
  ip_window_minutes: 'page.manage.systemSettings.help.ipWindowMinutes',
  ip_max_fails: 'page.manage.systemSettings.help.ipMaxFails',
  ip_captcha_after: 'page.manage.systemSettings.help.ipCaptchaAfter',
  login_throttle_window_minutes: 'page.manage.systemSettings.help.loginThrottleWindowMinutes',
  login_throttle_max_fails: 'page.manage.systemSettings.help.loginThrottleMaxFails',
  login_throttle_captcha_after: 'page.manage.systemSettings.help.loginThrottleCaptchaAfter'
};

/** tooltip 文案：有映射走 $t、未映射 fallback description（新鍵未鍵化時 tooltip 不消失）、皆無回空字串（不渲染）。 */
function helpOf(item: Api.SystemManage.SystemSetting) {
  const key = helpKeyMap[item.settingKey];
  return key ? $t(key) : item.description || '';
}

/**
 * 依固定序穩定排序：未列鍵 rank＝order.length、排組尾並保伺服器相對序
 * （Array.prototype.sort 自 ES2019 起保證穩定）。不改動入參陣列。
 */
function sortByFixedOrder(items: Api.SystemManage.SystemSetting[], order: string[]) {
  const rankOf = (key: string) => {
    const idx = order.indexOf(key);
    return idx === -1 ? order.length : idx;
  };
  return items.slice().sort((a, b) => rankOf(a.settingKey) - rankOf(b.settingKey));
}

/**
 * 依 settingKey 前綴分四組（spec FR-D02 固定序）：password_*＝密碼策略／ip_*＝IP 源登入／
 * login_throttle_*＝帳號登入／其餘＝工作階段（無前綴不匹配的新鍵落此組組尾、不會憑空消失）。
 * 空組整卡不渲染。
 */
const groups = computed(() => {
  const isPassword = (key: string) => key.startsWith('password_');
  const isIp = (key: string) => key.startsWith('ip_');
  const isAccount = (key: string) => key.startsWith('login_throttle_');
  const isSession = (key: string) => !isPassword(key) && !isIp(key) && !isAccount(key);
  const result: Array<{ titleKey: App.I18n.I18nKey; items: Api.SystemManage.SystemSetting[] }> = [
    {
      titleKey: 'page.manage.systemSettings.passwordPolicyTitle',
      items: sortByFixedOrder(settings.value.filter(s => isPassword(s.settingKey)), PASSWORD_KEY_ORDER)
    },
    {
      titleKey: 'page.manage.systemSettings.sessionTitle',
      items: sortByFixedOrder(settings.value.filter(s => isSession(s.settingKey)), SESSION_KEY_ORDER)
    },
    {
      titleKey: 'page.manage.systemSettings.ipLoginTitle',
      items: sortByFixedOrder(settings.value.filter(s => isIp(s.settingKey)), IP_KEY_ORDER)
    },
    {
      titleKey: 'page.manage.systemSettings.accountLoginTitle',
      items: sortByFixedOrder(settings.value.filter(s => isAccount(s.settingKey)), ACCOUNT_KEY_ORDER)
    }
  ];
  return result.filter(g => g.items.length > 0);
});

/** 解析二值 enum 型（"enum:on,off" → ['on','off']、第 0 位＝開啟值）；非恰二值的 enum／非 enum 回 null→唯讀降級。 */
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

/**
 * 提交後恆 refetch 伺服器真值（spec FR-D03：成功失敗皆回讀、畫面永遠顯示伺服器現值）：
 * 成功彈 toast、失敗由攔截層轉譯彈窗，兩路皆收斂。
 * rev5 差異：req 物件形、description 欄不帶＝不動說明（三態約定——rev5-settings.d.ts）。
 */
async function submitAndRefetch(settingKey: string, settingValue: string) {
  const { error } = await fetchUpdateSystemSetting({ settingKey, settingValue });
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
  }
  await getSettings();
}

/** 開關切換→送二值 enum 對應值→refetch。 */
async function handleToggle(item: Api.SystemManage.SystemSetting, checked: boolean) {
  const pair = parseEnumValues(item.settingType);
  if (!pair) return;
  const [onValue, offValue] = pair;
  await submitAndRefetch(item.settingKey, checked ? onValue : offValue);
}

/** 數字欄失焦／Enter 提交→refetch；清空（null）不送更新、僅 refetch 把受控值回退到伺服器現值（FR-D03）。 */
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
                  <IconTooltip v-if="helpOf(item)" :desc="helpOf(item)" />
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
