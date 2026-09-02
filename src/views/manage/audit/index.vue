<script setup lang="tsx">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 稽核中心主頁（新增檔；基線
// example 無此路徑、零原行；憲法 §III.2 (viii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 內容＝NTabs 四源四分頁唯讀報表（操作／存取／登入／會話；FR-E01）×四組 useNaivePaginatedTable
// ＋每分頁水平線清理入口（modal 單例掛載、標的隨分頁切換——FR-E05）。
// ★頁內零按鈕碼 gating（憲法 (viii) 專屬差異④：門＝頁級 menu 維政策僅 R_SUPER、判準＝ADR 0063
// 款三）——本頁不引 useAuth、不做任何角色分支；零匯出、零前端排序、零快照內容搜尋（FR-E06）。
// ★xForwardedFor 欄於操作／存取／登入三分頁渲染＝UI 對照 rev4 的唯一例外（ADR 0076；session
// 源結構性無此欄、第四分頁不渲染）：純文字 render＋截尾懸停全文；其餘 DTO 有而 rev4 不渲染的
// 欄（peerIp／ipConfidence／★操作分頁之 region）維持不渲染、偏離最小化——FR-B07 逐字：region 係
// rev5 新有欄而 rev4 op-log 無此欄，操作分頁補渲染即多出一個對照例外（撞「XFF 為唯一例外」）並使
// 該表 scroll-x 之 Σ 不變式失配；存取／登入兩分頁之 region 則照 rev4 續渲染。
// ★已知態三筆（CDP 對照驗形不驗值、非缺陷）：存取分頁恆空表（寫入面歸 B-016）；region／traceId
// 值恆「-」（GeoIP／trace 中介層不進場）；登入分頁節流短路遭拒不落表（NAlert 語意告示承載）。
// ★本目錄下一切原始 HTML 注入用法（指令／屬性／DOM API）皆禁（機器守＝tools/view-render-guard.py，
// ★該守門逐字掃本目錄原文、不解析註解，故此處**刻意不寫出被禁字面**——寫了就自撞）；本頁所有
// 動態文字皆走 NDataTable 純文字渲染或 JSX 子節點插值、由 Vue 逸出（快照 dialog 之 pre 亦同）。
// ★script lang 用 tsx（欄 render 函式需要），沿本 repo `views/manage/ip-rule/index.vue` 既有範式。
// rev4: 高度參照 rev4 之 views/manage/audit/index.vue（四分頁佈局、欄集、NTag 染色、快照 dialog、
// 清理入口動線、refresh 不重置頁碼）；rev5 差異＝型別取 `Api.Audit` 獨立命名空間（rev4 之
// `Api.SystemManage` 形不帶回——ADR 0019）、op-log IP 欄名對齊 rev5 schema（realIp、無 operator
// 前綴）、XFF 欄三分頁新增（ADR 0076）、★四張表 scroll-x 以自算 Σ 為準（rev4 同檔四值皆與其
// 欄寬總和不符＝rev4 內部不一致、不帶回，鏡像本 repo policy-archive 頁對 rev4: 1014 之處置）。
import { computed, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
// WRAPPER fetcher：★直接路徑、不經 barrel（沿 rev5-settings.ts／rev5-ip-rule.ts 先例）
import {
  fetchGetAccessLog,
  fetchGetLoginAttempt,
  fetchGetOperationLog,
  fetchGetSessionEvent
} from '@/service/api/rev5-audit';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import AuditSearchOperation from './modules/audit-search-operation.vue';
import AuditSearchAccess from './modules/audit-search-access.vue';
import AuditSearchLogin from './modules/audit-search-login.vue';
import AuditSearchSession from './modules/audit-search-session.vue';
import AuditPurgeModal from './modules/audit-purge-modal.vue';

const appStore = useAppStore();

// 人員欄三段降級：名稱→id→「-」（enrich 查無回 null——FR-B06）
function displayPerson(name: string | null, id: number | null) {
  return name ?? (id !== null ? String(id) : '-');
}

// 可空文字欄降級「-」（region／traceId 現況恆走此分支＝已知態；XFF 空值亦同——spec Edge Cases）
function displayText(value: string | null) {
  return value ?? '-';
}

// ── 操作日誌分頁 ──
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
      // rev5 欄名＝realIp（表欄 NOT NULL→恆字串、免降級）；rev4: 該欄名 operatorRealIp 且可空、不帶回
      // ★本分頁刻意不設 region 欄——FR-B07 逐字（操作日誌之 region 上 wire、前端不渲染）；
      //   存取／登入兩分頁才渲染 region。此處補一格＝破對照不變式，見檔頭第三段。
      key: 'realIp',
      title: $t('page.manage.audit.common.realIp'),
      align: 'center',
      minWidth: 140
    },
    {
      // ★ADR 0076：client 可控原文欄——render 回傳字串＝Vue 文字節點逸出；截尾＋懸停全文（值最長 1024 字元）
      key: 'xForwardedFor',
      title: $t('page.manage.audit.common.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
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

// op-log 快照 dialog：後端打碼後 JSON 經 stringify 格式化、pre 內 JSX 文字插值（★僅檢視、零快照內容搜尋——FR-E06）
function formatPayload(value: Record<string, unknown> | null) {
  return value === null ? $t('page.manage.audit.operation.emptyPayload') : JSON.stringify(value, null, 2);
}

function openPayload(row: Api.Audit.OperationLog) {
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

// ── 存取日誌分頁（★rev5 現況零寫入者＝恆空表、已知態非缺陷——B-016）──
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
      minWidth: 140
    },
    {
      // ★ADR 0076：同操作分頁——純文字 render＋截尾懸停全文
      key: 'xForwardedFor',
      title: $t('page.manage.audit.common.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
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
      minWidth: 140
    },
    {
      // ★ADR 0076：同操作分頁——純文字 render＋截尾懸停全文
      key: 'xForwardedFor',
      title: $t('page.manage.audit.common.xForwardedFor'),
      align: 'center',
      minWidth: 160,
      ellipsis: { tooltip: true },
      render: row => displayText(row.xForwardedFor)
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

// ── 會話事件分頁（★本源結構性無 XFF 欄——ADR 0076 射程外、不渲染不留空欄）──
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

// ── 水平線清理（FR-E05）：modal 單例掛載、標的隨分頁入口切換；成功後刷新該分頁 ──
const tabLabelKeyMap: Record<Api.Audit.PurgeAuditTable, App.I18n.I18nKey> = {
  operationLog: 'page.manage.audit.tab.operation',
  accessLog: 'page.manage.audit.tab.access',
  loginAttempt: 'page.manage.audit.tab.login',
  sessionEvent: 'page.manage.audit.tab.session'
};

const purgeVisible = ref(false);
const purgeTarget = ref<Api.Audit.PurgeAuditTable>('operationLog');
const purgeTableLabel = computed(() => $t(tabLabelKeyMap[purgeTarget.value]));

function openPurge(table: Api.Audit.PurgeAuditTable) {
  purgeTarget.value = table;
  purgeVisible.value = true;
}

// 清理後刷新走 getData（保留當前頁碼——與重新整理鈕同語意；搜尋才回第 1 頁——FR-E02）
const purgeRefreshMap: Record<Api.Audit.PurgeAuditTable, () => Promise<void>> = {
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
              <!-- 重新整理不重置頁碼（getData；FR-E02）——與搜尋（getDataByPage 回第 1 頁）分流 -->
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
            <!--
              ★scroll-x ＝上方 opColumns 的 Σ(width|minWidth) 逐位相等＝
              64（index）＋180（createTime）＋120（operator）＋130（operation）＋140（entityTable）
              ＋100（entityId）＋110（payload）＋140（realIp）＋160（xForwardedFor）＋160（traceId）
              ＝1304（憲法 §III.2 (viii) 列不變式；增刪欄或調欄寬時本數字必須同批改）。
              rev4: 同分頁寫 1440 與其欄寬總和 1144 不符＝rev4 內部不一致，rev5 以自算值為準、
              不帶回；1304＝1144＋160（XFF 新欄、ADR 0076）。
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
            <!--
              ★scroll-x ＝上方 accessColumns 的 Σ(width|minWidth) 逐位相等＝
              64（index）＋180（createTime）＋120（operator）＋100（httpMethod）＋220（httpPath）
              ＋100（httpStatus）＋140（realIp）＋160（xForwardedFor）＋120（region）＋160（traceId）
              ＝1364（憲法 §III.2 (viii) 列不變式；增刪欄或調欄寬時本數字必須同批改）。
              rev4: 同分頁寫 1320 與其欄寬總和 1204 不符＝rev4 內部不一致，rev5 以自算值為準、
              不帶回；1364＝1204＋160（XFF 新欄、ADR 0076）。
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
              class="h-560px"
            />
          </div>
        </NTabPane>

        <!-- 登入嘗試 -->
        <NTabPane name="login" :tab="$t('page.manage.audit.tab.login')">
          <div class="flex-col-stretch gap-16px">
            <AuditSearchLogin v-model:model="loginSearchParams" @search="loginGetDataByPage" />
            <!-- 已知態告示（FR-E06）：節流短路遭拒的嘗試不落 sys_login_attempt——表語意、非缺漏 -->
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
            <!--
              ★scroll-x ＝上方 loginColumns 的 Σ(width|minWidth) 逐位相等＝
              64（index）＋180（createTime）＋140（attemptedUserName）＋100（success）＋140（realIp）
              ＋160（xForwardedFor）＋120（region）＋160（traceId）
              ＝1064（憲法 §III.2 (viii) 列不變式；增刪欄或調欄寬時本數字必須同批改）。
              rev4: 同分頁寫 1040 與其欄寬總和 904 不符＝rev4 內部不一致，rev5 以自算值為準、
              不帶回；1064＝904＋160（XFF 新欄、ADR 0076）。
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
            <!--
              ★scroll-x ＝上方 sessionColumns 的 Σ(width|minWidth) 逐位相等＝
              64（index）＋180（createTime）＋120（user）＋160（sid）＋120（eventType）
              ＋140（reason）＋120（operator）＋140（sourceIp）
              ＝1044（憲法 §III.2 (viii) 列不變式；增刪欄或調欄寬時本數字必須同批改；
              本分頁無 XFF 欄——源結構性無此欄、ADR 0076 射程外）。
              rev4: 同分頁寫 1160 與其欄寬總和 1044 不符＝rev4 內部不一致，rev5 以自算值為準、不帶回。
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

    <!-- 清理 modal 單例掛載（★非四實例；target 隨分頁入口切換、成功後刷新對應分頁——FR-E05） -->
    <AuditPurgeModal
      v-model:visible="purgeVisible"
      :table="purgeTarget"
      :table-label="purgeTableLabel"
      @submitted="handlePurged"
    />
  </div>
</template>

<style scoped></style>
