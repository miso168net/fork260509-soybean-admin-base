// [rev6-inline BASE-WEB-ADAPT+ 006-authz-governance] 授權治理十端點的 wire 型別新檔——以 declaration merging 開 `Api.Authz` 節、既有 typings 檔零改（specs/006-authz-governance/contracts/wire-authz-governance.md、wire-policy-archive.md）
declare namespace Api {
  /**
   * 授權治理域：角色三維授權（選單／按鈕／端點）的現況讀與全量替換寫、兩支候選讀，連同授權回收桶的清單與復原，十端點共用本節
   * 這一個命名空間。本節即憲法 §I.3 的 wire 權威：`tools/wire-schema.py extract` 由此抽快照、rust 側 `tests/wire_schema.rs`
   * 據快照裁後端 DTO（`handler::role` 的授權段與 `handler::policy_archive`）。
   *
   * 自成一節而不併進 `Api.RoleAdmin`：角色列 CRUD 與授權列治理是兩種資源，回收桶頁也不屬角色頁。型名與後端 DTO 同名、各型
   * 欄序＝wire 欄序；可空欄一律寫成 `T | null`（鍵恆在場、不省略）；角色鍵一律 `id`。本節不宣告泛型：寫端三支回應各自具體
   * 成型（抽取器遇泛型別名不產可裁的 definition），清單回應由 wrapper 直接實例化既有的 `Api.Common.PaginatingQueryRecord`。
   * 欄形出處＝rev5:src/typings/api/rev5-role-admin.d.ts（三維授權段與回收桶段）。rev6 差異：兩段併成一節；泛型寫端回應拆成
   * 三支具體型；現況讀查詢與復原請求立具名型（rev5 為行內 `{ id }`）；清單回應不另立別名。
   */
  namespace Authz {
    /**
     * 端點維的一鍵：（路徑, HTTP 方法）＝端點維授權列的政策鍵。getAllEndpoints 每項恰此兩鍵——候選項不帶受保護旗標、也不帶封死
     * 預標；同時是 `UpdateRoleEndpointsReq.endpoints` 與 `RoleEndpointGrantRes.effective` 的元素型。
     */
    interface Endpoint {
      path: string;
      /** HTTP 動詞的大寫字面 */
      method: string;
    }

    /**
     * getRoleMenu 的項（該角色現況與治理域候選的交集）。`protected`＝該授權列的受保護旗標、後端是唯一真源：前端據以鎖定節點，
     * 不得用靜態清單自行推斷。
     */
    interface RoleMenuItem {
      /** 選單 id（授權列的路由名經治理域反查而得）；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      protected: boolean;
    }

    /** getRoleButton 的項：按鈕碼加該授權列的受保護旗標（旗標語意同 `RoleMenuItem`）。 */
    interface RoleButtonItem {
      code: string;
      protected: boolean;
    }

    /** getRoleEndpoints 的項：`Endpoint` 兩鍵加該授權列的受保護旗標（旗標語意同 `RoleMenuItem`）。 */
    interface RoleEndpointItem {
      path: string;
      method: string;
      protected: boolean;
    }

    /**
     * updateRoleMenu 的成功回應。`revoked`／`granted`＝這次在候選範圍內實際撤掉／新授的列數（期望集與現況相同時兩者皆 0、仍算成功）；
     * `effective`＝生效集合（期望集剔除候選外的項並去重、保留首見次序），恆為陣列、空集也送 `[]`。
     */
    interface RoleMenuGrantRes {
      revoked: number;
      granted: number;
      /** 元素＝選單 id（後端逐元素過 2^53 守衛） */
      effective: number[];
    }

    /** updateRoleButton 的成功回應：欄義同 `RoleMenuGrantRes`，`effective` 的元素＝按鈕碼。 */
    interface RoleButtonGrantRes {
      revoked: number;
      granted: number;
      effective: string[];
    }

    /** updateRoleEndpoints 的成功回應：欄義同 `RoleMenuGrantRes`，`effective` 的元素＝`Endpoint`。 */
    interface RoleEndpointGrantRes {
      revoked: number;
      granted: number;
      effective: Endpoint[];
    }

    /**
     * updateRoleMenu 的請求體。`menuIds`＝期望全集（選單 id）：現有的受保護項必須原樣帶回、少帶即整批拒；次序與重複不影響結果。
     * 兩欄都必送——期望集的鍵缺席或拼錯時，後端把整包當壞形（＝查無角色）而不是當全撤；要全撤只能送顯式的空陣列。
     */
    interface UpdateRoleMenuReq {
      id: number;
      menuIds: number[];
    }

    /** updateRoleButton 的請求體：`buttons`＝期望全集（按鈕碼）；送法規則同 `UpdateRoleMenuReq`。 */
    interface UpdateRoleButtonReq {
      id: number;
      buttons: string[];
    }

    /**
     * updateRoleEndpoints 的請求體：`endpoints`＝期望全集，每個元素的兩鍵都必填（缺一即整包壞形）；送法規則同 `UpdateRoleMenuReq`。
     * 替 R_SUPER 以外的角色授予受保護端點會整批被拒。
     */
    interface UpdateRoleEndpointsReq {
      id: number;
      endpoints: Endpoint[];
    }

    /** 三支現況讀端（getRoleMenu／getRoleButton／getRoleEndpoints）共用的 query：`id`＝標的角色 id。 */
    interface RoleIdQuery {
      id: number;
    }

    /** 回收桶列的維度：後端由 `v2` 推導——`menu`／`button` 照字面，其餘（HTTP 方法）一律歸 `endpoint`。 */
    type ArchivedPolicyDimension = 'menu' | 'button' | 'endpoint';

    /**
     * 回收桶的一列（getArchivedPolicies 之 `records` 元素）。十四欄恆在場；`ptype` 與 `v0`～`v5` 是被撤授權列的快照、原樣過境。
     * `restorable` 是列表當下推得的旗標、不具權威：前端只拿它切換復原鈕的停用態，真正能否復原由後端在復原時鎖內重驗。
     */
    interface ArchivedPolicy {
      /** 歸檔列 id（復原請求鍵）；後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      ptype: string;
      /** 來源角色代碼 */
      v0: string;
      /** 授權標的（路由名、按鈕碼或路徑） */
      v1: string;
      /** 維度標記（`menu`／`button`）或 HTTP 方法 */
      v2: string;
      v3: string;
      v4: string;
      v5: string;
      /** 歸檔原因的封閉詞彙原字面——不翻譯、顯示端只准純文字插值 */
      archiveReason: string;
      /** RFC3339、偏移恆為 `+00:00` */
      archivedAt: string;
      /** 歸檔者帳號名（不是 uid）；未記錄或查無對應帳號即 null */
      archivedBy: string | null;
      /** 來源角色 id（過 2^53 守衛）；未記錄時送顯式 null、該列恆不可復原 */
      roleId: number | null;
      restorable: boolean;
      dimension: ArchivedPolicyDimension;
    }

    /**
     * 回收桶清單的 query：分頁兩欄沿 `Common.CommonSearchParams`，另兩個篩選條件，四欄皆可空。`roleCode` 以等值比對來源角色代碼
     * （空字串＝不篩選）；`dimension` 恰為三值之一才篩選，其餘值一律不濾。
     */
    type ArchivedPolicyListQuery = CommonType.RecordNullable<
      Common.CommonSearchParams & {
        roleCode: string;
        dimension: ArchivedPolicyDimension;
      }
    >;

    /** restorePolicy 的請求體：`id`＝歸檔列 id。 */
    interface RestorePolicyReq {
      id: number;
    }
  }
}
