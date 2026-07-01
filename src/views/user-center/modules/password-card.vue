<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 修改密码卡（U0 佔位；US2 填 舊/新/確認 input＋動態密碼 rule＋改密码送出） -->
<script setup lang="ts">
import { $t } from '@/locales';
</script>

<template>
  <NCard :title="$t('page.userCenter.passwordTitle')" :bordered="false" size="small" segmented class="card-wrapper">
    <!-- U0 佔位；表單由 US2 填 -->
  </NCard>
</template>

<style scoped></style>
