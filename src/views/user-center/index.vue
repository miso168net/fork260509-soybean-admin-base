<!--
  個人中心：佔位頁（LookForward「敬請期待」）改寫為真頁。父層只出骨架與掛卡、零資料流——本刀唯一的一張卡
  （改密卡）自持自呼政策與改密兩支端點，故此處連 onMounted 都不需要。
  ★本標記刻意落在**檔頭 HTML 註解**、不寫進 script 區：標記須逐字帶出基線那一行，而那行字面本身含有
  script 的結束標籤——寫進 script 區會提前關掉該區塊（SFC 解析當場紅）。
  [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi) 007-user-password-admin] 原行: <script setup lang="ts"></script>
-->
<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin START] 只掛「修改密碼」一張卡（spec FR-037）。
// ★**其餘卡位留白不補**：rev4 的基本資料／信箱／手機三張卡各自依賴 profile 讀寫端點與信箱手機驗證流，
// 本刀的 `Api.UserCenter` 只有政策與改密兩支 ⇒ 補卡就得先補端點，屬另一刀的射程；留白是拍板結果、
// 不是漏做（rev5 差異點、ADR 0019）。
// ★入口沿既有頭像下拉（`user-avatar.vue` 零 diff）、路由鍵 upstream 既在——本檔不碰 route 樹。
// ★非超管也進得來：兩支端點皆 Authed，且後端 getUserRoutes 對自助路由白名單（現含 user-center）
// 於授權過濾**後**恆併入 ⇒ 零 menu 政策的角色照樣拿得到本頁路由。
import PasswordCard from './modules/password-card.vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi)+ 007-user-password-admin END]
</script>

<template>
  <!--
    單欄縱排容器（`flex-col-stretch gap-16px`）：現在只有一張卡，但骨架照多卡形寫——日後補卡時
    是往容器裡加一行，不必再回頭改版面。
    ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
    [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(vi) 007-user-password-admin] 原行: <LookForward />
  -->
  <div class="flex-col-stretch gap-16px">
    <!--
      ★`:user-name` **刻意不綁**：政策 `forbidUsername` 比的是**登入帳號名**，而前端唯一拿得到的
      `authStore.userInfo.userName` 實為 `nick_name.unwrap_or(user_name)`＝顯示名（後端 getUserInfo 投影），
      綁上去會讓有暱稱的使用者拿到比錯對象的規則提示。rev5 as-shipped 無 profile 讀端 ⇒ 該條即時提示
      結構性缺席、由後端單一驗證點承擔（成因與接縫見 password-card.vue 的 `userName` prop 說明）。
    -->
    <PasswordCard />
  </div>
</template>

<style scoped></style>
