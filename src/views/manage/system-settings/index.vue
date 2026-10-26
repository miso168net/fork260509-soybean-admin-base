<!-- [rev6-inline MANAGE-SYSTEM-SETTINGS-VIEW+ 008-audit-settings-pages] 系統設定頁主檔（新增檔；上游基線無此路徑）——四組設定卡、逐項即改即存 -->
<script setup lang="ts">
// 不變式（ADR-00106 決定 1～7；出處＝rev5:src/views/manage/system-settings/index.vue）：
// · 資料驅動：控件只依伺服器回之 `settingType` 與 `declared` 決定、零鍵→控件對應——二值 enum（`enum:` 後恰兩值、首值＝開）→開關，
//   `number`→數字框，其餘型別→唯讀文字；宣告集外列（`declared === false`）一律唯讀並加唯讀標示（寫回必得 2222＝ADR-00057）。
// · 四組固定序（密碼策略／工作階段／IP 源登入／帳號登入）：依鍵前綴歸組（`password_`／`ip_`／`login_throttle_`，其餘歸工作階段）、
//   組內依固定鍵序；未列序之宣告鍵排組尾、宣告集外列再排其後，同名次保伺服器相對序；空組整卡不渲染。
// · 數字框之上下界只取讀端下發之 `rangeMin`／`rangeMax`（界值單一權威＝後端登記表、ADR-00054）：前端零手抄界值。
// · 逐項即改即存：開關切換即送；數字框於失焦、Enter、步進鈕（含按住連發）或上下方向鍵時發值，輸入中不發（`update-value-on-input` 關）——
//   發出之數值皆在界內（失焦與 Enter 把越界值改為界值、步進結果越界即不動作）、值未變不發、清空發 null（不送、只回讀）。
//   成敗皆回讀全列；拒因由共用請求層轉譯提示，本頁只看 `error` 有無。
// · 三對矛盾（兩現值皆可解析為有限數時之嚴格不等式、相等合法）即時警示於該對所屬之組卡片、不擋存檔；後端照舊逐鍵驗（ADR-00079 決定 2）。
// · 寫入政策七鍵任一成功即清同分頁之密碼政策快取；寫入失敗與七鍵以外之鍵不清。
// · 頁內零按鈕級 gating：設定兩端點屬封死集、門＝頁級選單維授權（ADR-00106 決定 4）；被授選單可見性之非超管讀取得 5003＝請求層提示＋空頁。
// · 動態文字一律模板插值、由 Vue 逸出。本目錄禁用任何原始 HTML 注入寫法（機器守＝tools/view-render-guard.py；該守門逐字掃原文、
//   不分註解與碼，故此處不寫出被禁的字面）。
// rev6 差異：界值改取讀端下發（rev5 手抄五鍵之顯示界表不帶回）；宣告集外列唯讀；矛盾提示與政策快取清除為 rev6 新增；label／help 之鍵路徑
// 以固定序常數之鍵型組出（rev5 另立兩份 16 鍵映射表）；讀取只採最後一發之回應；數字框於送出被拒或清空之回讀後重掛（見 `numberRemounts`）。
import { computed, onMounted, ref } from 'vue';
// 包裝以直接路徑匯入：WRAPPER 軌道新檔不入 `service/api/index.ts` 之 barrel
import { fetchGetSystemSettings, fetchUpdateSystemSetting } from '@/service/api/rev6-settings';
import { clearPwdPolicyCache } from '@/hooks/business/pwd-policy';
import { $t } from '@/locales';

