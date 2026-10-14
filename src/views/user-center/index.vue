<!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi) 007-user-password-admin] 佔位頁改為真頁、腳本區改為引入改密卡（本標記置於 SFC 頂層：下方原行本身含腳本區之收尾標籤，寫進腳本區即提前結束該區）；原行: <script setup lang="ts"></script> -->
<script setup lang="ts">
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin START] 個人中心只掛「修改密碼」一張卡（spec FR-049）
// 其餘卡位留白：個人中心之後端端點只有讀密碼政策與改本人密碼兩支，基本資料、信箱、手機等卡各需自己的讀寫端點、現皆不存在（BL-00141）。
// 父層不持任何資料流——政策讀取與改密送出皆由卡片自理。入口沿頭像下拉之 `user-center` 項（路由鍵為上游既有）；零角色帳號經後端
// 自助路由白名單一樣拿得到本頁路由。
import PasswordCard from './modules/password-card.vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin END]
</script>

<template>
  <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(vi) 007-user-password-admin] 「敬請期待」佔位元件改為單欄縱排容器、內掛改密卡；原行: <LookForward /> -->
  <div class="flex-col-stretch gap-16px">
    <PasswordCard />
  </div>
</template>

<style scoped></style>
