// [rev6-inline BASE-WEB-WRAPPER+ 004-ip-trust-anchor] IP 規則管理五端點的請求包裝新檔（§III.1 WRAPPER 軌道；specs/004-ip-trust-anchor/contracts/wire-ip-rule.md）——既有 service 檔零改、不入 barrel
// 不入 `service/api/index.ts`：消費端（`views/manage/ip-rule/`）以直接路徑 import，同 `rev6-settings.ts`／`rev6-auth.ts`。
// 五支皆不加工失敗原因：業務拒絕（`2222` 家族）與 HTTP 層拒絕的提示由 `service/request` 的 onError 鏈轉譯後統一出 toast，
// 呼叫端只判回傳的 `error` 有無。寫端成功後後端自行重載判定面並廣播、前端不需追加任何「生效」請求。
// 帳號解鎖端點不在本檔：憲法 §III.2 MANAGE-PAGE-WIRING 列明文把解鎖按鈕與其前端包裝排除在本次授權之外。
// 出處：rev5:src/service/api/rev5-ip-rule.ts（五支同名、動詞同形）。
import { request } from '../request';

/** 讀規則清單（`GET /systemManage/getIpRuleList`；契約 §1）。回收桶不是另一支端點＝同一支換 `deleted` 篩選值；列序由伺服器固定為 id 降冪。 */
export function fetchGetIpRuleList(params?: Api.IpRule.IpRuleListQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.IpRule.IpRuleRecord>>({
    url: '/systemManage/getIpRuleList',
    method: 'get',
    params
  });
}

/** 新增規則（`POST /systemManage/addIpRule`；契約 §2）。網段由後端正規化後落庫；會把操作者自己擋在門外的規則當場被拒、零寫入。 */
export function fetchAddIpRule(data: Api.IpRule.IpRuleAddReq) {
  return request<null>({
    url: '/systemManage/addIpRule',
    method: 'post',
    data
  });
}

/** 更新規則（`POST /systemManage/updateIpRule`；契約 §3）。四個內容欄全量覆寫；標的須為現役列。 */
export function fetchUpdateIpRule(data: Api.IpRule.IpRuleUpdateReq) {
  return request<null>({
    url: '/systemManage/updateIpRule',
    method: 'post',
    data
  });
}

/** 軟刪規則（契約 §4）。★動詞為 DELETE 且 `id` 走 JSON body、不走 query；刪掉放行規則同樣可能因防自鎖被拒。 */
export function fetchDeleteIpRule(id: number) {
  const data: Api.IpRule.IpRuleIdReq = { id };

  return request<null>({
    url: '/systemManage/deleteIpRule',
    method: 'delete',
    data
  });
}

/** 自回收桶復原規則（`POST /systemManage/restoreIpRule`；契約 §5）。復原後若與現役列撞唯一鍵，後端以業務錯誤拒絕。 */
export function fetchRestoreIpRule(id: number) {
  const data: Api.IpRule.IpRuleIdReq = { id };

  return request<null>({
    url: '/systemManage/restoreIpRule',
    method: 'post',
    data
  });
}
