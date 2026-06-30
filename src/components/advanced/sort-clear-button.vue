<script setup lang="ts">
// [rev3-inline 023-list-column-sort MW(f) T025] 一鍵清除排序鈕（共用；各 view 顯式 import、emit clear → caller clearAll）
import { $t } from '@/locales';

defineOptions({
  name: 'SortClearButton'
});

interface Emits {
  (e: 'clear'): void;
}

const emit = defineEmits<Emits>();

function handleClear() {
  emit('clear');
}
</script>

<template>
  <NButton size="small" @click="handleClear">
    <template #icon>
      <icon-ic-round-clear class="text-icon" />
    </template>
    {{ $t('common.clearSort') }}
  </NButton>
</template>

<style scoped></style>
