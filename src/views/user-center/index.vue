<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 个人中心 self-service 頁：4 卡容器（基本资料/手机/邮箱/改密码） -->
<!-- root 用 flex-col-stretch gap-16px（不用 table 模板 overflow-hidden、避免裁溢出、對齊 024 system-settings scroll-fix ⚠️ag） -->
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { fetchGetProfile, fetchUpdateProfile } from '@/service/api/rev3-user-center';
import { $t } from '@/locales';
import BasicInfoCard from './modules/basic-info-card.vue';
import PhoneCard from './modules/phone-card.vue';
import EmailCard from './modules/email-card.vue';
import PasswordCard from './modules/password-card.vue';

// canonical profile model（單一真相；3 卡共綁；handleSave 一律送全 4 可編欄、不論由哪張卡觸發）
const model = reactive<Api.UserCenter.ProfileModel>({
  userName: '',
  roles: [],
  userGender: null,
  nickName: '',
  userPhone: '',
  userEmail: '',
  // US3 唯讀顯示欄（不納入 handleSave 送出）
  createdAt: '',
  createdBy: 'system',
  adminUpdatedAt: null
});

async function getProfile() {
  const { data, error } = await fetchGetProfile();
  if (!error && data) {
    model.userName = data.userName;
    model.roles = data.roles;
    model.userGender = data.userGender ?? null;
    model.nickName = data.nickName ?? '';
    model.userPhone = data.userPhone ?? '';
    model.userEmail = data.userEmail ?? '';
    model.createdAt = data.createdAt;
    model.createdBy = data.createdBy;
    model.adminUpdatedAt = data.adminUpdatedAt ?? null;
  }
}

// 各卡「保存」共用：一律送全 4 可編欄（送全 model；後端只作用於自己、不信 body id）
async function handleSave() {
  const { error } = await fetchUpdateProfile({
    userGender: model.userGender,
    nickName: model.nickName,
    userPhone: model.userPhone,
    userEmail: model.userEmail
  });
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    await getProfile();
  }
}

onMounted(getProfile);
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <BasicInfoCard :model="model" @save="handleSave" />
    <PhoneCard :model="model" @save="handleSave" />
    <EmailCard :model="model" @save="handleSave" />
    <PasswordCard />
  </div>
</template>

<style scoped></style>
