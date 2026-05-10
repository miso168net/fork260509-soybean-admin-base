# new-admin-base-web 分支來源紀錄

本 `new-admin-base-web` 分支建立於 **2026-05-10**,來自這個 repo 內既有的 `main` 分支。

| 項目 | 內容 |
|---|---|
| 此 repo | `miso168net/fork260509-soybean-admin` |
| 原始專案 | `soybeanjs/soybean-admin` |
| Fork 用途 | 作為傘狀整合 repo `new-admin-root` 的 admin-web submodule 工作分支 |
| Fork 建立日 | 2026-05-09 |
| `new-admin-base-web` 來源分支 | `main` |
| 建立時的來源 HEAD | `9afb335e` — chore(deps): update deps (2026-04-18) |
| 原本的 default branch | `main` |
| 改用 new-admin-base-web 的原因 | 此 fork 將以 git submodule 形式被傘狀 repo `new-admin-root` 引用,所有整合相關改動(GAP-0 系列 / GAP-1 等)集中在此分支,讓 `main` 保留為純粹的 upstream 對齊基準,日後 rebase upstream 不會干擾整合工作。 |

## 歷史說明

- 原本的 default branch `main` 完整保留,沒有刪除或修改。
- `new-admin-base-web` 是新建的分支,從 `main` HEAD `9afb335e` 拉出,作為傘狀整合 repo 的工作分支。
- 過程中沒有 squash、rebase 或改寫任何 commit 歷史。
- GitHub 預設分支於 2026-05-10 由 `main` 切換為 `new-admin-base-web`。

## 如何比對 new-admin-base-web 與 main 的差異

```bash
git log main..new-admin-base-web --oneline    # 只在 new-admin-base-web、不在 main 的 commit
git log new-admin-base-web..main --oneline    # 只在 main、不在 new-admin-base-web 的 commit
git diff main new-admin-base-web -- .         # 兩條分支的內容差異
```

## 注意事項

本檔案只記錄 fork 的元資訊,不影響任何程式邏輯,可以安全忽略或刪除。