/** 密碼策略組固定序（rev5 同序：長度上下界→四類字元→禁同帳號→設密冷卻） */
const PASSWORD_KEY_ORDER = [
  'password_min_length',
  'password_max_length',
  'password_require_lowercase',
  'password_require_uppercase',
  'password_require_digit',
  'password_require_special',
  'password_forbid_username',
  'password_change_min_interval'
] as const;
/** 工作階段組固定序（單一工作階段→閒置逾時） */
const SESSION_KEY_ORDER = ['single_session_default', 'session_idle_timeout'] as const;
/** IP 源登入組固定序（窗長→鎖定門檻→驗證碼門檻） */
const IP_KEY_ORDER = ['ip_window_minutes', 'ip_max_fails', 'ip_captcha_after'] as const;
/** 帳號登入組固定序（同 IP 源登入組） */
const ACCOUNT_KEY_ORDER = [
  'login_throttle_window_minutes',
  'login_throttle_max_fails',
  'login_throttle_captcha_after'
] as const;

/** 有譯文之設定鍵＝四組固定序之聯集：label／help 之鍵路徑以本型組出、受 `$t` 鍵型檢查（型節缺任一鍵即型別檢查紅） */
type SettingKey =
  | (typeof PASSWORD_KEY_ORDER)[number]
  | (typeof SESSION_KEY_ORDER)[number]
  | (typeof IP_KEY_ORDER)[number]
  | (typeof ACCOUNT_KEY_ORDER)[number];

const TRANSLATED_KEYS: ReadonlySet<string> = new Set<string>([
  ...PASSWORD_KEY_ORDER,
  ...SESSION_KEY_ORDER,
  ...IP_KEY_ORDER,
  ...ACCOUNT_KEY_ORDER
]);

function isTranslatedKey(key: string): key is SettingKey {
  return TRANSLATED_KEYS.has(key);
}

/**
 * 密碼政策七鍵（真源＝rust-api `server/src/model/password.rs` 之 `POLICY_KEYS`；設密冷卻 `password_change_min_interval` 不屬之）：
 * 寫入任一成功即清政策快取
 */
const PWD_POLICY_KEYS: ReadonlySet<string> = new Set([
  'password_min_length',
  'password_max_length',
  'password_require_digit',
  'password_require_lowercase',
  'password_require_uppercase',
  'password_require_special',
  'password_forbid_username'
]);

type GroupId = 'password' | 'session' | 'ip' | 'account';

interface SettingGroup {
  id: GroupId;
  titleKey: App.I18n.I18nKey;
  /** 該組矛盾成立時之提示鍵；不成立或該組無矛盾判準＝null */
  conflictKey: App.I18n.I18nKey | null;
  items: Api.SystemManage.SystemSetting[];
}

const settings = ref<Api.SystemManage.SystemSetting[]>([]);
const loading = ref(false);

/** 讀取序號：每發一次讀取即遞增；回應落定時已有更晚之讀取發出即丟棄本回應（連續提交時後發先至之舊回讀不覆蓋新回讀＝回讀收斂） */
let readSeq = 0;

/**
 * 數字框重掛序號（逐鍵）：該鍵送出被拒或清空後之回讀落定即遞增、併入該框之 key 使其重掛。naive-ui 2.44.1 數字框之框內字串於受控值變動時重算，
 * 失焦路徑另於失焦收尾以受控值重算（被拒或清空即自行回退）；Enter、步進鈕與上下方向鍵三路徑發值後不重算——被拒或清空而回讀值未變時，
 * 框內停在使用者輸入之字串（Enter 形＝rev5:B-164 實測）。重掛後框內字串取自受控值（＝最近一次採用之讀取結果）。
 * 送出成功不重掛：送出值異於發值當下之受控值（值未變不發），回讀採用後框內字串隨受控值重算；且重掛會換掉仍在作用之實例——
 * 其按住連發計時器只於放開滑鼠、再次按下或步進越界時清除（卸載不清）、卸載後以凍結之值續發，Enter 與上下方向鍵發值後輸入框仍保有焦點
 */
const numberRemounts = ref<Record<string, number>>({});

/** 依鍵前綴歸組；前綴皆不符之鍵歸工作階段組（排組尾、不會消失） */
function groupOf(settingKey: string): GroupId {
  if (settingKey.startsWith('password_')) {
    return 'password';
  }
  if (settingKey.startsWith('ip_')) {
    return 'ip';
  }
  if (settingKey.startsWith('login_throttle_')) {
    return 'account';
  }
  return 'session';
}

