// [rev3-inline 023-list-column-sort T013] useTableSort 純邏輯測（reconcile 點擊序 / wire 字串 / parse 往返）
//
// 為何此形：reconcileSortState / toSortWireString / parseSortWireString 為 composable 抽出之純函式，
// 不依賴 vue 反應式即可斷言點擊序 reconcile（append/改向/移除/清空/保位）與 wire 字串雙向轉換。
// 走既有 devDep `tsx`（無新增 npm dep）；不引入 vitest（專案無）。範本＝locales/__tests__/translate-backend-msg.spec.ts。
// 注：import composable 檔會連帶 import 'vue'（純 JS 反應式、node 可載）；naive-ui 為 import type（erase）、不觸發 runtime 載入。

import { parseSortWireString, reconcileSortState, toSortWireString } from '../use-table-sort';
import type { SortEntry, SorterPayload } from '../use-table-sort';

let failures = 0;
function expectEq(label: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) {
    console.log(`PASS  ${label} => ${g}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${label} => got ${g}, want ${w}`);
  }
}

// naive-ui SortState 含 sorter 欄（reconcile 不讀、測資補佔位）
function ss(columnKey: string, order: 'ascend' | 'descend' | false): any {
  return { columnKey, order, sorter: { multiple: 1 } };
}

// --- reconcile：首次點擊（無 → descend，naive-ui 第一下反序）---
expectEq('reconcile empty + single descend', reconcileSortState([], ss('userName', 'descend')), [
  { columnKey: 'userName', order: 'descend' }
]);

// --- reconcile：同欄改向（保位、僅更新方向）---
expectEq(
  'reconcile toggle direction (keep position)',
  reconcileSortState([{ columnKey: 'userName', order: 'descend' }], ss('userName', 'ascend')),
  [{ columnKey: 'userName', order: 'ascend' }]
);

// --- reconcile：同欄第三點取消（descend→ascend→false → 清空該欄）---
expectEq(
  'reconcile single column cancel (false → removed)',
  reconcileSortState([{ columnKey: 'userName', order: 'ascend' }], ss('userName', false)),
  []
);

// --- reconcile：多欄 append（新啟用欄 append 尾、點擊序）---
expectEq(
  'reconcile append second column at tail',
  reconcileSortState([{ columnKey: 'userName', order: 'descend' }], [ss('userName', 'descend'), ss('status', 'ascend')]),
  [
    { columnKey: 'userName', order: 'descend' },
    { columnKey: 'status', order: 'ascend' }
  ]
);

// --- reconcile：移除中間欄（保其餘位）---
expectEq(
  'reconcile remove one column (keep other position)',
  reconcileSortState(
    [
      { columnKey: 'userName', order: 'descend' },
      { columnKey: 'status', order: 'ascend' }
    ],
    [ss('userName', false), ss('status', 'ascend')]
  ),
  [{ columnKey: 'status', order: 'ascend' }]
);

// --- reconcile：naive-ui array 為 column 定義序、自維護點擊序（status 先點 → 應保 status 在前）---
expectEq(
  'reconcile preserves click order vs naive-ui column-def order',
  reconcileSortState(
    [
      { columnKey: 'status', order: 'ascend' }, // status 先點
      { columnKey: 'userName', order: 'descend' } // userName 後點
    ],
    // naive-ui 以 column 定義序回（userName 定義在 status 前）
    [ss('userName', 'descend'), ss('status', 'ascend')]
  ),
  [
    { columnKey: 'status', order: 'ascend' },
    { columnKey: 'userName', order: 'descend' }
  ]
);

// --- reconcile：null（clearSorter）→ 清空 ---
expectEq(
  'reconcile null clears',
  reconcileSortState([{ columnKey: 'userName', order: 'descend' }], null as SorterPayload),
  []
);

// --- toSortWireString ---
expectEq('wire empty', toSortWireString([]), '');
expectEq('wire single asc', toSortWireString([{ columnKey: 'userName', order: 'ascend' }]), 'userName:asc');
expectEq(
  'wire multi',
  toSortWireString([
    { columnKey: 'userName', order: 'descend' },
    { columnKey: 'status', order: 'ascend' }
  ]),
  'userName:desc,status:asc'
);

// --- parseSortWireString ---
expectEq('parse empty', parseSortWireString(''), []);
expectEq('parse single', parseSortWireString('userName:asc'), [{ columnKey: 'userName', order: 'ascend' }]);
expectEq('parse multi', parseSortWireString('userName:desc,status:asc'), [
  { columnKey: 'userName', order: 'descend' },
  { columnKey: 'status', order: 'ascend' }
]);
expectEq('parse skips malformed tokens', parseSortWireString('userName:asc,garbage,status:,:desc'), [
  { columnKey: 'userName', order: 'ascend' }
]);

// --- 往返：parse(toWire(state)) === state ---
const roundTrip: SortEntry[] = [
  { columnKey: 'userName', order: 'descend' },
  { columnKey: 'status', order: 'ascend' },
  { columnKey: 'nickName', order: 'ascend' }
];
expectEq('round-trip parse(toWire(state)) === state', parseSortWireString(toSortWireString(roundTrip)), roundTrip);

if (failures > 0) {
  console.error(`\nuse-table-sort: ${failures} assertion(s) FAILED`);
  process.exit(1);
}
console.log('\nuse-table-sort: all assertions passed');
