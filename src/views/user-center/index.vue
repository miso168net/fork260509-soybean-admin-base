<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 个人中心 self-service 頁：4 卡容器（基本资料/手机/邮箱/改密码） -->
<!-- root 用 flex-col-stretch gap-16px（不用 table 模板 overflow-hidden、避免裁溢出、對齊 024 system-settings scroll-fix ⚠️ag） -->
<script setup lang="ts">
import BasicInfoCard from './modules/basic-info-card.vue';
import PhoneCard from './modules/phone-card.vue';
import EmailCard from './modules/email-card.vue';
import PasswordCard from './modules/password-card.vue';
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <BasicInfoCard />
    <PhoneCard />
    <EmailCard />
    <PasswordCard />
  </div>
</template>

<style scoped></style>