/**
 * 依固定序穩定排序：名次＝固定序之位；未列序之宣告鍵＝序長、宣告集外列＝序長＋1，同名次保伺服器相對序
 * （`Array.prototype.sort` 自 ES2019 起保證穩定）。不改動入參陣列。
 */
function sortByFixedOrder(items: Api.SystemManage.SystemSetting[], order: readonly string[]) {
  const rankOf = (item: Api.SystemManage.SystemSetting) => {
    if (!item.declared) {
      return order.length + 1;
    }
    const index = order.indexOf(item.settingKey);
    return index === -1 ? order.length : index;
  };
  return items.slice().sort((a, b) => rankOf(a) - rankOf(b));
}

/** 某鍵現值之數值；列缺席或值不可解析為有限數＝null */
function numericValueOf(settingKey: SettingKey) {
  const row = settings.value.find(item => item.settingKey === settingKey);
  if (!row || row.settingValue.trim() === '') {
    return null;
  }
  const value = Number(row.settingValue);
  return Number.isFinite(value) ? value : null;
}

/** 矛盾判準：兩值皆可解析且前者嚴格大於後者；相等合法（密碼長度對＝定長密碼、節流兩對＝驗證碼軟區寬度零） */
function exceeds(lowKey: SettingKey, highKey: SettingKey) {
  const low = numericValueOf(lowKey);
  const high = numericValueOf(highKey);
  return low !== null && high !== null && low > high;
}

const groups = computed(() => {
  const itemsOf = (id: GroupId, order: readonly string[]) =>
    sortByFixedOrder(
      settings.value.filter(item => groupOf(item.settingKey) === id),
      order
    );
  const result: SettingGroup[] = [
    {
      id: 'password',
      titleKey: 'page.manage.systemSettings.group.password',
      conflictKey: exceeds('password_min_length', 'password_max_length')
        ? 'page.manage.systemSettings.conflict.password'
        : null,
      items: itemsOf('password', PASSWORD_KEY_ORDER)
    },
    {
      id: 'session',
      titleKey: 'page.manage.systemSettings.group.session',
      conflictKey: null,
      items: itemsOf('session', SESSION_KEY_ORDER)
    },
    {
      id: 'ip',
      titleKey: 'page.manage.systemSettings.group.ip',
      conflictKey: exceeds('ip_captcha_after', 'ip_max_fails') ? 'page.manage.systemSettings.conflict.ip' : null,
      items: itemsOf('ip', IP_KEY_ORDER)
    },
    {
      id: 'account',
      titleKey: 'page.manage.systemSettings.group.account',
      conflictKey: exceeds('login_throttle_captcha_after', 'login_throttle_max_fails')
        ? 'page.manage.systemSettings.conflict.account'
        : null,
      items: itemsOf('account', ACCOUNT_KEY_ORDER)
    }
  ];
  return result.filter(group => group.items.length > 0);
});

/** label：有譯文之鍵走 `$t`；其餘以後端 description 遞補、再無則以鍵名（新鍵不致頁面壞） */
function labelOf(item: Api.SystemManage.SystemSetting) {
  if (isTranslatedKey(item.settingKey)) {
    return $t(`page.manage.systemSettings.item.${item.settingKey}.label`);
  }
  return item.description || item.settingKey;
}

/** 說明：有譯文之鍵走 `$t`；其餘以後端 description 遞補、再無即回空字串＝不渲染說明圖示 */
function helpOf(item: Api.SystemManage.SystemSetting) {
  if (isTranslatedKey(item.settingKey)) {
    return $t(`page.manage.systemSettings.item.${item.settingKey}.help`);
  }
  return item.description || '';
}

