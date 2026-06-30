// [rev3-inline 023-list-column-sort ADAPT T010] 列表排序 search params 擴充型（新檔、不改 frozen system-manage.d.ts）
// fork-delta：所有 *SearchParams 為 TS【type 別名】（RecordNullable 交集）非 interface → 無法 declaration-merge；
//   故以泛型 WithSort<T> 對既有 SearchParams 做 intersection 放寬，承載 server-side sort wire 字串（field:dir,...）。
// 設計：sort 不入 searchParams ref 型；composable 自持 sortString、view 在 api closure 合併傳入。
//   WithSort 僅用於放寬 service wrapper 的 param 型，避免 object-literal excess-property 報錯（runtime 整包透傳）。
declare namespace Api {
  namespace SystemManage {
    /** 列表 search params 擴 server-side 排序 wire 字串（field:dir,...；023 列表欄位排序） */
    type WithSort<T> = T & { sort?: string | null };
  }
}
