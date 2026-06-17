// [rev3-inline WRAPPER §III.1 008-system-settings ★ START] 首個 rev3-* wrapper 檔
// fork-delta：不改既有 system-manage.ts；view 走直接路徑 import（不經 barrel src/service/api/index.ts、避免 vite stale-export）
import { request } from '../request';

/** 讀全站系統設定（super-only、回全列 KV、不分頁） */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({
    url: '/systemManage/getSystemSettings',
    method: 'get'
  });
}

/** 改單一設定值（super-only、值須對 valueType 驗、變更連同審計同 txn） */
export function fetchUpdateSystemSetting(settingKey: string, settingValue: string) {
  return request<void>({
    url: '/systemManage/updateSystemSetting',
    method: 'post',
    data: { settingKey, settingValue }
  });
}
// [rev3-inline WRAPPER §III.1 008-system-settings ★ END]
