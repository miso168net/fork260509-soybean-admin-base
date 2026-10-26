// [rev6-inline MANAGE-AUDIT-VIEW+ 008-audit-settings-pages] 稽核頁四張搜尋卡共用之時間區間段（新增檔；上游基線無此路徑）——區間值轉 wire 兩欄、重設回填並觸發搜尋
// 四卡的區間控件、轉 wire 與重設三段完全同構，抽成本 composable 由各卡呼叫；出處＝rev5:src/views/manage/audit/modules/use-audit-search-date-range.ts。
// 區間以瀏覽器本地時間輸入，送出時經 `Date#toISOString` 轉成 UTC 的 RFC3339 字串寫進 `timeFrom`／`timeTo`；後端以半開區間 [起, 迄) 過濾。
import { ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import { jsonClone } from '@sa/utils';

/**
 * 稽核搜尋卡之時間區間段。
 *
 * - `dateRange`：區間控件（`NDatePicker type="datetimerange"`）之值，兩端毫秒時間戳；清空為 null。
 * - `search`：把區間寫進 `timeFrom`／`timeTo`（清空即兩欄寫 null）後發 `search`。
 * - `resetModel`：搜尋參數回填為本 composable 建立當下之深拷貝、清空區間，再走 `search`＝重設即刷新清單。
 */
export function useAuditSearchDateRange<T extends { timeFrom?: string | null; timeTo?: string | null }>(
  model: Ref<T>,
  emit: (e: 'search') => void
) {
  const dateRange = ref<[number, number] | null>(null);

  // 建立當下的參數即「重設」要回到的狀態
  const snapshot = jsonClone(toRaw(model.value));

  function search() {
    const range = dateRange.value;
    // 以 Object.assign 合入兩欄、不對泛型 T 之屬性直接賦值
    Object.assign(model.value, {
      timeFrom: range ? new Date(range[0]).toISOString() : null,
      timeTo: range ? new Date(range[1]).toISOString() : null
    });
    emit('search');
  }

  function resetModel() {
    Object.assign(model.value, snapshot);
    dateRange.value = null;
    search();
  }

  return { dateRange, resetModel, search };
}
