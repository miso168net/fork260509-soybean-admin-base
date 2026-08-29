<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] user 管理頁頁首「解鎖登入」浮層
// （新增檔；基線 example 無此路徑、零原行；憲法 §III.2 (v) 列明文「modules/user-unlock-modal.vue 為 rev5
// 新增型新檔、不入名冊」）。維度下拉（帳號維／來源 IP 維）＋依維度切換的條件輸入 → 打既有端點
// `POST /systemManage/unlockLogin`（004 建、super-only；契約末節）。
// ★★**`dimension` 一律顯式帶**：後端該 DTO 走 `#[serde(default)]`——欄缺席不會被 serde 判死，而是落成
// 空字串、由守門判「維度不明」回 `2222`。rev4 的「缺席即預設帳號維」是 rev5 拍板差異、不帶回（R2#17）；
// 本檔的送出處因此逐分支把 `dimension` 寫死在字面裡，不靠任何預設值兜。
// ★**條件輸入依維度切換**：帳號維收帳號名（原樣、零 trim——鎖端以登入時送出的帳號名逐字建鍵，
// 加工過就解不到那把鎖）、IP 維收位址字面（粒度換算由後端做）。未渲染的那一欄不參與驗證
// （NForm 只驗已掛載的 FormItem），故切維度不會被另一維的必填擋住。
// ★拒因（`2222 biz.throttle.invalidUnlockTarget`／帳號維的 `5003`）一律由共用攔截層轉譯後 toast，
// 本浮層零拒因專屬 UI；成功語意是「已解除鎖定」——解鎖冪等，後端刻意不以異碼洩漏標的先前狀態。
// rev4: 承 rev4:views/manage/user/modules/user-unlock-modal.vue 之對外形（維度下拉＋條件輸入＋顯式送維度），
// 依 rev5 拍板重寫兩處——①i18n 鍵改扁平七枚（`unlockLogin`＋`unlock.*` 六枚，rev4 為 `unlock.title`／
// `unlock.dimensionLabel.*`／`unlock.form.*` 之三層形）②標的欄標籤依維度換鍵（rev4 兩維共用一把 `unlock.target`，
// 使用者看不出該填帳號名還是位址）。
import { computed, ref, watch } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（沿本頁其餘 rev5-user-admin 消費先例）
import { fetchUnlockLogin } from '@/service/api/rev5-user-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserUnlockModal'
});

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

interface UnlockModel {
  /** 解鎖維度（`user`＝帳號維／`ip`＝來源 IP 維；契約請求表第一欄、必給） */
  dimension: Api.UserAdmin.UnlockReq['dimension'];
  /** 帳號維標的（`dimension === 'user'` 時渲染並必填） */
  userName: string;
  /** 來源維標的（`dimension === 'ip'` 時渲染並必填；★wire 欄名即 `target`、不是 `ip`） */
  target: string;
}

function createDefaultModel(): UnlockModel {
  // 預設落帳號維：兩維之中帳號維是日常維運的常見情形（使用者自己打錯密碼被鎖），
  // ★但這只是**表單初值**——送出時仍逐分支顯式帶 `dimension`，不依賴任何後端預設。
  return {
    dimension: 'user',
    userName: '',
    target: ''
  };
}

const model = ref<UnlockModel>(createDefaultModel());

const dimensionOptions = computed<CommonType.Option<UnlockModel['dimension']>[]>(() => [
  { label: $t('page.manage.user.unlock.user'), value: 'user' },
  { label: $t('page.manage.user.unlock.ip'), value: 'ip' }
]);

// 必填規則：僅**已渲染**的標的欄會被 NForm 收走（另一維的 FormItem 以 v-if 移出）⇒ 切維度不會
// 被上一維的殘留必填擋住。★前端只擋空值，標的形制（帳號存不存在、位址可不可解析）交後端裁判。
const rules: Record<'dimension' | 'userName' | 'target', App.Global.FormRule> = {
  dimension: defaultRequiredRule,
  userName: defaultRequiredRule,
  target: defaultRequiredRule
};

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // ★逐分支組 body、不散開整個 model：兩個標的欄之中只有當前維度那一個有意義，把另一個一併送出
  // 等於讓後端收到一個與本次操作無關的值（帳號維的 `target` 在後端根本不參與解鎖，卻會進請求體）。
  const { error } = await fetchUnlockLogin(
    model.value.dimension === 'user'
      ? { dimension: 'user', userName: model.value.userName }
      : { dimension: 'ip', target: model.value.target }
  );

  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.user.unlock.success'));
  closeModal();
}

// 開啟即復位（含清掉上一次打進去的標的與驗證殘留）：本浮層掛在常駐頁上，不復位就會把上一輪的
// 帳號名留到下一次開啟。★掛在 visible 的 truthy 邊、不掛開啟鈕：叉、遮罩與 ESC 都直接改 visible。
watch(visible, val => {
  if (val) {
    model.value = createDefaultModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="$t('page.manage.user.unlockLogin')" class="w-400px lt-sm:w-300px">
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.manage.user.unlock.dimension')" path="dimension">
        <NSelect v-model:value="model.dimension" :options="dimensionOptions" />
      </NFormItem>
      <NFormItem v-if="model.dimension === 'user'" :label="$t('page.manage.user.unlock.userName')" path="userName">
        <NInput v-model:value="model.userName" />
      </NFormItem>
      <NFormItem v-else :label="$t('page.manage.user.unlock.ipAddress')" path="target">
        <NInput v-model:value="model.target" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
