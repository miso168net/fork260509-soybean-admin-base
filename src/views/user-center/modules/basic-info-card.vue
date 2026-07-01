<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 基本资料卡（U0 佔位；US1 填 userName/roles 唯讀＋gender/nick 可改＋保存；US3 加 created/updated 唯讀列） -->
<script setup lang="ts">
import { $t } from '@/locales';
</script>

<template>
  <NCard :title="$t('page.userCenter.basicInfoTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <!-- U0 佔位；表單由 US1/US3 填 -->
  </NCard>
</template>

<style scoped></style>
