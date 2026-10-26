<!-- [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 稽核日誌清理浮層（新增檔；上游基線無此路徑）——唯一輸入欄為保留天數、警語＋確認泡泡二段確認、成功提示刪除筆數 -->
<script setup lang="ts">
// 出處＝rev5:src/views/manage/audit/modules/audit-purge-modal.vue。父頁以單例掛載、標的表隨分頁入口切換；成功後由父頁刷新該分頁。
// 二段確認：開啟浮層是第一步，確定鈕外包之確認泡泡是第二步。請求只有標的表與保留天數兩欄、沒有挑列刪除的欄位。
// 失敗不在本檔處理：清理之業務拒因與 HTTP 層拒絕都由 `service/request` 的 onError 鏈轉譯後出 toast，本檔只看 `error` 有無。
import { ref, watch } from 'vue';
// 直接路徑 import、不經 barrel（理由見該檔檔頭）
import { fetchPurgeAuditLog } from '@/service/api/rev6-audit';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditPurgeModal'
});

// 保留天數下界＝前端 UX 護欄；權威在後端常數 `PURGE_MIN_DAYS`（rust-api `server/src/model/retention.rs`）。
// 繞過本浮層直呼端點而天數低於下界者，由後端清理固定序之第二步擋下並回業務拒因（下界天數經錯誤明細插值進提示）。
// 輸入欄不設上界：i64 範圍內之極大天數使時間無法表示時，後端整筆回滾、回 `5000`；超出 i64 之數值後端取不到整數、
// 視同缺席，同樣由固定序之第二步回下界拒因。
const MIN_DAYS = 30;

interface Props {
  /** 清理標的表（wire 四值之一） */
  table: Api.Audit.PurgeAuditTable;
  /** 標的表之在地化名稱（父頁取該分頁之標籤；插進浮層標題） */
  tableLabel: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', { default: false });

const beforeDays = ref<number | null>(MIN_DAYS);
const loading = ref(false);

function closeModal() {
  visible.value = false;
}

async function handleConfirm() {
  // 送出中再按確認不重發
  if (loading.value) {
    return;
  }

  loading.value = true;
  // 欄位被清空時以下界補位送出；送出值一律是數字
  const { data, error } = await fetchPurgeAuditLog({ table: props.table, beforeDays: beforeDays.value ?? MIN_DAYS });
  loading.value = false;
  if (error) {
    return;
  }

  // 刪 0 筆亦是成功：水平線之前沒有可刪的列
  window.$message?.success($t('page.manage.audit.purge.success', { count: data?.deletedCount ?? 0 }));
  emit('submitted');
  closeModal();
}

// 每次開啟都重置為下界，上次輸入的天數不帶到下一次
watch(visible, val => {
  if (val) {
    beforeDays.value = MIN_DAYS;
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    :title="$t('page.manage.audit.purge.title', { table: tableLabel })"
    preset="card"
    class="w-460px"
  >
    <NForm label-placement="left" :label-width="90">
      <NFormItem :label="$t('page.manage.audit.purge.days')">
        <NInputNumber v-model:value="beforeDays" :min="MIN_DAYS" class="w-full" />
      </NFormItem>
    </NForm>
    <NAlert type="warning" :show-icon="true" class="mb-8px">
      {{ $t('page.manage.audit.purge.warning') }}
    </NAlert>
    <p class="text-12px text-#999">{{ $t('page.manage.audit.purge.daysHint') }}</p>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NPopconfirm @positive-click="handleConfirm">
          <template #trigger>
            <NButton type="error" :loading="loading">{{ $t('common.confirm') }}</NButton>
          </template>
          {{ $t('page.manage.audit.purge.confirm') }}
        </NPopconfirm>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
