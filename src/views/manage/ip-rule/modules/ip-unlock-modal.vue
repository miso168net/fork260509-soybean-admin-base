<!-- [rev6-inline MANAGE-IP-RULE-VIEW+ 007-user-password-admin] IP 規則頁「解鎖來源 IP」彈窗（新增檔；上游基線無此路徑）——單欄位址字面 → 既有解鎖端點之來源維 -->
<script setup lang="ts">
// 不變式（spec FR-040；契約＝specs/007-user-password-admin/contracts/wire-user-admin.md 端點 11）：
// · 與使用者列「解鎖登入」（帳號維）共用同一支請求包裝；本檔只送來源維、維度逐字寫死在送出處——後端該欄缺席不會被當成預設維度，
//   而是判「維度不明」拒收。★來源維之 wire 欄名是 `target`、不是 `ip`。
// · 位址欄只擋空值、原樣送出：位址可不可解析與換算粒度（v6 聚合為 /64 桶）都由後端判，形制不合由共用攔截層轉譯拒因出提示，本檔只判成敗。
// · 成功語意＝「已解除鎖定」：未鎖或從未出現的位址後端同樣回成功（不以異碼洩漏標的先前狀態）；只出提示、不刷新規則清單（解鎖不改規則）。
// · 開啟即復位：清掉上一輪打進去的位址與驗證殘留。掛在可見性之 truthy 邊——開啟鈕之外，叉、遮罩與 ESC 都只改可見性。
// 出處：`rev5:src/views/manage/user/modules/user-unlock-modal.vue`（使用者頁頁首之雙維解鎖浮層）。rev6 差異：兩維拆成兩處入口
// （帳號維＝使用者列操作、來源維＝本檔），本檔只留來源維之單欄、無維度下拉。
import { ref, watch } from 'vue';
// 包裝以直接路徑匯入：WRAPPER 軌道新檔不入 `service/api/index.ts` 之 barrel
import { fetchUnlockLogin } from '@/service/api/rev6-user-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'IpUnlockModal'
});

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

/** 來源維標的（位址字面；欄名對齊 wire） */
const model = ref({ target: '' });

const rules = {
  target: defaultRequiredRule
};

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { error } = await fetchUnlockLogin({ dimension: 'ip', target: model.value.target });

  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.ipRule.unlock.success'));
  closeModal();
}

watch(visible, opened => {
  if (opened) {
    model.value = { target: '' };
    restoreValidation();
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="$t('page.manage.ipRule.unlock.title')"
    class="w-400px lt-sm:w-300px"
  >
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.manage.ipRule.unlock.ipAddress')" path="target">
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
