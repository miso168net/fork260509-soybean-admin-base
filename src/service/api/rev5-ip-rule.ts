// [rev5-inline BASE-WEB-WRAPPER+ 004-ip-trust-anchor] IP 規則 service 接線層新檔（§III.1 預設軌道；contracts/wire-ip-rule.md）——不改既有 service 檔。
// ★本檔不列入 barrel src/service/api/index.ts，消費端（views/manage/ip-rule/）以直接路徑
// import 本模組——沿 rev5-settings.ts／rev5-auth.ts 先例（rev4 自陳理由＝避 vite stale-export）。
// 註：`from '../request'` 是 base-web 既有 service 檔的通例（auth.ts／system-manage.ts 皆同形）。
//
// ★五支的動詞逐條對齊 contracts：讀端 GET＋params、寫端三支 POST＋JSON body，
// ★`deleteIpRule` 走 **DELETE 動詞＋JSON body**（rev5 首條 DELETE 業務 route）。
// ★拒因一律不在此處加工：`2222` 系列（invalidCidr／invalidRuleType／conflict／selfLock／
// notFound）由 service/request 的共用攔截層轉譯 `backend.biz.ipRule.*` 後 toast，
// 呼叫端只看 `error` 是否為真即可（頁內零拒因專屬 UI）。
import { request } from '../request';

/**
 * 讀規則清單（`GET /systemManage/getIpRuleList`；契約＝contracts §1）
 *
 * 回 `{current, size, total, records}` 分頁形；`deleted` 三態 filter **缺省＝`all`**（現役與
 * 回收桶混排），故本頁的回收桶不是另一支端點、而是同一支換 filter。
 * 授權＝Policy（casbin seed 政策列、R_SUPER only）；越權 `5003`／未認證 `8888`。
 * rev4: 承 rev4-ip-rule.ts fetchGetIpRuleList 同名形。
 */
export function fetchGetIpRuleList(params?: Api.IpRule.ListQuery) {
  return request<Api.IpRule.ListRes>({
    url: '/systemManage/getIpRuleList',
    method: 'get',
    params
  });
}

/**
 * 新增規則（`POST /systemManage/addIpRule`；契約＝contracts §2）
 *
 * 後端處理序＝類型守門 → 網段解析＋主機位元正規化 → **防自鎖**（以變更後規則集對操作者
 * 當下真實來源重判，判 Deny 即 `2222 biz.ipRule.selfLock`、零落庫）→ 落庫（與操作稽核同一
 * 交易；partial unique 衝突映 `2222 biz.ipRule.conflict`）→ 重載判定面＋發門鈴。
 * ★**成功後前端零追加「生效」呼叫**：後端自行重載並廣播，本層只需讓呼叫端刷新清單。
 * rev4: 承 rev4-ip-rule.ts fetchAddIpRule 同名形。
 */
export function fetchAddIpRule(data: Api.IpRule.AddReq) {
  return request<null>({
    url: '/systemManage/addIpRule',
    method: 'post',
    data
  });
}

/**
 * 更新規則（`POST /systemManage/updateIpRule`；契約＝contracts §3）
 *
 * 四欄皆可改；防自鎖的「變更後規則集」＝**移除舊值＋加入新值**後的集合。
 * 標的不存在或已軟刪 → `2222 biz.ipRule.notFound`。
 * rev4: 承 rev4-ip-rule.ts fetchUpdateIpRule 同名形。
 */
export function fetchUpdateIpRule(data: Api.IpRule.UpdateReq) {
  return request<null>({
    url: '/systemManage/updateIpRule',
    method: 'post',
    data
  });
}

/**
 * 軟刪規則（★`DELETE /systemManage/deleteIpRule` ＋ JSON body；契約＝contracts §4）
 *
 * `deleted_at`／`deleted_by` 成對寫。★**刪除同樣要過防自鎖**——刪掉一條 allow 規則可能使
 * 操作者自己失去放行（變更後規則集＝移除該列後的集合）。
 * 標的不存在或已在回收桶 → `2222 biz.ipRule.notFound`。
 * rev4: 承 rev4-ip-rule.ts fetchDeleteIpRule 同名形（散參 id、body 由本層組）。
 */
export function fetchDeleteIpRule(id: number) {
  return request<null>({
    url: '/systemManage/deleteIpRule',
    method: 'delete',
    data: { id }
  });
}

/**
 * 復原規則（`POST /systemManage/restoreIpRule`；契約＝contracts §5）
 *
 * `deleted_at`／`deleted_by` 成對清空；防自鎖的「變更後規則集」＝**加入該列**後的集合。
 * 標的不存在或非回收桶狀態 → `2222 biz.ipRule.notFound`；復原後與現有有效列撞唯一鍵 →
 * `2222 biz.ipRule.conflict`。
 * rev4: 承 rev4-ip-rule.ts fetchRestoreIpRule 同名形。
 */
export function fetchRestoreIpRule(id: number) {
  return request<null>({
    url: '/systemManage/restoreIpRule',
    method: 'post',
    data: { id }
  });
}
