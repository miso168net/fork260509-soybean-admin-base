// [rev6-inline BASE-WEB-ADAPT+ 007-user-password-admin] 使用者管理十端點＋既有 unlockLogin 的 wire 型別新檔——以 declaration merging 開 `Api.UserAdmin` 節、既有 typings 檔零改（specs/007-user-password-admin/contracts/wire-user-admin.md）
declare namespace Api {
  /**
   * 使用者管理域（`/systemManage/*User*` 十端點＋既有 `unlockLogin` 之請求型）。本節即憲法 §I.3 的 wire 權威：
   * `tools/wire-schema.py extract` 由此抽快照、rust 側 `tests/wire_schema.rs` 據快照裁後端 DTO。
   *
   * 自成一節而不掛進 `Api.SystemManage`：該節已有 upstream 的 `User`／`UserSearchParams`／`UserList` 家族，其中 `UserList` 與本節
   * 清單同 URL、欄名與可空性卻不同（偏離帳＝ADR-00083），併入就得逐型改名閃避。
   * 型名與後端 DTO 同名（`handler::user`；`UnlockReq` 為 `handler::throttle` 既有型）、各型欄序＝wire 欄序。分頁回應不另立型：
   * 直接實例化 `Common.PaginatingQueryRecord<UserRecord>`。
   * 欄形出處＝rev5:src/typings/api/rev5-user-admin.d.ts。rev6 差異：`roles` 由角色代碼字串陣列改為 `UserRole` 物件陣列（持有之停用
   * 角色以灰色保留選項呈現、需 id 與名稱）；現役清單 query 多手機與信箱兩篩選欄；更新請求型列入不可變欄 `userName`（出現即拒）——
   * 型別涵蓋 wire 的全部可達形；請求側 `status` 取寬字串（值域外＝缺席或取預設）；addUser 成功回 `null`、不另立回應型。
   */
  namespace UserAdmin {
    /**
     * 清單列（`getUserList`／`getDeletedUsers` 之 `records` 元素）。十四欄恆在場：可空欄 DB NULL 以顯式 `null` 上 wire、不省略欄；
     * 結構上沒有密碼、會話 id 與軟刪欄（回收桶之列序由伺服器固定、不加刪除時間欄）。
     */
    interface UserRecord {
      /** 後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 建立後不可變 */
      userName: string;
      nickName: string | null;
      /** DB 原值之十進位字串、NULL→null；不套狀態欄之二值收斂（「未填」不會變成 `'2'`） */
      userGender: string | null;
      userPhone: string | null;
      /** 大小寫照存 */
      userEmail: string | null;
      /** DB `1`→`'1'`、其餘（含 NULL）→`'2'`；恆非 null */
      status: Common.EnableStatus;
      sessionPolicy: SessionPolicy;
      /** 管理員記事：只上本域兩支清單（不入任何下拉、候選或他 API）——顯示端只准純文字插值 */
      userMemo: string | null;
      /** 持有之角色（含停用、不含已軟刪；角色 id 升冪）；回收桶列恆 `[]` */
      roles: UserRole[];
      /** RFC3339、偏移恆 `+00:00` */
      createdAt: string;
      /** 操作者帳號名（不是 uid）；後端查無對應帳號即 null */
      createdBy: string | null;
      updatedAt: string | null;
      updatedBy: string | null;
    }

    /** `UserRecord.roles` 之元素：抽屜以 `id` 對角色候選、清單以 `roleCode` 串接顯示；`id` 同過 2^53 守衛。 */
    interface UserRole {
      id: number;
      roleCode: string;
      roleName: string;
    }

    /**
     * 帳號之會話政策三值：`inherit`＝跟隨全域設定、`single`＝強制單一會話、`multi`＝允許多會話。讀端為 `UserRecord` 之欄值、請求端
     * 由 `UpdateSessionPolicyReq` 引用；值域外（含大小寫異形）由後端回 `2222 biz.user.sessionPolicyInvalid`。
     */
    type SessionPolicy = 'inherit' | 'single' | 'multi';

    /**
     * 現役清單 query：分頁兩欄沿 `Common.CommonSearchParams`，六個篩選條件皆可空、彼此 AND。帳號名、暱稱、手機、信箱為不分大小寫
     * 子字串（空字串＝不篩選）；`userGender`／`status` 為**字串**形——trim 後恰 `'1'`／`'2'` 才等值篩選、其餘（含空字串）＝不篩選。
     * 不收排序參數；upstream 搜尋卡之首屏物件可直接賦給本型。
     */
    type UserListQuery = CommonType.RecordNullable<
      Common.CommonSearchParams & {
        userName: string;
        nickName: string;
        userGender: string;
        status: string;
        userPhone: string;
        userEmail: string;
      }
    >;

