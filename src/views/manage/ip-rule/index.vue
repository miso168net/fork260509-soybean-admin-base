<script setup lang="ts">
// [rev4 net-new 013-ip-rule-admin] IP 規則管理頁：最小可渲染骨架（頁容器＋標題；清單渲染屬 US1）；
// 憲法 §III.2 MODAL-WIRING (e) 標準鏡像管理頁＋(d) 擴字串 v1.11.0 已授權（IP 規則回收桶復原、ADR 0061）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。
import { $t } from '@/locales';
</script>

<template>
  <!-- 頁殼＋標題（清單渲染屬 US1、不超前）；標題暫用 route.manage_ip-rule（page.manage.ipRule.* 鍵屬 US1） -->
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('route.manage_ip-rule')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden" />
  </div>
</template>

<style scoped></style>
