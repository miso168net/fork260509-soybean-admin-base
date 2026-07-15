<script setup lang="tsx">
// [rev4 net-new 012-audit-admin] 稽核中心：四源唯讀查詢報表頁（NTabs 四分頁＋清理 modal＋daterange）；
// 憲法 §III.2 MODAL-WIRING (i) 已授權（稽核唯讀報表頁四分頁佈局＋清理 modal＋daterange 控件）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。★FR-025：零按鈕級授權碼（不掛 hasAuth）——
// 整頁以 manage_audit 選單政策供裝、端點 5003 兜底；零匯出、零快照內容搜尋。
import { computed, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import {
  fetchGetAccessLog,
  fetchGetLoginAttempt,
  fetchGetOperationLog,
  fetchGetSessionEvent
} from '@/service/api/rev4-audit';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AuditSearchOperation from './modules/audit-search-operation.vue';
import AuditSearchAccess from './modules/audit-search-access.vue';
import AuditSearchLogin from './modules/audit-search-login.vue';
import AuditSearchSession from './modules/audit-search-session.vue';
import AuditPurgeModal from './modules/audit-purge-modal.vue';

const appStore = useAppStore();

// 顯示側人員欄降級：名稱優先、次識別、皆無→'-'（enrich 查無時後端回 null）
function displayPerson(name: string | null, id: number | null) {
  return name ?? (id !== null ? String(id) : '-');
}

function displayText(value: string | null) {
  return value ?? '-';
}

// ── 操作日誌分頁 ──
const opSearchParams = ref<Api.SystemManage.OperationLogSearchParams>({
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
    { key: 'createTime', title: $t('page.manage.audit.common.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'operator',
      title: $t('page.manage.audit.common.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'operation',
      title: $t('page.manage.audit.operation.operation'),
      align: 'center',
      width: 130,
      render: row => <NTag>{row.operation}</NTag>
    },
    { key: 'entityTable', title: $t('page.manage.audit.operation.entityTable'), align: 'center', minWidth: 140 },
    {
      key: 'entityId',
      title: $t('page.manage.audit.operation.entityId'),
      align: 'center',
      width: 100,
      render: row => (row.entityId !== null ? String(row.entityId) : '-')
    },
    {
      key: 'payload',
      title: $t('page.manage.audit.operation.payload'),
      align: 'center',
      width: 110,
      render: row => {
        const hasSnapshot = row.payloadBefore !== null || row.payloadAfter !== null;
        if (!hasSnapshot) {
          return <span class="text-#999">{$t('page.manage.audit.operation.emptyPayload')}</span>;
        }
        return (
          <NButton text type="primary" size="small" onClick={() => openPayload(row)}>
            {$t('page.manage.audit.operation.viewPayload')}
          </NButton>
        );
      }
    },
    {
      key: 'operatorRealIp',
      title: $t('page.manage.audit.common.realIp'),
      align: 'center',
      minWidth: 140,
      render: row => displayText(row.operatorRealIp)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.common.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

// op-log 快照彈層（打碼後 JSON 格式化呈現；★零快照內容搜尋、僅檢視）
function formatPayload(value: Record<string, unknown> | null) {
  return value === null ? $t('page.manage.audit.operation.emptyPayload') : JSON.stringify(value, null, 2);
}

function openPayload(row: Api.SystemManage.OperationLog) {
  window.$dialog?.info({
    title: $t('page.manage.audit.operation.payload'),
    class: 'w-600px',
    content: () => (
      <div class="flex-col gap-12px">
        <div>
          <div class="mb-4px font-medium">{$t('page.manage.audit.operation.payloadBefore')}</div>
          <pre class="max-h-280px overflow-auto whitespace-pre-wrap break-all rounded bg-#f5f5f5 p-8px text-12px dark:bg-#2a2a2a">
            {formatPayload(row.payloadBefore)}
          </pre>
        </div>
        <div>
          <div class="mb-4px font-medium">{$t('page.manage.audit.operation.payloadAfter')}</div>
          <pre class="max-h-280px overflow-auto whitespace-pre-wrap break-all rounded bg-#f5f5f5 p-8px text-12px dark:bg-#2a2a2a">
            {formatPayload(row.payloadAfter)}
          </pre>
        </div>
      </div>
    ),
    positiveText: $t('common.confirm')
  });
}

// ── 存取日誌分頁 ──
const accessSearchParams = ref<Api.SystemManage.AccessLogSearchParams>({
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
    { key: 'createTime', title: $t('page.manage.audit.common.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'operator',
      title: $t('page.manage.audit.common.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'httpMethod',
      title: $t('page.manage.audit.access.httpMethod'),
      align: 'center',
      width: 100,
      render: row => <NTag>{row.httpMethod}</NTag>
    },
    { key: 'httpPath', title: $t('page.manage.audit.access.httpPath'), align: 'center', minWidth: 220 },
    {
      key: 'httpStatus',
      title: $t('page.manage.audit.access.httpStatus'),
      align: 'center',
      width: 100,
      render: row => {
        const type: NaiveUI.ThemeColor = row.httpStatus < 400 ? 'success' : row.httpStatus < 500 ? 'warning' : 'error';
        return <NTag type={type}>{row.httpStatus}</NTag>;
      }
    },
    {
      key: 'realIp',
      title: $t('page.manage.audit.common.realIp'),
      align: 'center',
      minWidth: 140,
      render: row => row.realIp
    },
    {
      key: 'region',
      title: $t('page.manage.audit.common.region'),
      align: 'center',
      minWidth: 120,
      render: row => displayText(row.region)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.common.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

// ── 登入嘗試分頁 ──
const loginSearchParams = ref<Api.SystemManage.LoginAttemptSearchParams>({
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
    { key: 'createTime', title: $t('page.manage.audit.common.createTime'), align: 'center', minWidth: 180 },
    { key: 'attemptedUserName', title: $t('page.manage.audit.login.attemptedUserName'), align: 'center', minWidth: 140 },
    {
      key: 'success',
      title: $t('page.manage.audit.login.success'),
      align: 'center',
      width: 100,
      render: row => (
        <NTag type={row.success ? 'success' : 'error'}>
          {$t(row.success ? 'page.manage.audit.login.successOption.true' : 'page.manage.audit.login.successOption.false')}
        </NTag>
      )
    },
    {
      key: 'realIp',
      title: $t('page.manage.audit.common.realIp'),
      align: 'center',
      minWidth: 140,
      render: row => row.realIp
    },
    {
      key: 'region',
      title: $t('page.manage.audit.common.region'),
      align: 'center',
      minWidth: 120,
      render: row => displayText(row.region)
    },
    {
      key: 'traceId',
      title: $t('page.manage.audit.common.traceId'),
      align: 'center',
      minWidth: 160,
      render: row => displayText(row.traceId)
    }
  ]
});

// ── 會話事件分頁 ──
const sessionSearchParams = ref<Api.SystemManage.SessionEventSearchParams>({
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
    { key: 'createTime', title: $t('page.manage.audit.common.createTime'), align: 'center', minWidth: 180 },
    {
      key: 'user',
      title: $t('page.manage.audit.session.userName'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.userName, row.userId)
    },
    { key: 'sid', title: $t('page.manage.audit.session.sid'), align: 'center', minWidth: 160 },
    {
      key: 'eventType',
      title: $t('page.manage.audit.session.eventType'),
      align: 'center',
      width: 120,
      render: row => <NTag>{row.eventType}</NTag>
    },
    {
      key: 'reason',
      title: $t('page.manage.audit.session.reason'),
      align: 'center',
      minWidth: 140,
      render: row => displayText(row.reason)
    },
    {
      key: 'operator',
      title: $t('page.manage.audit.common.operator'),
      align: 'center',
      minWidth: 120,
      render: row => displayPerson(row.operatorName, row.operatorId)
    },
    {
      key: 'sourceIp',
      title: $t('page.manage.audit.session.sourceIp'),
      align: 'center',
      minWidth: 140,
      render: row => displayText(row.sourceIp)
    }
  ]
});

// ── 水平線清理 modal（每分頁一入口、FR-015；成功後刷新對應分頁）──
const tabLabelKeyMap: Record<Api.SystemManage.PurgeAuditTable, App.I18n.I18nKey> = {
  operationLog: 'page.manage.audit.tab.operation',
  accessLog: 'page.manage.audit.tab.access',
  loginAttempt: 'page.manage.audit.tab.login',
  sessionEvent: 'page.manage.audit.tab.session'
};

const purgeVisible = ref(false);
const purgeTarget = ref<Api.SystemManage.PurgeAuditTable>('operationLog');
const purgeTableLabel = computed(() => $t(tabLabelKeyMap[purgeTarget.value]));

function openPurge(table: Api.SystemManage.PurgeAuditTable) {
  purgeTarget.value = table;
  purgeVisible.value = true;
}

const purgeRefreshMap: Record<Api.SystemManage.PurgeAuditTable, () => Promise<void>> = {
  operationLog: opGetData,
  accessLog: accessGetData,
  loginAttempt: loginGetData,
  sessionEvent: sessionGetData
};

function handlePurged() {
  purgeRefreshMap[purgeTarget.value]();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.audit.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NTabs type="line" animated class="h-full">
        <!-- 操作日誌 -->
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
              <NButton size="small" ghost type="error" @click="openPurge('operationLog')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <NDataTable
              :columns="opColumns"
              :data="opData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1440"
              :loading="opLoading"
              remote
              :row-key="row => row.id"
              :pagination="opPagination"
              class="h-560px"
            />
          </div>
        </NTabPane>

        <!-- 存取日誌 -->
        <NTabPane name="access" :tab="$t('page.manage.audit.tab.access')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchAccess v-model:model="accessSearchParams" @search="accessGetDataByPage" />
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="accessGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton size="small" ghost type="error" @click="openPurge('accessLog')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <NDataTable
              :columns="accessColumns"
              :data="accessData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1320"
              :loading="accessLoading"
              remote
              :row-key="row => row.id"
              :pagination="accessPagination"
              class="h-560px"
            />
          </div>
        </NTabPane>

        <!-- 登入嘗試 -->
        <NTabPane name="login" :tab="$t('page.manage.audit.tab.login')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchLogin v-model:model="loginSearchParams" @search="loginGetDataByPage" />
            <!-- FR-021：節流短路而遭拒的登入嘗試不落此表——語意明示 -->
            <NAlert type="info" :show-icon="true">
              {{ $t('page.manage.audit.login.throttleNote') }}
            </NAlert>
            <div class="flex justify-end gap-8px">
              <NButton size="small" @click="loginGetData">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                {{ $t('common.refresh') }}
              </NButton>
              <NButton size="small" ghost type="error" @click="openPurge('loginAttempt')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <NDataTable
              :columns="loginColumns"
              :data="loginData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1040"
              :loading="loginLoading"
              remote
              :row-key="row => row.id"
              :pagination="loginPagination"
              class="h-500px"
            />
          </div>
        </NTabPane>

        <!-- 會話事件 -->
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
              <NButton size="small" ghost type="error" @click="openPurge('sessionEvent')">
                <template #icon>
                  <icon-ic-round-delete class="text-icon" />
                </template>
                {{ $t('page.manage.audit.purge.entry') }}
              </NButton>
            </div>
            <NDataTable
              :columns="sessionColumns"
              :data="sessionData"
              size="small"
              :flex-height="!appStore.isMobile"
              :scroll-x="1160"
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

    <!-- 清理 modal 掛載一次（target 隨分頁入口切換；成功後刷新對應分頁） -->
    <AuditPurgeModal
      v-model:visible="purgeVisible"
      :table="purgeTarget"
      :table-label="purgeTableLabel"
      @submitted="handlePurged"
    />
  </div>
</template>

<style scoped></style>
