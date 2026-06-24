<script setup lang="ts">
import { $t } from '@/locales';
import OperationLogTable from './modules/operation-log-table.vue';
import AccessLogTable from './modules/access-log-table.vue';
import LoginAttemptTable from './modules/login-attempt-table.vue';

defineOptions({
  name: 'ManageAudit'
});

// [rev3-inline 012-audit-log-query] Super-only 审计中心单页三分页（操作异动/API存取/登录尝试）
// 页面层不需显式 hasAuth：super-only 靠 m005 menu policy + dynamic getUserRoutes 自动（非 super 侧栏不见此页）；
// API 亦 policy-gated（5003）。
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard
      :title="$t('page.manage.audit.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
      :content-style="{ display: 'flex', flexDirection: 'column', minHeight: '0' }"
    >
      <NTabs type="line" animated class="audit-tabs">
        <NTabPane name="operation" :tab="$t('page.manage.audit.tab.operation')">
          <OperationLogTable />
        </NTabPane>
        <NTabPane name="access" :tab="$t('page.manage.audit.tab.access')">
          <AccessLogTable />
        </NTabPane>
        <NTabPane name="login" :tab="$t('page.manage.audit.tab.login')">
          <LoginAttemptTable />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<!-- [rev3-inline fix 2026-06-24] 審計頁修：子表 flex-height NDataTable 被 NTabs 夾在 display:block 的
     NCard content 內、flex 高度鏈斷→table body 塌成 0px→有資料時列被裁、視覺空白（012 起 latent、空表顯空狀態看不出）。
     補回 flex 鏈：外 card content→flex-col、NTabs→flex:1 flex-col、pane-wrapper→flex:1、pane/子表 root→fill、
     子表 table card（root 的 last NCard）→flex:1。三子表元件不動。 -->
<style scoped>
.audit-tabs {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

:deep(.audit-tabs .n-tabs-pane-wrapper) {
  flex: 1;
  min-height: 0;
}

:deep(.audit-tabs .n-tab-pane) {
  height: 100%;
}

:deep(.audit-tabs .n-tab-pane > .flex-col-stretch) {
  height: 100%;
  min-height: 0;
}

:deep(.audit-tabs .n-tab-pane > .flex-col-stretch > .n-card:last-child) {
  flex: 1;
  min-height: 0;
}
</style>
