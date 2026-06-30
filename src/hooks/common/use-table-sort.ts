// [rev3-inline 023-list-column-sort MW(f) T011] 列表欄位排序 composable（受控排序 + 自維護點擊序 + wire 字串）
// 從零造（repo 無既有 sorter 用法）。naive-ui 事實（brainstorm §6 實證）：
//   原生 3-state 循環 無→descend(▼)→ascend(▲)→無（第一下 descend、不設 customNextSortOrder）；
//   多欄需 column 設 sorter:{multiple:N} 啟用；受控＝column 設 sortOrder('ascend'|'descend'|false)；
//   @update:sorter payload＝SortState|SortState[]|null（受控多欄下 array 為 column 定義序、非點擊序）；
//   表 remote → naive-ui 不二次 client 排。
// 本切片（U2）只實作「受控排序 + 點擊序 reconcile + wire 字串」；clearAll/persist 為 U3/U4 additive、本檔不實作。
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import type { DataTableSortState } from 'naive-ui';

/** 受控排序方向（naive-ui SortOrder 去 false） */
export type SortDir = 'ascend' | 'descend';

/** 單一排序欄（清單順序＝點擊序＝優先序） */
export interface SortEntry {
  columnKey: string;
  order: SortDir;
}

/** naive-ui @update:sorter payload（受控多欄為 array、單欄為物件、clearSorter 為 null） */
export type SorterPayload = DataTableSortState | DataTableSortState[] | null;

/**
 * reconcile 點擊序（@update:sorter handler 核心；純函式供 tsx 測 T013）
 *
 * - payload null → 清空
 * - 正規化成 array → 建 newMap（columnKey→order，僅 ascend/descend；false/缺＝未排）
 * - 既有欄：仍在 newMap → 留（保位）、order 變則更新；不在 newMap → 移除
 * - newMap 有但既有清單無 → append 尾（單次點擊只一欄變、只 append 一欄 → 點擊序＝優先序）
 * - 【不覆寫】naive-ui 原生 3-state 循環（僅依其結果維護自身有序清單）
 */
export function reconcileSortState(current: SortEntry[], payload: SorterPayload): SortEntry[] {
  if (payload == null) {
    return [];
  }

  const arr = Array.isArray(payload) ? payload : [payload];

  const newMap = new Map<string, SortDir>();
  arr.forEach(s => {
    if (s.order === 'ascend' || s.order === 'descend') {
      newMap.set(String(s.columnKey), s.order);
    }
  });

  const result: SortEntry[] = [];

  // 既有欄保位：仍 active 則保留/更新方向，否則移除
  current.forEach(entry => {
    const order = newMap.get(entry.columnKey);
    if (order !== undefined) {
      result.push({ columnKey: entry.columnKey, order });
      newMap.delete(entry.columnKey);
    }
  });

  // 新啟用欄 append 尾（保留點擊序）
  newMap.forEach((order, columnKey) => {
    result.push({ columnKey, order });
  });

  return result;
}

/** 受控狀態 → wire 字串（field:dir,...；dir＝ascend→asc / descend→desc；空清單→''） */
export function toSortWireString(state: SortEntry[]): string {
  return state.map(e => `${e.columnKey}:${e.order === 'ascend' ? 'asc' : 'desc'}`).join(',');
}

/** wire 字串 → 受控狀態（供 U4 持久化還原；malformed token 跳過、不接 view） */
export function parseSortWireString(wire: string): SortEntry[] {
  if (!wire) {
    return [];
  }

  const result: SortEntry[] = [];
  wire.split(',').forEach(token => {
    const [columnKey, dir] = token.split(':');
    if (!columnKey || (dir !== 'asc' && dir !== 'desc')) {
      return;
    }
    result.push({ columnKey, order: dir === 'asc' ? 'ascend' : 'descend' });
  });

  return result;
}

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
 * clearAll/persist 為 U3/U4 additive、本切片不實作（API 預留：caller 端再擴）。
 */
export function useTableSort() {
  const sortState: Ref<SortEntry[]> = ref([]);

  const sortString = computed(() => toSortWireString(sortState.value));

  function handleUpdateSorter(payload: SorterPayload) {
    sortState.value = reconcileSortState(sortState.value, payload);
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
    getColumnSortProps
  };
}
