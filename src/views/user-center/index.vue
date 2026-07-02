<!-- [rev3-inline 025-user-center ★MODAL-WIRING(g)] 个人中心 self-service 頁：4 塊（修改密码/邮箱/手机/基本资料） -->
<!-- 塊狀佈局（segmented NCard、2 欄、參考 system-settings）；各區塊只送自己欄位＝部分更新（後端只 Set 有帶的欄） -->
<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { fetchGetProfile, fetchUpdateProfile } from '@/service/api/rev3-user-center';
import { $t } from '@/locales';
import PasswordCard from './modules/password-card.vue';
import EmailCard from './modules/email-card.vue';
import PhoneCard from './modules/phone-card.vue';
import BasicInfoCard from './modules/basic-info-card.vue';

// canonical profile model（單一真相；各卡共綁；保存時各區塊只送自己欄位）
const model = reactive<Api.UserCenter.ProfileModel>({
  userName: '',
  roles: [],
  userGender: null,
  nickName: '',
  userPhone: '',
  userEmail: '',
  // 唯讀顯示欄（不納入 updateProfile 送出）
  createdAt: '',
  createdBy: 'system',
  updatedAt: null,
  updatedBy: 'system'
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
    model.updatedAt = data.updatedAt ?? null;
    model.updatedBy = data.updatedBy;
  }
}

// 各區塊「保存」只送自己欄位（部分更新；後端只 Set 有帶的欄、未帶者 Unchanged）→ 天然避免跨區塊填錯值被連帶送出。
async function saveBasic() {
  const { error } = await fetchUpdateProfile({ userGender: model.userGender, nickName: model.nickName });
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    await getProfile();
  }
}

async function saveEmail() {
  const { error } = await fetchUpdateProfile({ userEmail: model.userEmail });
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    await getProfile();
  }
}

async function savePhone() {
  const { error } = await fetchUpdateProfile({ userPhone: model.userPhone });
  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    await getProfile();
  }
}

onMounted(getProfile);
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <PasswordCard />
    <EmailCard :model="model" @save="saveEmail" />
    <PhoneCard :model="model" @save="savePhone" />
    <BasicInfoCard :model="model" @save="saveBasic" />
  </div>
</template>

<style scoped></style>
