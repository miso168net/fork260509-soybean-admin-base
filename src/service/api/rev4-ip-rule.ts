// BASE-WEB-WRAPPER (013-ip-rule-admin)：新增 service 檔，不改凍結 system-manage.ts。
// IP 規則五 fetcher＝讀端（get＋params 含三 filter）＋寫端四（add/update post、★delete 用 DELETE 動詞＋data、restore post＋data）；
// 動詞逐條對齊 contracts §6 fetcher 對帳表；★id 一律 number（2^53 守衛後端擔保、不需 String 轉換）。
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

/** 讀 IP 規則清單（GET getIpRuleList；PageRes<IpRuleRecord>；hybrid 混排含軟刪、三 filter＝wbipCidr 模糊／wbipType 等值／deleted 三態，皆可空） */
export function fetchGetIpRuleList(params?: Api.SystemManage.IpRuleListQuery) {
  return request<Api.SystemManage.IpRuleList>({
    url: '/systemManage/getIpRuleList',
    method: 'get',
    params
  });
}

/** 新增 IP 規則（POST addIpRule；cidr 經後端 normalize_cidr 正規化落庫；2222 invalidCidr／invalidRuleType／conflict／selfLock） */
export function fetchAddIpRule(data: Api.SystemManage.AddIpRuleReq) {
  return request<null>({
    url: '/systemManage/addIpRule',
    method: 'post',
    data
  });
}

/** 更新 IP 規則（POST updateIpRule；四欄皆可改、改動唯一鍵可能 conflict；2222 另含 notFound） */
export function fetchUpdateIpRule(data: Api.SystemManage.UpdateIpRuleReq) {
  return request<null>({
    url: '/systemManage/updateIpRule',
    method: 'post',
    data
  });
}

/** 刪除 IP 規則（★DELETE deleteIpRule＋JSON body；軟刪；2222 selfLock／notFound；照 fetchDeleteMenu 等既有先例） */
export function fetchDeleteIpRule(id: number) {
  return request<null>({
    url: '/systemManage/deleteIpRule',
    method: 'delete',
    data: { id }
  });
}

/** 復原 IP 規則（POST restoreIpRule；已 active＝冪等 0000、重入 partial-uniq→conflict；2222 另含 selfLock／notFound） */
export function fetchRestoreIpRule(id: number) {
  return request<null>({
    url: '/systemManage/restoreIpRule',
    method: 'post',
    data: { id }
  });
}
