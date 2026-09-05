// [rev6-inline BASE-WEB-WRAPPER+ 002-system-settings] 系統設定 service 接線層新檔（§III.1 WRAPPER 軌道；contracts/wire-settings.md §5）——不改既有 service 檔、不入 barrel
// ★本檔不列入 barrel src/service/api/index.ts：消費端（後續設定頁 view 刀）以直接路徑 import 本模組
//   （rev5:rev5-settings.ts 承 rev4 自陳理由＝避 vite stale-export）。
// 下一行 `from '../request'` 為 base-web 既有 service 檔通例（auth.ts／system-manage.ts 同形）——
//   「不經 barrel」講的是本模組的出口、不是 request 的入口。
import { request } from '../request';

/**
 * 讀全部系統設定（`GET /systemManage/getSystemSettings`；讀端契約＝contracts/wire-settings.md §1）
 *
 * 成功回 `{data: SystemSetting[], code:"0000", msg:"common.success"}`——registry 16 鍵固定集、
 * settingKey 升冪穩定序、僅未刪列、非分頁（spec FR-003）；description 為 NULL 者該欄缺席、不回 null（clarify Q2）。
 * 授權＝Policy（R_SUPER）：越權 5003 system.forbidden、未認證 8888 auth.session.reLogin（契約 §1 錯誤矩陣）。
 * 回傳型取自 rev6-settings.d.ts（declaration merging 併入 Api.SystemManage）——後續 view 刀接上即用、不需回頭補型別。
 * rev5:rev5-settings.ts fetchGetSystemSettings 同名同形（rev6 只換檔名前綴與 token）。
 */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({
    url: '/systemManage/getSystemSettings',
    method: 'get'
  });
}

/**
 * 改單一設定值（`POST /systemManage/updateSystemSetting`；寫端契約＝contracts/wire-settings.md §2）
 *
 * req＝三態完備形（Api.SystemManage.UpdateSystemSettingReq）：description 缺席＝不動／JSON null＝清空落 NULL／
 * 有值＝設值（data-model §8 envelope 級三態約定）；settingValue 顯式 null＝後端 2222 拒收（NOT NULL 欄），故其型別不含 null。
 * 成功回 `{data:null, code:"0000", msg:"common.success"}`、不回更新後物件（clarify Q3）；
 * 驗證失敗 2222（biz.systemSettings.invalidValue／notFound）、越權 5003、未認證 8888（契約 §2 錯誤矩陣）。
 * 與讀端同檔一次落齊（契約 §5 兩函式同檔、型別完備）。
 * rev5:rev5-settings.ts fetchUpdateSystemSetting 同名同形（單一 req 物件承載三態 description）。
 */
export function fetchUpdateSystemSetting(req: Api.SystemManage.UpdateSystemSettingReq) {
  return request<null>({
    url: '/systemManage/updateSystemSetting',
    method: 'post',
    data: req
  });
}
