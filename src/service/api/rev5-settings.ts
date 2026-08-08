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
 * rev4: 承 rev4-system-settings.ts fetchGetSystemSettings 同名形；寫端
 * fetchUpdateSystemSetting 歸 T023（三態 req 型別隨寫端刀落）。
 */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({
    url: '/systemManage/getSystemSettings',
    method: 'get'
  });
}
