<!-- BASE-WEB-MODAL-WIRING(k) (015-pwd-custody)：net-new 強制改密頁（T014、FR-004/FR-006/FR-007/FR-013；
  憲法 §III.2(k) 授權）。constant route＋blank layout＋hideInMenu（免選單曝光、任何角色可達）；
  表單＝舊密＋新密＋確認＋隨機鈕（T016 產密浮層、帶入新密與確認兩欄）＋送出＋「登出」退路；
  送出走既有 changePassword 自助改密 wrapper（零新端點、FR-007 複用後端固定驗證序）；
  ★userName 走 getProfile 真帳號（絕不用 authStore.userName＝nick_name 別名、014 U9 D4 坑）；
  成功流＝清 store needChangePwd→既有 logout 流→回登入頁（本頁屬 constant、resetStore 不自轉登入、
  故以整頁重載回登入頁——見 doLogout 註解）。★新檔零原行（example 基線無此檔）。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRef } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchChangePassword, fetchGetPasswordPolicy, fetchGetProfile } from '@/service/api/rev4-user-center';
import { fetchLogout } from '@/service/api/rev4-session-logout';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { usePwdPolicyRules } from '@/hooks/business/pwd-policy';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';
import PwdGenModal from '@/components/custom/pwd-gen-modal.vue';

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();
const { createRequiredRule, createConfirmPwdRule } = useFormRules();
const { buildPolicyRules } = usePwdPolicyRules();

const model = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

/** 本人真帳號（getProfile.userName；forbid_username 比對與浮層帶入源。★非 authStore 之 nick_name 別名） */
const userName = ref('');

/** 密碼政策原始 7 鍵（浮層構造性生成用；rules 另經共用 hook 組建） */
const policy = ref<Api.UserCenter.PasswordPolicyItem[]>([]);

const showGen = ref(false);
const submitting = ref(false);

/** 新密碼政策 rules：起手僅 required；onMounted 讀當前政策後動態擴充（與 014 改密卡同構） */
const newPasswordRules = ref<App.Global.FormRule[]>([createRequiredRule($t('form.pwd.required'))]);

// 動態 rules：新密碼＝政策 rules＋新≠舊即時 rule（後端固定序 passwordSameAsOld 為權威、前端提示為輔）；
// 舊密碼不掛 required（後端 verify 把關、與 014 改密卡 credential 同紀律）；
// confirm rule 必傳 toRef（validator 執行時動態讀當下 newPassword、014 同構）。
const rules = computed(() => ({
  newPassword: [
    ...newPasswordRules.value,
    {
      validator: (_rule, value: string) => !(value !== '' && value === model.oldPassword),
      message: $t('backend.biz.user.passwordSameAsOld'),
      trigger: ['input', 'blur']
    } satisfies App.Global.FormRule
  ],
  confirmPassword: createConfirmPwdRule(toRef(model, 'newPassword'))
}));

async function init() {
  // 兩讀端皆屬硬閘白名單（contracts C2）：getPasswordPolicy＋getProfile；
  // 失敗（網路/異常）維持 required 起手 rule 靜默降級——後端驗證為權威。
  const [policyRes, profileRes] = await Promise.all([fetchGetPasswordPolicy(), fetchGetProfile()]);
  if (!policyRes.error && policyRes.data) {
    policy.value = policyRes.data;
    newPasswordRules.value = buildPolicyRules(policyRes.data, () => userName.value);
  }
  if (!profileRes.error && profileRes.data) {
    userName.value = profileRes.data.userName;
  }
}

/** 浮層「帶入」：新密與確認兩欄同值回填（G6：說明區已提醒先複製保存再送出） */
function handleApply(password: string) {
  model.newPassword = password;
  model.confirmPassword = password;
}

/** 既有 logout 流（同 user-avatar 語意：先通知後端撤銷、失敗吞掉仍清本地）＋顯式回登入頁 */
async function doLogout() {
  try {
    await fetchLogout(localStg.get('refreshToken') || '');
  } catch {
    // 後端 logout 失敗：仍 resetStore 清本地、完成登出
  }
  await authStore.resetStore();
  // 本頁屬 constant route：resetStore 內建 toLogin 被跳過（meta.constant），且其未 await 的
  // routeStore.resetStore() 會先 resetVueRoutes() 移除 login 常數路由、再非同步 initConstantRoute()
  // 重建——SPA toLogin 會撞上 login 尚未重建的空窗（No match for login、CDP S1 實測）。故登出以
  // 整頁重載回登入頁：徹底重建 router／store、天然清殘留 SPA 狀態、避開常數路由重建競態
  // （登出語意本即回到全新未登入態；redirect 不回填本頁、避免改密成功後重登被送回強制頁）。
  window.location.href = '/login';
}

async function handleSubmit() {
  await validate();
  submitting.value = true;
  const { error } = await fetchChangePassword({
    oldPassword: model.oldPassword,
    newPassword: model.newPassword,
    confirmPassword: model.confirmPassword
  });
  submitting.value = false;
  // 失敗拒因由攔截層 toast 自動渲染（BizData violations 明細管線既有、前端零自建 UI）。
  if (!error) {
    // FR-006 成功流：提示→清 store 判定（防登出導航間隙 guard 再攔）→立即登出→回登入頁
    window.$message?.success($t('page.forceChangePwd.success'));
    authStore.userInfo.needChangePwd = false;
    await doLogout();
  }
}

onMounted(init);
</script>

<template>
  <div class="relative size-full flex-center overflow-hidden bg-layout">
    <NCard :bordered="false" class="relative z-4 w-auto rd-12px">
      <div class="w-440px lt-sm:w-300px">
        <h3 class="text-18px text-primary font-medium">{{ $t('page.forceChangePwd.title') }}</h3>
        <!-- G6 鎖出風險 UX 收斂：說明強調「請先複製保存新密碼再送出」（隨機值未抄存即送出→鎖出） -->
        <NAlert type="warning" :show-icon="true" class="mt-12px">
          {{ $t('page.forceChangePwd.desc') }}
        </NAlert>
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100" class="pt-24px">
          <NFormItem :label="$t('page.userCenter.oldPassword')" path="oldPassword">
            <NInput v-model:value="model.oldPassword" type="password" show-password-on="click" />
          </NFormItem>
          <NFormItem :label="$t('page.userCenter.newPassword')" path="newPassword">
            <NInput v-model:value="model.newPassword" type="password" show-password-on="click" />
          </NFormItem>
          <NFormItem :label="$t('page.userCenter.confirmPassword')" path="confirmPassword">
            <NInput v-model:value="model.confirmPassword" type="password" show-password-on="click" />
          </NFormItem>
        </NForm>
        <NSpace justify="space-between">
          <!-- FR-004 登出退路：點擊即既有 logout 流回登入頁（再登入仍被強制、語意不變） -->
          <NButton quaternary @click="doLogout">{{ $t('page.forceChangePwd.logout') }}</NButton>
          <NSpace :size="12">
            <NButton @click="showGen = true">{{ $t('pwdGen.title') }}</NButton>
            <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
          </NSpace>
        </NSpace>
        <PwdGenModal v-model:show="showGen" :policy="policy" :user-name="userName" @apply="handleApply" />
      </div>
    </NCard>
  </div>
</template>

<style scoped></style>
