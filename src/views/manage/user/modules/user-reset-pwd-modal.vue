<!-- [rev6-inline MANAGE-USER-VIEW+ 007-user-password-admin] 重設密碼浮層（新增檔；上游基線無此路徑）——使用者列操作「重設密碼」與「隨機密碼」帶入後之確認送出，輸入欄掛密碼政策即時規則 -->
<script setup lang="ts">
// 不變式（spec FR-038、FR-047；契約＝specs/007-user-password-admin/contracts/wire-user-admin.md 端點 9）：
// · 標的於開浮層當下鎖定：取所傳列之 id 與帳號名快照、之後不再回讀——浮層開著期間清單被刷新，送出的對象也不會換人。
// · 輸入欄掛即時規則（政策七鍵投影轉表單規則；`forbidUsername` 比的是標的帳號名＝清單列之登入帳號名）：輸入當下即提示、按確定時
//   先過一次；政策讀不到即只驗必填。過了規則仍由後端依當下政策裁決——位元組上界、設密冷卻、本人改道等前端不判之拒因由後端回、
//   共用攔截層轉譯出提示，本檔只判成敗。投影快取於 SPA 存活期不重讀（見 pwd-policy.ts）：其間政策改嚴＝後端拒收、改寬＝本欄仍照
//   舊值擋下，重新整理頁面即取新值（已知態）。
// · 送出鈕空值停用；送出期間載入中（按鈕於載入中不觸發點擊）、處理器另有重入守——連點只送出一次（第二發會撞設密冷卻、
//   成功提示之後多跳一則錯誤）；送出失敗時浮層留著、輸入值不清（就地改一個再送）；成功即關浮層並通知掛載端刷新當前頁
//   （重設會改該列之更新時間與更新者）——送出在途期間已關閉後重開（改開他列）者，回應落定時不關此刻開著之浮層（以開啟序號判；
//   成功提示與通知照常）。
// · 關閉即清明文：清空掛在可見性之 falsy 邊——標題列之叉、遮罩點擊、ESC、取消鈕與成功關閉都只改可見性、皆經此。
// · 接受產密浮層之帶入：掛載端於開浮層前寫入輸入值，帶入後仍須按確定才送出（改掉他人密碼不可逆、多一次確認）。
// 出處：rev5:src/views/manage/user/index.vue 內嵌之重設密碼浮層（版式、送出與失敗處置、關閉即清）。rev6 差異：抽成本檔
// （使用者頁 index 之修改面因而縮小）；輸入欄改掛即時規則（rev5 只擋空值）；確定鈕送出中載入中（rev5 送出期間仍可再按）；
// 送出在途關閉後重開之浮層不被舊回應關掉（rev5 會）。
import { computed, reactive, ref, watch } from 'vue';
// 包裝以直接路徑匯入：WRAPPER 軌道新檔不入 `service/api/index.ts` 之 barrel
import { fetchResetUserPassword } from '@/service/api/rev6-user-admin';
import { usePwdPolicy, usePwdPolicyRules } from '@/hooks/business/pwd-policy';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserResetPwdModal'
});

interface Props {
  /** 標的列（掛載端於列操作被選取時鎖定之列）；本檔於開浮層當下另取快照 */
  rowData: Api.UserAdmin.UserRecord | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

/** 新密碼輸入值：掛載端可於開浮層前預填（產密帶入）；清空由本檔於關閉時負責 */
const password = defineModel<string>('password', {
  default: ''
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { policy, ensureLoaded } = usePwdPolicy();
const { buildPolicyRules } = usePwdPolicyRules();

/** 開浮層當下之標的快照（見檔頭第一條） */
const target = ref<Pick<Api.UserAdmin.UserRecord, 'id' | 'userName'> | null>(null);

/**
 * 表單繫於本檔之本地值、與 v-model 雙向同步：若表單直接讀 v-model，輸入當下（同一輸入事件內）之即時驗證讀到的是尚未經掛載端回流之
 * 舊值、提示慢一個輸入事件；掛載端之預填（產密帶入）與關閉清空經下一個 watch 回寫本地值
 */
const model = reactive({ password: password.value });

watch(password, value => {
  model.password = value;
});

watch(
  () => model.password,
  value => {
    password.value = value;
  }
);

/** 帳號名以 getter 傳入：規則於驗證當下才取值，比的恆是本次鎖定之標的 */
const rules = computed(() => ({
  password: buildPolicyRules(policy.value, () => target.value?.userName ?? '')
}));

const title = computed(() => $t('page.manage.user.resetPwdTitle', { userName: target.value?.userName ?? '' }));

/** 送出中：處理器起手置真、一切出口（成功、失敗、驗證不過之拋出）由 finally 解除；確定鈕據之載入中、處理器據之重入守 */
const submitting = ref(false);

/**
 * 開啟序號：可見性由假轉真即遞增。送出在途期間浮層可關閉後重開（改開他列）：回應落定時序號已變＝非送出當輪，成功路徑即不關此刻
 * 開著之浮層（不然關掉的是改開之他列浮層、並清其輸入）
 */
let openRound = 0;

watch(visible, opened => {
  if (opened) {
    openRound += 1;
    target.value = props.rowData ? { id: props.rowData.id, userName: props.rowData.userName } : null;
    restoreValidation();
    // 政策已有快取即零請求；讀失敗維持 null＝規則只剩必填、不擋送出
    ensureLoaded();
  } else {
    password.value = '';
  }
});

async function handleSubmit() {
  const locked = target.value;
  const round = openRound;

  if (!locked || submitting.value) {
    return;
  }

  submitting.value = true;

  try {
    await validate();

    const { error } = await fetchResetUserPassword({ id: locked.id, password: model.password });

    if (error) {
      return;
    }

    window.$message?.success($t('page.manage.user.resetPwdSuccess'));

    // 送出當輪（開啟序號未變）才關；已關閉後重開者不動此刻開著之浮層
    if (round === openRound) {
      visible.value = false;
    }

    emit('submitted');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <NModal v-model:show="visible" preset="card" :title="title" class="w-400px lt-sm:w-300px">
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.manage.user.newPassword')" path="password">
        <NInput
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.manage.user.form.password')"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :disabled="model.password === ''" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
