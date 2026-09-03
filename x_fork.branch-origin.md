<!-- [rev6-inline meta+] 新檔：fork 分支元資訊、非程式邏輯 -->
# rev6-admin-base-web 分支來源紀錄

本 `rev6-admin-base-web` 分支建立於 **2026-09-03**（rev6 波 1 workspace 創世、由傘狀 repo `tools/bootstrap.sh` 掛為 worktree），起點＝本機源倉 `example` 分支 tip `8be6f9ba`（＝upstream `soybeanjs/soybean-admin` 的 `example` 最新 HEAD；rev6 基線 D14、bootstrap 斷言源倉恆切在此），作為 `fork260509-rev6` 傘狀整合 repo 的 base-web submodule 工作分支。

| 項目 | 內容 |
|---|---|
| 此 repo | `miso168net/fork260509-soybean-admin-base` |
| 原始專案 | `soybeanjs/soybean-admin` |
| Fork 用途 | 傘狀整合 repo `rev6-admin-root`（`fork260509-rev6`）的 base-web submodule 工作分支；本機＝源倉的 git worktree、對外層＝gitlink pin |
| Fork 建立日 | 2026-05-09 |
| `rev6-admin-base-web` 來源分支 | 源倉 `example`（＝`upstream/example`，非 fork 內鏡像；bootstrap 斷言其 tip＝基線 SHA） |
| 建立時的來源 HEAD | `8be6f9ba` — Merge branch 'main' into example（2026-05-13）；2026-09-03 `ls-remote upstream example` 實測仍為此 commit，與 rev3／rev4／rev5 工作分支同一起點 |
| 現行 default branch | `rev1-admin-base-web`（rev6 不變更） |
| 改用 rev6-admin-base-web 的原因 | rev6 前端整合改動集中此分支；`example`／`main` 保留為純 upstream 對齊基準、日後 rebase upstream 不受干擾；與 `new-admin-base-web`、`rev1`～`rev5-admin-base-web` 各代工作分支隔離、各 workspace 互不干擾；rev5 工作樹自 2026-09-03 起為唯讀對照基準（傘狀 repo ADR-00002、凍結 SHA 由 bootstrap 斷言） |

## 歷史說明

- 原有分支（`main`、`example`、`legacy`、`tauri`、`v2.0-router`、`new-admin-base-web`、`rev1-admin-base-web`、`rev2-admin-base-web`、`rev3-admin-base-web`、`rebase260616-rev3-admin-base-web`、`rev4-admin-base-web`、`rev5-admin-base-web`）完整保留，沒有刪除或修改。
- `rev6-admin-base-web` 自 `example` HEAD `8be6f9ba` 拉出——upstream example 自 rev3 建分支起零新 commit，故與 rev3／rev4／rev5 工作分支為同一起點 commit、各自獨立演進。
- 過程中沒有 squash、rebase 或改寫任何 commit 歷史。
- rev6 期本機源倉＝`fork260509-rev6/fork260509-soybean-admin-base/`（gitignored；由 `tools/bootstrap.sh` 自 GitHub clone、`upstream` remote push URL 鎖 `no_push`）；worktree 的 `.git` 檔指向它，源倉目錄必須保留。
- fork 差異一律走 `rev6-inline` 標記紀律（修改型帶 `原行:` 註解、新增型圈界、新檔僅檔頭一行標記；規則見傘狀 repo constitution §III）；機器強制（fork-delta-lint）隨子庫刀進場。本檔即首個帶標記的新檔、非程式邏輯。
- 應用碼實作以 rev5 為藍本（`../fork260509-rev5/base-web/`、唯讀、凍結 SHA `9833308`）：讀允許、拷貝禁止、註解重寫、rev6 拍板已推翻的行為不帶回（傘狀 repo constitution §I.5、CLAUDE.md §1）。

## 如何比對 rev6-admin-base-web 與來源的差異

```bash
git log example..rev6-admin-base-web --oneline    # 只在 rev6-admin-base-web、不在 example 的 commit
git log rev6-admin-base-web..example --oneline    # 只在 example、不在 rev6-admin-base-web 的 commit
git diff example rev6-admin-base-web -- .         # 兩條分支的內容差異
git grep -n "rev6-inline"                         # fork patch set 索引（inline 標記紀律）
```

## 注意事項

本檔案只記錄 fork 的元資訊，不影響任何程式邏輯，可以安全忽略或刪除。
