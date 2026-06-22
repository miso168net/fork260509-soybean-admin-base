<script setup lang="ts">
import { $t } from '@/locales';
import PolicyArchiveTable from './modules/policy-archive-table.vue';

defineOptions({
  name: 'ManagePolicyArchive'
});

// [rev3-inline 015-policy-governance MODAL-WIRING(e)] 授權回收桶頁（list+restore）
// R_SUPER-only（FR-009）：靠 m002 menu policy（manage_policy-archive）+ dynamic getUserRoutes 自動，非 super 側欄不見此頁；
// API 亦 policy-gated（restorePolicy require_policy）。單頁單表、無 tab。
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard
      :title="$t('page.manage.policyArchive.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <PolicyArchiveTable />
    </NCard>
  </div>
</template>

<style scoped></style>
