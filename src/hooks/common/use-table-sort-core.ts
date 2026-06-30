// [rev3-inline 023-list-column-sort MW(f)] 列表欄位排序「純函式核心」（reconcile 點擊序 / wire 字串 / parse / restore）
// 為何獨立檔（U4）：useTableSort composable 於 U4 起需 import @/utils/storage（localStg），而該模組會連帶 import @sa/utils
//   barrel（含 createLocalforage）— tsx node 載入會 throw（ESM 子路徑解析限制）。把這些純函式抽到本檔（僅 import 'vue' type +
//   naive-ui type，皆 erase/可載），讓 tsx 純邏輯測（use-table-sort.spec.ts）能 import 而不觸發 storage 模組鏈。
//   ★ U2/U3 邏輯逐字搬移、未改任何行為；use-table-sort.ts 仍 re-export 此處全部符號（既有 import 路徑不變）。
//
// naive-ui 事實（brainstorm §6 實證）：
//   原生 3-state 循環 無→descend(▼)→ascend(▲)→無（第一下 descend、不設 customNextSortOrder）；
//   多欄需 column 設 sorter:{multiple:N} 啟用；受控＝column 設 sortOrder('ascend'|'descend'|false)；
//   @update:sorter payload＝SortState|SortState[]|null（受控多欄下 array 為 column 定義序、非點擊序）；
//   表 remote → naive-ui 不二次 client 排。
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
 * 還原持久化 wire 字串 → 受控狀態（純函式供 tsx 測 T029；含 FR-015 防禦）
 *
 * - stored 空/未設 → 空清單
 * - parse wire 字串（malformed token 已於 parseSortWireString 跳過）
 * - validKeys 給定時：丟棄非白名單欄（FR-015，欄定義變更/手改 localStorage 注入失效欄時的防禦）
 */
export function restoreSortState(stored: string | null | undefined, validKeys?: string[]): SortEntry[] {
  if (!stored) {
    return [];
  }

  let result = parseSortWireString(stored);
  if (validKeys) {
    result = result.filter(e => validKeys.includes(e.columnKey));
  }

  return result;
}
