// BASE-WEB-ADAPT (009-role-admin)：新增 typings 檔，不改凍結 system-manage.d.ts（upstream Api.SystemManage 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；本 US1 寫端請求形（camelCase wire、contracts P1）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace SystemManage {
    /** 新增角色請求（POST addRole；roleName/roleCode/roleDesc/status 四欄、contracts P1 #3） */
    type AddRoleReq = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;

    /**
     * 更新角色請求（POST updateRole；contracts P1 #4）
     *
     * roleCode 收但不可變——後端比對現值、不同即 codeImmutable 拒（FR-006 拒絕路徑的 wire 載體）；
     * 全欄皆 optional（Partial）＝全 None 時後端 no-op 不 bump 時戳（B-050）。
     */
    type UpdateRoleReq = { id: number } & Partial<
      Pick<Api.SystemManage.Role, 'roleCode' | 'roleName' | 'roleDesc' | 'status'>
    >;

    /**
     * 端點（path＋method 二元組；contracts P2 #16）
     *
     * getAllEndpoints 回應項＝updateRoleEndpoints desired 項、同形共用（endpoint-auth-modal 候選與現況）。
     */
    type Endpoint = {
      path: string;
      method: string;
    };

    /** 更新角色 menu 授權請求（POST updateRoleMenu；contracts P2 #8；menuIds＝勾選 menu id 全集） */
    type UpdateRoleMenuReq = {
      roleId: number;
      menuIds: number[];
    };

    /** 更新角色 button 授權請求（POST updateRoleButton；contracts P2 #10；buttons＝勾選 button code 全集） */
    type UpdateRoleButtonReq = {
      roleId: number;
      buttons: string[];
    };

    /** 更新角色 endpoint 授權請求（POST updateRoleEndpoints；contracts P2 #12；endpoints＝勾選 (path,method) 全集） */
    type UpdateRoleEndpointsReq = {
      roleId: number;
      endpoints: Endpoint[];
    };

    /** 更新角色首頁請求（POST updateRoleHome；contracts P2 #18；寫端不驗一致性、讀端兜底 FR-039） */
    type UpdateRoleHomeReq = {
      roleId: number;
      home: string;
    };
  }
}
