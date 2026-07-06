// BASE-WEB-WRAPPER (006-session-lifecycle)：不改既有 auth.ts（upstream Api.Auth 凍結）。
// fetchLogout wrapper——POST /auth/logout 帶 {refreshToken}、回 Res<()>；直接路徑 import
// （不經 barrel src/service/api/index.ts、避 vite stale-export；比照 rev4-auth-stub）。
// 走 axios @sa/axios request 實例。契約＝U7 /auth/logout（Public、{refreshToken}→Res<()>、0000）。
// ★新檔零原行（fork-delta 新增型）。
import { request } from '../request';

/** 登出——帶 refreshToken 通知後端撤銷該工作階段；回 Res<()>（void） */
export function fetchLogout(refreshToken: string) {
  return request<void>({
    url: '/auth/logout',
    method: 'post',
    data: {
      refreshToken
    }
  });
}
