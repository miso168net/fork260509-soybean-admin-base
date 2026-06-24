// [rev3-inline 017-audit-center-enhancement C-3 ★] CSV 匯出下載 util（審計三分頁共用）
// 後端 export 分支回 {csv,truncated}（csv 含 UTF-8 BOM、由 records_to_csv 前綴）；前端僅負責觸發下載
// （F4 後截斷判斷改用後端 truncated 旗標、前端不再鏡像 cap 常數）

/**
 * 下載 CSV 字串為檔案。
 *
 * @param csv CSV 文字（後端已含 UTF-8 BOM、Excel 中文不亂碼）
 * @param filename 下載檔名（如 `operation_<ts>.csv`）
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
