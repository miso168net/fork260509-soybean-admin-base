<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 水平線清理 modal（新增檔；
// 基線 example 無此路徑、零原行；憲法 §III.2 (viii) 列明文「view 新檔為 rev5 新增型新檔、不入名冊」）。
// 構造僅二欄（標的表×保留天數）、不存在挑列刪除路徑（FR-C01）；內容＝天數輸入（下限 30 前端護欄）
// ＋NAlert 警語＋NPopconfirm 二段確認（modal 開啟＝第一步、Popconfirm＝第二步不可復原確認）＋
// 成功 toast 帶 {count} 並 emit submitted 由父頁刷新當前分頁（FR-E05）；每次開啟重置回下限預設。
// ★拒因（2222 invalidTable／purgeBelowFloor〔{minDays} BizData 插值〕）一律由 service/request
// 共用攔截層轉譯 backend.biz.audit.* 後 toast——本 modal 零拒因專屬 UI、不自組拒因文案。
// rev4: 高度參照 rev4 之 modules/audit-purge-modal.vue（護欄／警語／二段確認／開啟重置四段形）；
// rev5 差異＝型別取 `Api.Audit` 獨立命名空間（rev4 之 `Api.SystemManage` 形不帶回——ADR 0019）。
import { ref, watch } from 'vue';
// WRAPPER fetcher：★直接路徑、不經 barrel（沿 rev5-settings.ts／rev5-ip-rule.ts 先例）
import { fetchPurgeAuditLog } from '@/service/api/rev5-audit';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditPurgeModal'
});

// 前端護欄天數下限（僅輸入下界；真值守門＝後端 PURGE_MIN_DAYS=30 權威、違反回 2222——FR-C02）
const MIN_DAYS = 30;

interface Props {
  /** 清理標的表（wire 四值白名單） */
  table: Api.Audit.PurgeAuditTable;
  /** 標的表在地化名稱（標題顯示用；父頁以分頁標籤鍵轉出、隨分頁入口切換） */
  tableLabel: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const beforeDays = ref<number | null>(MIN_DAYS);
const submitting = ref(false);

function closeModal() {
  visible.value = false;
}

async function handleConfirm() {
  submitting.value = true;
  // 送出形恆 number（rev5-audit.d.ts 契約註）：欄位遭清空時以下限補位；低於下限交後端權威擋
  const { data, error } = await fetchPurgeAuditLog({ table: props.table, beforeDays: beforeDays.value ?? MIN_DAYS });
  submitting.value = false;
  if (error) {
    return;
  }

  // deletedCount=0 亦為成功——水平線前無資料屬正常（rev5-audit.ts 契約註）
  window.$message?.success($t('page.manage.audit.purge.success', { count: data?.deletedCount ?? 0 }));
  emit('submitted');
  closeModal();
}

// 每次開啟重置回下限預設（上次輸入不跨開啟殘留——T031 逐字要求）
watch(visible, val => {
  if (val) {
    beforeDays.value = MIN_DAYS;
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    :title="`${$t('page.manage.audit.purge.title')}：${tableLabel}`"
    preset="card"
    class="w-460px"
  >
    <NForm label-placement="left" :label-width="90">
      <NFormItem :label="$t('page.manage.audit.purge.beforeDays')">
        <NInputNumber v-model:value="beforeDays" :min="MIN_DAYS" class="w-full" />
      </NFormItem>
    </NForm>
    <NAlert type="warning" :show-icon="true" class="mb-8px">
      {{ $t('page.manage.audit.purge.warning') }}
    </NAlert>
    <p class="text-12px text-#999">{{ $t('page.manage.audit.purge.beforeDaysHint') }}</p>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <!-- 二段確認：modal 開啟＝第一步、此 Popconfirm＝第二步不可復原確認（FR-E05） -->
        <NPopconfirm @positive-click="handleConfirm">
          <template #trigger>
            <NButton type="error" :loading="submitting">{{ $t('common.confirm') }}</NButton>
          </template>
          {{ $t('page.manage.audit.purge.confirm') }}
        </NPopconfirm>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