    /** 回收桶清單 query：只收分頁兩欄——回收桶無篩選面，型上不設篩選欄＝送得出的參數就是後端會濾的參數。 */
    type DeletedUserListQuery = CommonType.RecordNullable<Common.CommonSearchParams>;

    /**
     * `addUser` 請求體。帳號名與密碼為前端必送欄（後端寬鬆承載、缺席或 null 交守門判拒）；其餘可缺席：
     *
     * - 可空文字四欄（暱稱、手機、信箱、記事）：缺席、null、空字串一律落 NULL。
     * - `userGender`：trim 後恰 `'1'`／`'2'` 落值、其餘＝NULL；`status`：trim 後恰 `'1'`／`'2'` 落值、其餘（含缺席）＝預設啟用。
     * - `roleIds`：期望指派之角色 id 集；缺席＝零角色；含不存在或已軟刪之 id＝整筆 `2222 biz.user.roleNotFound`。
     *
     * 密碼只進不出（回應 `data` 恆 null）、稽核與日誌皆不帶；政策違規之拒因攜明細（`Api.UserCenter.PasswordPolicyDetail`）。
     */
    interface AddReq {
      userName: string;
      password: string;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      userMemo?: string | null;
      userGender?: string | null;
      status?: string;
      roleIds?: number[];
    }

    /**
     * `updateUser` 請求體（部分更新；ADR-00080 決定 2～4、6）。除 `id` 外皆可缺席＝不動：
     *
     * - 可空文字四欄：null 或空字串＝清空落 NULL、有值＝設值。
     * - `userGender`：null＝清空；trim 後恰 `'1'`／`'2'`＝設值；其餘值（含空字串）＝缺席（打錯值不演成清空）。
     * - `status`：非三態（null＝缺席），trim 後恰 `'1'`／`'2'` 才算出現。
     * - `roleIds`：非三態（null＝缺席＝指派不動）；陣列＝期望全集、全量替換（`[]`＝全撤；界外 id 整筆拒）。
     * - `userName`：建立後不可變——出現（含 null、值同現值亦然）即 `2222 biz.user.userNameImmutable`；組更新 body 時不得帶此欄。
     *
     * 鎖內逐欄值 diff：除 `id` 外全欄缺席、或出現之欄皆同現值＝成功、零寫入、零稽核；本人列送 `status`／`roleIds` 即拒（值不比對）。
     */
    interface UpdateReq {
      id: number;
      userName?: string | null;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      userMemo?: string | null;
      userGender?: string | null;
      status?: string;
      roleIds?: number[];
    }

    /** `deleteUser`（DELETE 動詞、JSON body）／`restoreUser`／`kickUser`（POST）共用的請求體。 */
    interface UserIdReq {
      id: number;
    }

    /** `batchDeleteUser` 請求體（DELETE 動詞、JSON body）；重複 id 由後端先去重、空陣列＝提前成功。 */
    interface UserBatchDeleteReq {
      ids: number[];
    }

    /**
     * `resetUserPassword` 請求體：管理員手輸或產密浮層產生之新密碼。密碼只進不出（回應 `data` 恆 null）；政策違規與設密冷卻之拒因
     * 攜明細（`Api.UserCenter.PasswordPolicyDetail`／`Api.UserCenter.PwdSetTooFrequentDetail`）。
     */
    interface ResetPasswordReq {
      id: number;
      password: string;
    }

    /** `kickUser` 回應：`revoked`＝本次實際撤下之有效票數；`0` 為正常結果（標的本不在線）、不是失敗。 */
    interface KickRes {
      revoked: number;
    }

    /**
     * `updateUserSessionPolicy` 請求體（非部分更新、兩欄必送）：`sessionPolicy` 缺席、null、空字串與值域外一律
     * `2222 biz.user.sessionPolicyInvalid`；同現值＝成功零寫入；改為 `single` 不即時踢除（下次登入生效）。
     */
    interface UpdateSessionPolicyReq {
      id: number;
      sessionPolicy: SessionPolicy;
    }

    /**
     * 既有 `unlockLogin` 之請求體（欄集與 004 刀契約請求表逐欄同）。`dimension` 必送（缺席或值域外＝
     * `2222 biz.throttle.invalidUnlockTarget`）；帳號維帶 `userName`＝帳號名原文（大小寫敏感、零 trim——標的經加工即對不上鎖端之
     * 鍵）；來源維帶 `target`＝位址字面（欄名是 `target`、不是 `ip`），粒度由後端導出。
     */
    interface UnlockReq {
      dimension: 'user' | 'ip';
      userName?: string | null;
      target?: string | null;
    }
  }
}
