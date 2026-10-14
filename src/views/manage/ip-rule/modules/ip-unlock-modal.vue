<!-- [rev6-inline MANAGE-IP-RULE-VIEW+ 007-user-password-admin] IP 規則頁「解鎖來源 IP」彈窗（新增檔；上游基線無此路徑）——單欄位址字面 → 既有解鎖端點之來源維 -->
<script setup lang="ts">
// 不變式（spec FR-040；契約＝specs/007-user-password-admin/contracts/wire-user-admin.md 端點 11）：
// · 與使用者列「解鎖登入」（帳號維）共用同一支請求包裝；本檔只送來源維、維度逐字寫死在送出處——後端該欄缺席不會被當成預設維度，
//   而是判「維度不明」拒收。★來源維之 wire 欄名是 `target`、不是 `ip`。
// · 位址欄只擋空值、原樣送出：位址可不可解析與換算粒度（v6 聚合為 /64 桶）都由後端判，形制不合由共用攔截層轉譯拒因出提示，本檔只判成敗。
// · 成功語意＝「已解除鎖定」：未鎖或從未出現的位址後端同樣回成功（不以異碼洩漏標的先前狀態）；只出提示、不刷新規則清單（解鎖不改規則）。
// · 開啟即復位：清掉上一輪打進去的位址與驗證殘留。掛在可見性之 truthy 邊——開啟鈕之外，叉、遮罩與 ESC 都只改可見性。
// · 送出期間確定鈕載入中（按鈕於載入中不觸發點擊）、處理器另有重入守：連點只送出一次。
// · 送出在途期間已關閉後重開（另一輪）者，回應落定時不關此刻開著之彈窗（以開啟序號判；成功提示照出＝該次解鎖已生效）。
// 出處：`rev5:src/views/manage/user/modules/user-unlock-modal.vue`（使用者頁頁首之雙維解鎖浮層）。rev6 差異：兩維拆成兩處入口
// （帳號維＝使用者列操作、來源維＝本檔），本檔只留來源維之單欄、無維度下拉；確定鈕送出中載入中、處理器另有重入守（rev5 送出期間仍可再按）；
// 送出在途關閉後重開之彈窗不被舊回應關掉（rev5 會）。
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

/** 送出中：處理器起手置真、一切出口（成功、失敗、驗證不過之拋出）由 finally 解除；確定鈕據之載入中、處理器據之重入守 */
const submitting = ref(false);

/** 開啟序號：可見性由假轉真即遞增；送出在途期間彈窗可關閉後重開，回應落定時序號已變＝非送出當輪、成功路徑即不關此刻開著之彈窗 */
let openRound = 0;

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  if (submitting.value) {
    return;
  }

  const round = openRound;
  submitting.value = true;

  try {
    await validate();

    const { error } = await fetchUnlockLogin({ dimension: 'ip', target: model.value.target });

    if (error) {
      return;
    }

    window.$message?.success($t('page.manage.ipRule.unlock.success'));

    // 送出當輪（開啟序號未變）才關；已關閉後重開者不動此刻開著之彈窗
    if (round === openRound) {
      closeModal();
    }
  } finally {
    submitting.value = false;
  }
}

watch(visible, opened => {
  if (opened) {
    openRound += 1;
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
        <NButton type="primary" :loading="submitting" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
