<!-- [rev4-inline MODAL-WIRING(g) 014-user-center] 個人中心自助頁組裝（T020）：上游基線 7 行 LookForward
  佔位頁改寫為 rev3 025 藍本四卡頁——canonical ProfileModel 單一真相（型基準 Api.UserCenter.ProfileRes）、
  onMounted 載入 fetchGetProfile、三卡 model prop 共綁＋@saved 重拉；憲法 §III.2(g) 授權。
  ★修改型 inline：被改基線行逐字標原行（template 區 LookForward 另標於原位）。
  原行: <script setup lang="ts"></script>
-->
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchGetProfile } from '@/service/api/rev4-user-center';
import PasswordCard from './modules/password-card.vue';
import EmailCard from './modules/email-card.vue';
import PhoneCard from './modules/phone-card.vue';
import BasicInfoCard from './modules/basic-info-card.vue';

// canonical ProfileModel 單一真相（rev3 資料流：index.vue 持有、三卡 prop 共綁、各卡儲存只送自己欄位；
// PasswordCard 自持、僅收 userName 展示型 prop）；型基準＝Api.UserCenter.ProfileRes wire 形直用、不另立重複型。
const model = reactive<Api.UserCenter.ProfileRes>({
  id: 0,
  userName: '',
  nickName: '',
  userPhone: '',
  userEmail: '',
  userGender: null,
  roles: [],
  createdAt: null,
  updatedAt: null,
  createdByType: null,
  updatedByType: null,
  // [rev4-inline (g) 020-email-verify-smtp] C6 加欄初值：驗證時刻 null＝未驗證（載入前徽章顯灰標）
  emailVerifiedAt: null
});

// 載入本人 profile（onMounted 起手＋各卡 @saved 後重拉；卡內已自呼 fetchUpdateProfile 存妥、
// 父層只負責單一真相刷新——三卡零串擾、FR-008）。
async function getProfile() {
  const { data, error } = await fetchGetProfile();
  if (!error && data) {
    model.id = data.id;
    model.userName = data.userName;
    model.roles = data.roles;
    model.userGender = data.userGender;
    // 可空欄 null coalesce 空字串再綁卡（NInput 綁 null 顯示異常；清欄回 NULL 不做、'' 即未設）
    model.nickName = data.nickName ?? '';
    model.userPhone = data.userPhone ?? '';
    model.userEmail = data.userEmail ?? '';
    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    model.createdByType = data.createdByType;
    model.updatedByType = data.updatedByType;
    // [rev4-inline (g) 020-email-verify-smtp] C6 加欄逐欄賦值（漏補則徽章恆顯未驗證）；null 語意直傳、不 coalesce
    model.emailVerifiedAt = data.emailVerifiedAt;
  }
}

onMounted(getProfile);
</script>

<template>
  <!-- [rev4-inline MODAL-WIRING(g) 014-user-center] 原行: <LookForward />
    rev3 025 藍本四卡組裝（單欄縱排 flex-col-stretch gap-16px、卡序 修改密碼→信箱→手機號→基本資料；
    FR-002／SC-004 版面逐項照 rev3）；PasswordCard 自持、僅收 userName 展示型 prop（D4 真帳號比對源
    ——authStore.userName＝nick_name 別名不可用、任務字面預授權例外）；三卡 model 共綁＋@saved 重拉。
  -->
  <div class="flex-col-stretch gap-16px">
    <PasswordCard :user-name="model.userName" />
    <EmailCard :model="model" @saved="getProfile" />
    <PhoneCard :model="model" @saved="getProfile" />
    <BasicInfoCard :model="model" @saved="getProfile" />
  </div>
</template>

<style scoped></style>
