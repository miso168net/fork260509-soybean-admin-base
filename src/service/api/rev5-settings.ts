// [rev5-inline BASE-WEB-WRAPPER+ 002-system-settings] 系統設定 service 接線層新檔（§III.1 預設軌道；contracts §5、ADR 0018）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（未來的設定頁 view、B-008）以直接路徑
// import 本模組——rev4: rev4-system-settings.ts 自陳理由＝避 vite stale-export。
// 註：下一行的 `from '../request'` 是 base-web 既有 service 檔的通例（auth.ts／system-manage.ts
// 皆同形），barrel 本來就不曝 request——「不經 barrel」講的是本模組的出口、不是 request 的入口。
import { request } from '../request';

/**
 * 讀全部系統設定（`GET /systemManage/getSystemSettings`；讀端契約＝contracts §1）
 *
 * 成功回 `{data: SystemSetting[16], code:"0000", msg:"common.success"}`——16 鍵固定集、
 * settingKey 升冪穩定序、僅未刪列、非分頁（PageRes 不適用——spec FR-003）。
 * 授權＝Policy（casbin seed 政策列 66、R_SUPER only）；越權 5003／未認證 8888（contracts §2）。
 * 型別消費 rev5-settings.d.ts（T013、declaration merging 併入 Api.SystemManage）——
 * 未來 view 刀（B-008）接上即用、不需回頭補型別（spec FR-025）。
 * rev4: 承 rev4-system-settings.ts fetchGetSystemSettings 同名形。
 */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({
    url: '/systemManage/getSystemSettings',
    method: 'get'
  });
}

/**
 * 改單一設定值（`POST /systemManage/updateSystemSetting`；寫端契約＝contracts §2）
 *
 * req＝三態完備形（Api.SystemManage.UpdateSystemSettingReq、T013）：description 欄
 * 缺席＝不動／`null`＝清空落 NULL／有值＝設值（ADR 0023）；settingValue 顯式 null＝
 * 後端 2222 拒收（NOT NULL 欄清空非法）、故其型別不含 null。
 * 成功回 `{data:null, code:"0000", msg:"common.success"}`；驗證失敗 2222
 * （invalidValue／notFound）、越權 5003、未認證 8888（contracts §2 錯誤矩陣）。
 * rev4: 承 rev4-system-settings.ts fetchUpdateSystemSetting 同名形；rev5 差異＝
 * 兩散參（settingKey, settingValue）改單一 req 物件、承載三態 description
 * （research R3 第 1 筆——UpdateReq 含三態欄、rev4 僅二欄）。
 */
export function fetchUpdateSystemSetting(req: Api.SystemManage.UpdateSystemSettingReq) {
  return request<null>({
    url: '/systemManage/updateSystemSetting',
    method: 'post',
    data: req
  });
}
