// BASE-WEB-WRAPPER (010-menu-admin)：新增 service 檔，不改凍結 system-manage.ts（fetchGetMenuList 沿 barrel 復用、★絕不重建）。
// US1 寫端 4 fetcher（addMenu/updateMenu＝POST；deleteMenu/batchDeleteMenu＝★DELETE、動詞逐條對齊 contracts P1）＋回收桶 2 fetcher（getDeletedMenus/restoreMenu、本單元僅建、UI 消費在 U9）；
// ★直接路徑 import request、不經 barrel src/service/api/index.ts（避 vite stale-export）；★新檔零原行。
import { request } from '../request';

/** 新增選單（POST addMenu；成功後零授權、sidebar 不現＝FR-004 兩步流；成功即列表刷新、授權未下放） */
export function fetchAddMenu(data: Api.SystemManage.AddMenuReq) {
  return request<null>({
    url: '/systemManage/addMenu',
    method: 'post',
    data
  });
}

/** 更新選單（POST updateMenu；routeName／menuType 後端不可變、全 None→no-op） */
export function fetchUpdateMenu(data: Api.SystemManage.UpdateMenuReq) {
  return request<null>({
    url: '/systemManage/updateMenu',
    method: 'post',
    data
  });
}

/** 刪除選單（★DELETE deleteMenu；軟刪入回收桶） */
export function fetchDeleteMenu(id: number) {
  return request<null>({
    url: '/systemManage/deleteMenu',
    method: 'delete',
    data: { id }
  });
}

/** 批次刪除選單（★DELETE batchDeleteMenu；逐項驗證整批拒 no-partial、一項違規整批零變更） */
export function fetchBatchDeleteMenu(ids: number[]) {
  return request<null>({
    url: '/systemManage/batchDeleteMenu',
    method: 'delete',
    data: { ids }
  });
}

// ── US3 回收桶（2）＝2 fetcher（本單元僅建 fetcher、UI 消費在 U9）──

/** 讀已刪選單列表（GET getDeletedMenus；分頁；★消費在 U9） */
export function fetchGetDeletedMenus(params?: Api.SystemManage.GetDeletedMenusParams) {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getDeletedMenus',
    method: 'get',
    params
  });
}

/** 復原選單（POST restoreMenu；★消費在 U9） */
export function fetchRestoreMenu(id: number) {
  return request<null>({
    url: '/systemManage/restoreMenu',
    method: 'post',
    data: { id }
  });
}
