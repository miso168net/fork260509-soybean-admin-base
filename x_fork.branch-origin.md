<!-- [rev5-inline meta+] 新檔：fork 分支元資訊、非程式邏輯 -->
# rev5-admin-base-web 分支來源紀錄

本 `rev5-admin-base-web` 分支建立於 **2026-08-04**，來自 upstream `soybeanjs/soybean-admin` 的 `example` 分支最新 HEAD，作為 `fork260509-rev5` 傘狀整合 repo 的 base-web submodule 工作分支。

| 項目 | 內容 |
|---|---|
| 此 repo | `miso168net/fork260509-soybean-admin-base` |
| 原始專案 | `soybeanjs/soybean-admin` |
| Fork 用途 | 作為傘狀整合 repo `rev5-admin-root`（`fork260509-rev5` 重跑版）的 base-web submodule 工作分支 |
| Fork 建立日 | 2026-05-09 |
| `rev5-admin-base-web` 來源分支 | `upstream/example`（官方最新 HEAD、非 fork 內鏡像——「從上游重來」拍板沿 rev4 先例） |
| 建立時的來源 HEAD | `8be6f9ba` — Merge branch 'main' into example (2026-05-13)；建分支當日 ls-remote 實測 upstream 零前進，與 rev3／rev4 起點恰為同一 commit |
| 現行 default branch | `rev1-admin-base-web`（rev5 不變更） |
| 改用 rev5-admin-base-web 的原因 | 所有 rev5 整合改動集中此分支，`example`／`main` 保留為純 upstream 對齊基準、日後 rebase upstream 不受干擾；與 `new-admin-base-web`（fork260509）、`rev1-admin-base-web`、`rev2-admin-base-web`、`rev3-admin-base-web`、`rev4-admin-base-web` 各代工作分支隔離，六個 workspace 互不干擾 |

## 歷史說明

- 原有分支（`main`、`example`、`legacy`、`tauri`、`v2.0-router`、`new-admin-base-web`、`rev1-admin-base-web`、`rev2-admin-base-web`、`rev3-admin-base-web`、`rebase260616-rev3-admin-base-web`、`rev4-admin-base-web`）完整保留，沒有刪除或修改。
- `rev5-admin-base-web` 從 `upstream/example` HEAD `8be6f9ba` 拉出——上游 example 自 rev3 建分支後零新 commit，故與 `rev3-admin-base-web`、`rev4-admin-base-web` 為同一起點 commit、各自獨立演進。
- 過程中沒有 squash、rebase 或改寫任何 commit 歷史。
- rev5 期本機源倉為 `fork260509-rev5/fork260509-soybean-admin-base/`（自 GitHub 直 clone——rev5 拍板紀錄＝傘狀 repo docs/brainstorms/b9-gate-decisions.md；upstream push URL 已鎖 `no_push`）。
- fork 差異一律走 `rev5-inline` 標記紀律（修改型原行註解／新增型圈界；規則見傘狀 repo constitution §III）。

## 如何比對 rev5-admin-base-web 與來源的差異

```bash
git log example..rev5-admin-base-web --oneline    # 只在 rev5-admin-base-web、不在 example 的 commit
git log rev5-admin-base-web..example --oneline    # 只在 example、不在 rev5-admin-base-web 的 commit
git diff example rev5-admin-base-web -- .         # 兩條分支的內容差異
git grep -n "rev5-inline"                          # fork patch set 索引（inline 標記紀律）
```

## 注意事項

本檔案只記錄 fork 的元資訊，不影響任何程式邏輯，可以安全忽略或刪除。
