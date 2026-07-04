// BASE-WEB-WRAPPER (004-system-settings)：不改既有 system-manage.ts。
// 設定頁走直接路徑 import（不經 barrel src/service/api/index.ts、避 vite stale-export）。
import { request } from '../request';

/** 讀全站系統設定（super-only、回全列 KV、不分頁） */
export function fetchGetSystemSettings() {
  return request<Api.SystemManage.SystemSetting[]>({
    url: '/systemManage/getSystemSettings',
    method: 'get'
  });
}

/** 改單一設定值（super-only、值須對 settingType 驗、變更連同審計同 txn） */
export function fetchUpdateSystemSetting(settingKey: string, settingValue: string) {
  return request<void>({
    url: '/systemManage/updateSystemSetting',
    method: 'post',
    data: { settingKey, settingValue }
  });
}