/** 二值 enum 型之兩值（`enum:on,off`→['on','off']、首值＝開）；非 enum 或非恰兩值＝null（唯讀呈現） */
function switchValuesOf(settingType: string): [string, string] | null {
  const [kind, members] = settingType.split(':');
  if (kind !== 'enum' || !members) {
    return null;
  }
  const values = members.split(',');
  return values.length === 2 ? [values[0], values[1]] : null;
}

function isSwitchOn(item: Api.SystemManage.SystemSetting) {
  return item.settingValue === switchValuesOf(item.settingType)?.[0];
}

function numberKeyOf(item: Api.SystemManage.SystemSetting) {
  return `${item.settingKey}#${numberRemounts.value[item.settingKey] ?? 0}`;
}

async function getSettings() {
  readSeq += 1;
  const seq = readSeq;
  loading.value = true;
  const { data, error } = await fetchGetSystemSettings();
  // 其間已有更晚之讀取發出：本回應作廢，畫面與載入狀態交由最後一發收尾
  if (seq !== readSeq) {
    return;
  }
  if (!error && data) {
    settings.value = data;
  }
  loading.value = false;
}

/** 送出單鍵新值（不帶 description＝說明不動）；成功且鍵屬政策七鍵即清政策快取再提示，成敗皆回讀全列；回傳送出是否成功 */
async function submit(settingKey: string, settingValue: string) {
  const { error } = await fetchUpdateSystemSetting({ settingKey, settingValue });
  if (!error) {
    if (PWD_POLICY_KEYS.has(settingKey)) {
      clearPwdPolicyCache();
    }
    window.$message?.success($t('common.updateSuccess'));
  }
  await getSettings();
  return !error;
}

/** 開關切換即送二值 enum 之對應值 */
async function handleToggle(item: Api.SystemManage.SystemSetting, checked: boolean) {
  const values = switchValuesOf(item.settingType);
  if (!values) {
    return;
  }
  await submit(item.settingKey, checked ? values[0] : values[1]);
}

/** 數字框發值即送（已鉗界、值未變不發）；清空發 null＝不送、只回讀。送出被拒或清空者，回讀落定後重掛該框；送出成功不重掛 */
async function handleNumberUpdate(item: Api.SystemManage.SystemSetting, value: number | null) {
  if (value === null) {
    await getSettings();
  } else if (await submit(item.settingKey, String(value))) {
    return;
  }
  numberRemounts.value[item.settingKey] = (numberRemounts.value[item.settingKey] ?? 0) + 1;
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
          :key="group.id"
          :title="$t(group.titleKey)"
          :bordered="false"
          size="small"
          segmented
          class="card-wrapper"
        >
          <NAlert v-if="group.conflictKey" type="warning" class="mb-16px">{{ $t(group.conflictKey) }}</NAlert>
          <NGrid cols="1 s:2" :x-gap="24" :y-gap="16" responsive="screen">
            <NGi v-for="item in group.items" :key="item.settingKey">
              <div class="flex items-center justify-between gap-12px">
                <div class="flex items-center gap-4px">
                  <span class="text-14px">{{ labelOf(item) }}</span>
                  <IconTooltip v-if="helpOf(item)" :desc="helpOf(item)" />
                </div>
                <div v-if="!item.declared" class="flex items-center gap-8px">
                  <span>{{ item.settingValue }}</span>
                  <NTag size="small">{{ $t('page.manage.systemSettings.readonlyTag') }}</NTag>
                </div>
                <NSwitch
                  v-else-if="switchValuesOf(item.settingType)"
                  :value="isSwitchOn(item)"
                  @update:value="(checked: boolean) => handleToggle(item, checked)"
                />
                <NInputNumber
                  v-else-if="item.settingType === 'number'"
                  :key="numberKeyOf(item)"
                  :value="Number(item.settingValue)"
                  :min="item.rangeMin"
                  :max="item.rangeMax"
                  :step="1"
                  :precision="0"
                  :update-value-on-input="false"
                  class="w-140px"
                  @update:value="(value: number | null) => handleNumberUpdate(item, value)"
                />
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
