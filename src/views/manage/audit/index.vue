<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 稽核頁主檔（新增檔；上游基線無此路徑）——操作／存取／登入嘗試／工作階段事件四分頁唯讀清單、快照浮層、依按鈕碼顯隱之清理入口 -->
<script setup lang="tsx">
// 不變式（驗收＝specs/008-audit-settings-pages/spec.md FR-051～FR-055 與 SC-011 結構清單；出處＝rev5:src/views/manage/audit/index.vue）：
// · 四源各一個分頁、各一組分頁清單；開頁即取四源（清單 hook 預設立即取數）。重新整理鈕走 getData＝不重置頁碼，搜尋走 getDataByPage＝回第 1 頁。
// · 欄集逐分頁照 rev5：traceId 三分頁、region 只在存取與登入嘗試兩分頁、XFF 三分頁；peerIp 與 ipConfidence 不渲染；工作階段事件
//   之來源只有單欄位址、該分頁沒有 XFF 欄。時間欄照 wire 字面（UTC `+00:00`）顯示、前端不換時區。零排序、零匯出、零快照內容搜尋。
// · 清理入口每分頁一顆、依按鈕碼 `audit:purge` 顯隱；這層只管「看不看得到」，端點能否呼叫由後端政策判定，兩者各自授權。
//   清理浮層單例掛載、標的表隨按下的分頁切換，成功後刷新該分頁。
// · XFF 與快照內容是自由文字：欄 render 只回字串、快照以 JSX 文字子節點插值，皆由 Vue 當純文字輸出。本目錄禁用任何原始 HTML
//   注入寫法（機器守＝tools/view-render-guard.py；該守門逐字掃原文、不分註解與碼，故此處不寫出被禁的字面）。
// · 失敗提示不在本頁處理：讀端四支沒有業務拒因，HTTP 層拒絕由 `service/request` 的 onError 鏈轉譯後出 toast。
// · script 用 tsx＝欄 render 需要 JSX，同 `views/manage/ip-rule/index.vue`。
import { computed, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
// 直接路徑 import、不經 barrel（理由見該檔檔頭）
import {
  fetchGetAccessLog,
  fetchGetLoginAttempt,
  fetchGetOperationLog,
  fetchGetSessionEvent
} from '@/service/api/rev6-audit';
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AuditSearchOperation from './modules/audit-search-operation.vue';
import AuditSearchAccess from './modules/audit-search-access.vue';
import AuditSearchLogin from './modules/audit-search-login.vue';
import AuditSearchSession from './modules/audit-search-session.vue';
import AuditPurgeModal from './modules/audit-purge-modal.vue';

const appStore = useAppStore();

const { hasAuth } = useAuth();

/** 人員欄三段降級：名稱 → id → 「-」（排程清理之自記列無操作者、顯「-」）。 */
function displayPerson(name: string | null, id: number | null) {
  return name ?? (id !== null ? String(id) : '-');
}

/** 可空文字欄之降級：null 顯「-」。 */
function displayText(value: string | null) {
  return value ?? '-';
}

// ── 操作日誌 ──
const opSearchParams = ref<Api.Audit.OperationLogSearchParams>({
  current: 1,
  size: 10,
  entityTable: null,
  operation: null,
  operatorId: null,
  operatorName: null,
  timeFrom: null,
  timeTo: null
});

const {
  columns: opColumns,
  data: opData,
  loading: opLoading,
  getData: opGetData,
  getDataByPage: opGetDataByPage,
  mobilePagination: opPagination
} = useNaivePaginatedTable({
  api: () => fetchGetOperationLog(opSearchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    opSearchParams.value.current = params.page;
    opSearchParams.value.size = params.pageSize;
  },
  columns: () => [
    { key: 'index', title: $t('common.index'), align: 'center', width: 64, render: (_, index) => index + 1 },
    { key: 'createTime', title: $t('page.manage.audit.column.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'operator',
      title: $t('page.manage.audit.column.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'operation',
      title: $t('page.manage.audit.column.operation'),
      align: 'center',
      width: 130,
      render: row => <NTag>{row.operation}</NTag>
    },
    { key: 'entityTable', title: $t('page.manage.audit.column.entityTable'), align: 'center', minWidth: 140 },
    {
      // 無單一受操作列者（如設定變更、解鎖、清理自記）為 null
      key: 'entityId',
      title: $t('page.manage.audit.column.entityId'),
      align: 'center',
      width: 100,
      render: row => (row.entityId !== null ? String(row.entityId) : '-')
    },
    {
      key: 'payload',
      title: $t('page.manage.audit.column.snapshot'),
      align: 'center',
      width: 110,
      render: row => {
        if (row.payloadBefore === null && row.payloadAfter === null) {
          return <span class="text-#999">{$t('page.manage.audit.snapshot.empty')}</span>;
        }
        return (
          <NButton text type="primary" size="small" onClick={() => openSnapshot(row)}>
            {$t('page.manage.audit.snapshot.entry')}
          </NButton>
        );
      }
    },
    { key: 'realIp', title: $t('page.manage.audit.column.realIp'), align: 'center', minWidth: 140 },
    {
      // 自由文字：render 回字串＝純文字節點；截尾、懸停看全文
      key: 'xForwardedFor',
      title: $t('page.manage.audit.column.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.column.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

/** 快照一段之顯示值：null 顯無快照提示，其餘排成兩格縮排之 JSON 文字（值已在後端讀端打碼）。 */
function formatSnapshot(value: Record<string, unknown> | null) {
  return value === null ? $t('page.manage.audit.snapshot.empty') : JSON.stringify(value, null, 2);
}

/** 唯讀快照浮層：變更前／後兩段，各為小標＋`<pre>` 文字子節點。 */
function openSnapshot(row: Api.Audit.OperationLog) {
  window.$dialog?.info({
    title: $t('page.manage.audit.snapshot.title'),
    class: 'w-600px',
    content: () => (
      <div class="flex-col gap-12px">
        <div>
          <div class="mb-4px font-medium">{$t('page.manage.audit.snapshot.before')}</div>
          <pre class="max-h-280px overflow-auto whitespace-pre-wrap break-all rounded bg-#f5f5f5 p-8px text-12px dark:bg-#2a2a2a">
            {formatSnapshot(row.payloadBefore)}
          </pre>
        </div>
        <div>
          <div class="mb-4px font-medium">{$t('page.manage.audit.snapshot.after')}</div>
          <pre class="max-h-280px overflow-auto whitespace-pre-wrap break-all rounded bg-#f5f5f5 p-8px text-12px dark:bg-#2a2a2a">
            {formatSnapshot(row.payloadAfter)}
          </pre>
        </div>
      </div>
    ),
    positiveText: $t('common.confirm')
  });
}

// ── 存取日誌 ──
const accessSearchParams = ref<Api.Audit.AccessLogSearchParams>({
  current: 1,
  size: 10,
  httpMethod: null,
  httpStatus: null,
  operatorId: null,
  operatorName: null,
  httpPath: null,
  timeFrom: null,
  timeTo: null
});

const {
  columns: accessColumns,
  data: accessData,
  loading: accessLoading,
  getData: accessGetData,
  getDataByPage: accessGetDataByPage,
  mobilePagination: accessPagination
} = useNaivePaginatedTable({
  api: () => fetchGetAccessLog(accessSearchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    accessSearchParams.value.current = params.page;
    accessSearchParams.value.size = params.pageSize;
  },
  columns: () => [
    { key: 'index', title: $t('common.index'), align: 'center', width: 64, render: (_, index) => index + 1 },
    { key: 'createTime', title: $t('page.manage.audit.column.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'operator',
      title: $t('page.manage.audit.column.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'httpMethod',
      title: $t('page.manage.audit.column.httpMethod'),
      align: 'center',
      width: 100,
      render: row => <NTag>{row.httpMethod}</NTag>
    },
    { key: 'httpPath', title: $t('page.manage.audit.column.httpPath'), align: 'center', minWidth: 220 },
    {
      key: 'httpStatus',
      title: $t('page.manage.audit.column.httpStatus'),
      align: 'center',
      width: 100,
      render: row => {
        const type: NaiveUI.ThemeColor = row.httpStatus < 400 ? 'success' : row.httpStatus < 500 ? 'warning' : 'error';
        return <NTag type={type}>{row.httpStatus}</NTag>;
      }
    },
    { key: 'realIp', title: $t('page.manage.audit.column.realIp'), align: 'center', minWidth: 140 },
    {
      key: 'xForwardedFor',
      title: $t('page.manage.audit.column.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
    },
    {
      key: 'region',
      title: $t('page.manage.audit.column.region'),
      align: 'center',
      minWidth: 120,
      render: row => displayText(row.region)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.column.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

// ── 登入嘗試 ──
const loginSearchParams = ref<Api.Audit.LoginAttemptSearchParams>({
  current: 1,
  size: 10,
  success: null,
  realIp: null,
  userName: null,
  timeFrom: null,
  timeTo: null
});

const {
  columns: loginColumns,
  data: loginData,
  loading: loginLoading,
  getData: loginGetData,
  getDataByPage: loginGetDataByPage,
  mobilePagination: loginPagination
} = useNaivePaginatedTable({
  api: () => fetchGetLoginAttempt(loginSearchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    loginSearchParams.value.current = params.page;
    loginSearchParams.value.size = params.pageSize;
  },
  columns: () => [
    { key: 'index', title: $t('common.index'), align: 'center', width: 64, render: (_, index) => index + 1 },
    { key: 'createTime', title: $t('page.manage.audit.column.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'attemptedUserName',
      title: $t('page.manage.audit.column.attemptedUserName'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'success',
      title: $t('page.manage.audit.column.success'),
      align: 'center',
      width: 100,
      render: row => (
        <NTag type={row.success ? 'success' : 'error'}>
          {$t(row.success ? 'page.manage.audit.column.successOption.true' : 'page.manage.audit.column.successOption.false')}
        </NTag>
      )
    },
    { key: 'realIp', title: $t('page.manage.audit.column.realIp'), align: 'center', minWidth: 140 },
    {
      key: 'xForwardedFor',
      title: $t('page.manage.audit.column.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
    },
    {
      key: 'region',
      title: $t('page.manage.audit.column.region'),
      align: 'center',
      minWidth: 120,
      render: row => displayText(row.region)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.column.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

// ── 工作階段事件 ──
const sessionSearchParams = ref<Api.Audit.SessionEventSearchParams>({
  current: 1,
  size: 10,
  userId: null,
  userName: null,
  eventType: null,
  reason: null,
  timeFrom: null,
  timeTo: null
});

const {
  columns: sessionColumns,
  data: sessionData,
  loading: sessionLoading,
  getData: sessionGetData,
  getDataByPage: sessionGetDataByPage,
  mobilePagination: sessionPagination
} = useNaivePaginatedTable({
  api: () => fetchGetSessionEvent(sessionSearchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    sessionSearchParams.value.current = params.page;
    sessionSearchParams.value.size = params.pageSize;
  },
  columns: () => [
    { key: 'index', title: $t('common.index'), align: 'center', width: 64, render: (_, index) => index + 1 },
    { key: 'createTime', title: $t('page.manage.audit.column.createTime'), align: 'center', minWidth: 180 },
    {
      // 事件主體
      key: 'user',
      title: $t('page.manage.audit.column.user'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.userName, row.userId)
    },
    { key: 'sid', title: $t('page.manage.audit.column.sid'), align: 'center', minWidth: 160 },
    {
      key: 'eventType',
      title: $t('page.manage.audit.column.eventType'),
      align: 'center',
      width: 120,
      render: row => <NTag>{row.eventType}</NTag>
    },
    {
      key: 'reason',
      title: $t('page.manage.audit.column.reason'),
      align: 'center',
      minWidth: 140,
      render: row => displayText(row.reason)
    },
    {
      // 觸發事件者
      key: 'operator',
      title: $t('page.manage.audit.column.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'sourceIp',
      title: $t('page.manage.audit.column.sourceIp'),
      align: 'center',
      minWidth: 140,
      render: row => displayText(row.sourceIp)
    }
  ]
});

// ── 清理（浮層單例、標的隨按下的分頁切換）──
const tabLabelKeyMap: Record<Api.Audit.PurgeAuditTable, App.I18n.I18nKey> = {
  operationLog: 'page.manage.audit.tab.operation',
  accessLog: 'page.manage.audit.tab.access',
  loginAttempt: 'page.manage.audit.tab.login',
  sessionEvent: 'page.manage.audit.tab.session'
};

/** 清理成功後刷新標的所屬分頁；走 getData＝保留當前頁碼（同重新整理鈕）。 */
const refreshByTable: Record<Api.Audit.PurgeAuditTable, () => Promise<void>> = {
  operationLog: opGetData,
  accessLog: accessGetData,
  loginAttempt: loginGetData,
  sessionEvent: sessionGetData
};

const purgeVisible = ref(false);
const purgeTarget = ref<Api.Audit.PurgeAuditTable>('operationLog');
const purgeTableLabel = computed(() => $t(tabLabelKeyMap[purgeTarget.value]));

function openPurge(table: Api.Audit.PurgeAuditTable) {
  purgeTarget.value = table;
  purgeVisible.value = true;
}

function handlePurged() {
  refreshByTable[purgeTarget.value]();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.audit.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NTabs type="line" animated class="h-full">
        <NTabPane name="operation" :tab="$t('page.manage.audit.tab.operation')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchOperation v-model:model="opSearchParams" @search="opGetDataByPage" />
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="opGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton v-if="hasAuth('audit:purge')" size="small" ghost type="error" @click="openPurge('operationLog')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <!--
              scroll-x 1304＝上方操作日誌各欄 width／minWidth 之和：64（序號）＋180（時間）＋120（操作者）＋130（動作）＋140（資料表）
              ＋100（標的 id）＋110（快照）＋140（來源 IP）＋160（XFF）＋160（traceId）。增刪欄或調欄寬須同批改此值與算式。
            -->
            <NDataTable
              :columns="opColumns"
              :data="opData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1304"
              :loading="opLoading"
              remote
              :row-key="row => row.id"
              :pagination="opPagination"
              class="h-560px"
            />
          </div>
        </NTabPane>

        <NTabPane name="access" :tab="$t('page.manage.audit.tab.access')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchAccess v-model:model="accessSearchParams" @search="accessGetDataByPage" />
            <!-- 狀態欄只記 HTTP 狀態碼：告示只提 403，業務拒絕與系統錯誤之回應皆為 200 -->
            <NAlert type="info" :show-icon="true">
              {{ $t('page.manage.audit.notice.access') }}
            </NAlert>
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="accessGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton v-if="hasAuth('audit:purge')" size="small" ghost type="error" @click="openPurge('accessLog')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <!--
              scroll-x 1364＝上方存取日誌各欄 width／minWidth 之和：64（序號）＋180（時間）＋120（操作者）＋100（方法）＋220（路徑）
              ＋100（狀態）＋140（來源 IP）＋160（XFF）＋120（region）＋160（traceId）。增刪欄或調欄寬須同批改此值與算式。
              表高同登入嘗試分頁取 500（兩分頁各多一則告示）。
            -->
            <NDataTable
              :columns="accessColumns"
              :data="accessData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1364"
              :loading="accessLoading"
              remote
              :row-key="row => row.id"
              :pagination="accessPagination"
              class="h-500px"
            />
          </div>
        </NTabPane>

        <NTabPane name="login" :tab="$t('page.manage.audit.tab.login')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchLogin v-model:model="loginSearchParams" @search="loginGetDataByPage" />
            <!-- 被登入節流直接擋下的嘗試不落表（表語意、非缺漏）；告示不承諾嚴格上限 -->
            <NAlert type="info" :show-icon="true">
              {{ $t('page.manage.audit.notice.login') }}
            </NAlert>
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="loginGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton v-if="hasAuth('audit:purge')" size="small" ghost type="error" @click="openPurge('loginAttempt')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <!--
              scroll-x 1064＝上方登入嘗試各欄 width／minWidth 之和：64（序號）＋180（時間）＋140（嘗試帳號）＋100（結果）
              ＋140（來源 IP）＋160（XFF）＋120（region）＋160（traceId）。增刪欄或調欄寬須同批改此值與算式。
            -->
            <NDataTable
              :columns="loginColumns"
              :data="loginData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1064"
              :loading="loginLoading"
              remote
              :row-key="row => row.id"
              :pagination="loginPagination"
              class="h-500px"
            />
          </div>
        </NTabPane>

        <NTabPane name="session" :tab="$t('page.manage.audit.tab.session')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchSession v-model:model="sessionSearchParams" @search="sessionGetDataByPage" />
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="sessionGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton v-if="hasAuth('audit:purge')" size="small" ghost type="error" @click="openPurge('sessionEvent')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <!--
              scroll-x 1044＝上方工作階段事件各欄 width／minWidth 之和：64（序號）＋180（時間）＋120（使用者）＋160（sid）＋120（事件型）
              ＋140（原因）＋120（操作者）＋140（來源 IP）。增刪欄或調欄寬須同批改此值與算式。
            -->
            <NDataTable
              :columns="sessionColumns"
              :data="sessionData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1044"
              :loading="sessionLoading"
              remote
              :row-key="row => row.id"
              :pagination="sessionPagination"
              class="h-560px"
            />
          </div>
        </NTabPane>
      </NTabs>
    </NCard>

    <AuditPurgeModal
      v-model:visible="purgeVisible"
      :table="purgeTarget"
      :table-label="purgeTableLabel"
      @submitted="handlePurged"
    />
  </div>
</template>

<style scoped></style>
