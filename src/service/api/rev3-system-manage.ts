// [rev3-inline WRAPPER]
// rev3 user-management WRITE wrappers (addUser / updateUser / deleteUser / batchDeleteUser).
// 各 fn 於後續任務 T018 / T023 / T028 逐步加入；此骨架檔為 fork-delta 佔位。

import { request } from '../request';

/** add user (rev3 write wrapper → rust-api POST /systemManage/addUser) */
export function fetchAddUser(
  model: Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'>
) {
  return request<null>({ url: '/systemManage/addUser', method: 'post', data: model });
}

/** update user (rev3 write wrapper → rust-api POST /systemManage/updateUser) */
export function fetchUpdateUser(
  model: Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'> & { id: number }
) {
  return request<null>({ url: '/systemManage/updateUser', method: 'post', data: model });
}
