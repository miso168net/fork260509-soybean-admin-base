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
    <NCard :title="$t('page.manage.audit.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <NTabs type="line" animated>
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

<style scoped></style>
