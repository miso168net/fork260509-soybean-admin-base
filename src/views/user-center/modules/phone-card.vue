<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 手机号卡（U0 佔位；US1 填 userPhone input＋保存；US4 加驗證入口預留控件） -->
<script setup lang="ts">
import { $t } from '@/locales';
</script>

<template>
  <NCard :title="$t('page.userCenter.phoneTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <!-- U0 佔位；表單由 US1/US4 填 -->
  </NCard>
</template>

<style scoped></style>
