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
      :content-style="{ display: 'flex', flexDirection: 'column', minHeight: '0' }"
    >
      <PolicyArchiveTable class="policy-archive-fill" />
    </NCard>
  </div>
</template>

<!-- [rev3-inline fix 2026-06-26] 回收桶頁修（鏡像 audit/index.vue 2026-06-24 同款修法）：子表 flex-height
     NDataTable 被夾在 display:block 的 NCard content 內、flex 高度鏈斷→table body 塌成 0px→有資料時列被裁、
     視覺空白（空表顯空狀態看不出，故 latent）。補回 flex 鏈：外 card content→flex-col、子表 root（.flex-col-stretch）
     →flex:1 fill、子表 table card（root 的 last NCard）→flex:1。子表元件 policy-archive-table.vue 不動。 -->
<style scoped>
:deep(.policy-archive-fill) {
  flex: 1;
  min-height: 0;
}

:deep(.policy-archive-fill > .n-card:last-child) {
  flex: 1;
  min-height: 0;
}
</style>
