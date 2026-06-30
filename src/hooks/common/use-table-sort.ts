// [rev3-inline 023-list-column-sort MW(f) T011] 列表欄位排序 composable（受控排序 + 自維護點擊序 + wire 字串）
// 從零造（repo 無既有 sorter 用法）。naive-ui 事實見 use-table-sort-core.ts 檔頭。
// U2 實作「受控排序 + 點擊序 reconcile + wire 字串」；U4 additive 加 clearAll + per-route 持久化（storageKey/validKeys option）。
// ★ U4：純函式核心（reconcile/toWire/parse/restore + 型別）已抽至 use-table-sort-core.ts（避免 localStg 模組鏈污染 tsx 純邏輯測）；
//   本檔 re-export 之，既有 `import { ... } from '@/hooks/common/use-table-sort'` 路徑全不變。
import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
// [rev3-inline 023-list-column-sort MW(f) T027] per-route 持久化（localStorage、prefix SOY_）
import { localStg } from '@/utils/storage';
import { reconcileSortState, restoreSortState, toSortWireString } from './use-table-sort-core';
import type { SortDir, SortEntry, SorterPayload } from './use-table-sort-core';

// re-export 純函式核心符號（既有 import 路徑相容 + tsx 純邏輯測改 import core）
export { parseSortWireString, reconcileSortState, restoreSortState, toSortWireString } from './use-table-sort-core';
export type { SortDir, SortEntry, SorterPayload } from './use-table-sort-core';

/**
 * 列表欄位排序 composable（受控排序 + 自維護點擊序 + wire 字串）
 *
 * - sortState：有序受控清單（順序＝點擊序＝優先序）
 * - sortString：computed wire 字串（field:dir,...）；view 在 api closure 合併進 query
 * - handleUpdateSorter：綁 <NDataTable @update:sorter>，reconcile 點擊序
 * - getColumnSortProps：可排序欄 spread props（sorter 啟用旗標 + 受控 sortOrder）
 *
 * 反應式（箭頭隨點擊更新）：getColumnSortProps 於 columns factory（$columns computed，見 hooks/common/table.ts）
 *   內被呼叫，sortOrder 讀 sortState.value 即註冊為該 computed 相依 → sortState 變則 columns 重算、箭頭更新。
 *   （此與 getter 等義：spread 會於同一 computed 追蹤域內求值 sortOrder。）
 *
 * U4 additive（既有 4 回傳與純函式不變、無 arg 呼叫仍合法）：
 * - options.storageKey：給定則 setup 時還原、變更時持久化（per storageKey，localStorage key listColumnSort）
 * - options.validKeys：給定則還原時丟棄非白名單欄（FR-015）
 * - clearAll：一鍵清空（受控→所有 sortOrder=false 箭頭消失、sortString 空 → view watch 重抓回預設、persist watch 刪 key）
 */
export function useTableSort(options?: { storageKey?: string; validKeys?: string[] }) {
  const sortState: Ref<SortEntry[]> = ref([]);

  // [rev3-inline 023-list-column-sort MW(f) T027] setup 還原（須在 sortString computed 前，使首次 fetch 即帶還原值）
  if (options?.storageKey) {
    const stored = localStg.get('listColumnSort')?.[options.storageKey];
    sortState.value = restoreSortState(stored, options.validKeys);
  }

  const sortString = computed(() => toSortWireString(sortState.value));

  // [rev3-inline 023-list-column-sort MW(f) T027] 持久化：sortString 變更 → 寫/刪 per storageKey（空字串→刪鍵）
  if (options?.storageKey) {
    const key = options.storageKey;
    watch(sortString, s => {
      const all = localStg.get('listColumnSort') || {};
      if (s) {
        all[key] = s;
      } else {
        delete all[key];
      }
      localStg.set('listColumnSort', all);
    });
  }

  function handleUpdateSorter(payload: SorterPayload) {
    sortState.value = reconcileSortState(sortState.value, payload);
  }

  // [rev3-inline 023-list-column-sort MW(f) T024] 一鍵清除（受控模式 setState 空、不需 tableRef.clearSorter）
  function clearAll() {
    sortState.value = [];
  }

  function orderOf(columnKey: string): SortDir | false {
    const entry = sortState.value.find(e => e.columnKey === columnKey);
    return entry ? entry.order : false;
  }

  function getColumnSortProps(columnKey: string) {
    return {
      // remote 下 multiple 僅為「啟用多欄排序 UI」旗標、值不參與決策（受控由 sortOrder 決定）
      sorter: { multiple: 1 },
      sortOrder: orderOf(columnKey)
    };
  }

  return {
    sortState,
    sortString,
    handleUpdateSorter,
    getColumnSortProps,
    clearAll
  };
}
