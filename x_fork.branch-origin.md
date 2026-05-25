# rev2-admin-base-web 分支來源紀錄

本 `rev2-admin-base-web` 分支建立於 **2026-05-26**，來自這個 repo 內既有的 `example` 分支，作為 `fork260509-rev2` 傘狀整合 repo 的 base-web submodule 工作分支。

| 項目 | 內容 |
|---|---|
| 此 repo | `miso168net/fork260509-soybean-admin-base` |
| 原始專案 | `soybeanjs/soybean-admin` |
| Fork 用途 | 作為傘狀整合 repo `rev2-admin-root`（`fork260509-rev2` 重建版）的 base-web submodule 工作分支 |
| Fork 建立日 | 2026-05-09 |
| `rev2-admin-base-web` 來源分支 | `example` |
| 建立時的來源 HEAD | `8be6f9ba` — Merge branch 'main' into example (2026-05-13) |
| 原本的 default branch | `new-admin-base-web`（fork260509 改設；rev2 暫不變更） |
| 改用 rev2-admin-base-web 的原因 | 此 fork 將以 git submodule 形式被傘狀 repo `rev2-admin-root` 引用，所有 rev2 整合相關改動集中在此分支，讓 `example` / `main` 保留為純粹的 upstream 對齊基準，日後 rebase upstream 不會干擾整合工作。同時與 fork260509 已使用的 `new-admin-base-web`、以及 rev1 已建的 `rev1-admin-base-web` 隔離，避免三個 workspace 互相干擾。 |

## 歷史說明

- 原本的分支（`main`、`example`、`new-admin-base-web`、`legacy`、`tauri`、`v2.0-router`、`rev1-admin-base-web`）完整保留，沒有刪除或修改。
- `rev2-admin-base-web` 是新建的分支，從 `example` HEAD `8be6f9ba` 拉出，作為 `fork260509-rev2` 傘狀整合 repo 的工作分支。
- 過程中沒有 squash、rebase 或改寫任何 commit 歷史。
- 與既存 `new-admin-base-web`（fork260509 使用）、`rev1-admin-base-web`（rev1 使用）各自獨立並進，三個 workspace 不互相干擾。

## 如何比對 rev2-admin-base-web 與來源的差異

```bash
git log example..rev2-admin-base-web --oneline    # 只在 rev2-admin-base-web、不在 example 的 commit
git log rev2-admin-base-web..example --oneline    # 只在 example、不在 rev2-admin-base-web 的 commit
git diff example rev2-admin-base-web -- .         # 兩條分支的內容差異
```

## 注意事項

本檔案只記錄 fork 的元資訊，不影響任何程式邏輯，可以安全忽略或刪除。
