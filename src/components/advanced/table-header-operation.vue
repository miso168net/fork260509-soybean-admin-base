<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'TableHeaderOperation'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  disabledDelete?: boolean;
  loading?: boolean;
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] default 插槽備援內容裡兩顆寫入口各自的顯示開關（只此兩布林；
  // 預設 true 由下方帶預設值之宣告承載＝未傳時與 upstream 同形、兩鈕皆顯）。只作用於備援內容——呼叫端覆寫的插槽內容不受其控制
  showAdd?: boolean;
  showDelete?: boolean;
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改帶預設值之宣告：純型別宣告下布林 prop 未傳即被 Vue 轉成 false、既有呼叫端會靜默失去兩鈕；原行: defineProps<Props>();
withDefaults(defineProps<Props>(), { showAdd: true, showDelete: true });

interface Emits {
  (e: 'add'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 新增鈕受 showAdd 控制（預設 true＝與原行同形）；原行: <NButton size="small" ghost type="primary" @click="add"> -->
      <NButton v-if="showAdd" size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </NButton>
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 批刪（含其確認框）受 showDelete 控制（預設 true＝與原行同形）；原行: <NPopconfirm @positive-click="batchDelete"> -->
      <NPopconfirm v-if="showDelete" @positive-click="batchDelete">
        <template #trigger>
          <NButton size="small" ghost type="error" :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </NButton>
        </template>
        {{ $t('common.confirmDelete') }}
      </NPopconfirm>
    </slot>
    <NButton size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </NButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
