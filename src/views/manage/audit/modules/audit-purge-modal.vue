<script setup lang="ts">
// [rev4 net-new 012-audit-admin] 水平線清理 modal（憲法 §III.2 MODAL-WIRING (i) 已授權：稽核唯讀報表頁之清理入口 UI）；
// example 基線無此檔、fork-delta-lint 對新檔豁免手標、零原行。天數輸入（下限 30）＋後果說明＋二次確認（NPopconfirm）；
// 成功→顯示 deletedCount＋emit submitted 由父頁刷新當前分頁；拒因（2222 invalidTable／purgeBelowFloor〔{minDays} 插值〕）走攔截層 onError translateBackendMsg。
import { ref, watch } from 'vue';
// WRAPPER 直接路徑 import、不經 barrel（避 vite stale-export）
import { fetchPurgeAuditLog } from '@/service/api/rev4-audit';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditPurgeModal'
});

// 清理天數下限（前端提示用；後端 PURGE_MIN_DAYS=30 為權威守門）
const MIN_DAYS = 30;

interface Props {
  /** 清理標的表（wire 白名單枚舉） */
  table: Api.SystemManage.PurgeAuditTable;
  /** 標的表在地化名稱（標題顯示用） */
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
  // 下限守門為後端權威——前端僅送值；違反→2222 purgeBelowFloor＋{minDays} 明細由攔截層 toast
  const { data, error } = await fetchPurgeAuditLog({ table: props.table, beforeDays: beforeDays.value ?? MIN_DAYS });
  submitting.value = false;
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.audit.purge.success', { count: data?.deletedCount ?? 0 }));
  emit('submitted');
  closeModal();
}

// 每次開啟重置天數（回下限預設）
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
        <!-- 二次確認（比照 011 解鎖 modal 先例；modal 開啟＝第一步、NPopconfirm＝第二步不可復原確認） -->
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
