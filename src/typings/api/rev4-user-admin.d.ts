// BASE-WEB-ADAPT (011-user-admin)：新增 typings 檔，不改凍結 system-manage.d.ts（upstream Api.SystemManage 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；本刀寫端請求形＋回收桶讀端參（camelCase wire、contracts 型別節）。
// UserSearchParams 沿凍結形（getUserList 複用凍結 fetchGetUserList、零重建）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace SystemManage {
    /** 會話策略值域（006 解析階層：inherit=跟隨全站／single=單一在線／multi=多處在線；FR-034） */
    type UserSessionPolicy = 'inherit' | 'single' | 'multi';

    /**
     * 使用者列 wire 實形＝凍結 `User`＋`sessionPolicy` 併欄（contracts 型別節「sessionPolicy 併入 User 型」）
     *
     * ★凍結 `User` 為 type alias、TS 僅 interface 可跨檔 declaration merging——以交叉型別承載併欄；
     * 後端 UserRecord 恆序列化 sessionPolicy（getUserList／getDeletedUsers 每列皆含）、
     * drawer session_policy select 讀現值之唯一真源（MUST NOT 以預設值渲染致 diff 誤判、FR-034）。
     */
    type UserWithSessionPolicy = User & { sessionPolicy: UserSessionPolicy };

    /**
     * 新增使用者請求（POST addUser；contracts #2）
     *
     * userName／password／status 必填＋userGender?／nickName?／userPhone?／userEmail?／userRoles? 選填
     * （userRoles＝role code 字串陣列、後端 txn 內 code→id 映射＋鎖內活性驗證）；
     * 2222 userNameInvalid／passwordPolicy〔data 帶違規清單〕／userNameExists／roleNotFound。
     */
    type AddUserReq = {
      userName: string;
      password: string;
      status: Api.Common.EnableStatus;
      userGender?: UserGender | null;
      nickName?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      userRoles?: string[];
    };

    /**
     * 更新使用者請求（POST updateUser；contracts #3）
     *
     * userName 收但不可變——後端比對現值、不同即 userNameImmutable 拒（FR-006 拒絕路徑的 wire 載體、
     * 鏡像 009 roleCode／010 routeName 手法）；全欄 Partial、★diff 全等 no-op 以「值 vs 現值」為基準
     * （FR-007）；可空字串欄（nickName／userPhone／userEmail）送 ''＝清空、userGender 不可清（B-026 部分兌現）。
     */
    type UpdateUserReq = { id: number } & Partial<{
      userName: string;
      status: Api.Common.EnableStatus;
      userGender: UserGender | null;
      nickName: string | null;
      userPhone: string | null;
      userEmail: string | null;
      userRoles: string[];
    }>;

    /** 重設密碼請求（POST resetUserPassword；contracts #7；2222 passwordPolicy〔data 帶違規清單〕／userNotFound） */
    type ResetUserPasswordReq = {
      id: number;
      password: string;
    };

    /** 踢除使用者請求（POST kickUser；contracts #6；全撤 session、7777 阻斷體驗；2222 cannotKickSelf／userNotFound） */
    type KickUserReq = {
      id: number;
    };

    /** 更新會話策略請求（POST updateUserSessionPolicy；contracts #10；值域驗＋no-op、下次登入依 006 階層收斂） */
    type UpdateUserSessionPolicyReq = {
      id: number;
      sessionPolicy: UserSessionPolicy;
    };

    /** 復原使用者請求（POST restoreUser；contracts #9；零回灌＝復原後零角色、status 保留刪除前原值） */
    type RestoreUserReq = {
      id: number;
    };

    /** 回收桶查詢參數（GET getDeletedUsers；contracts #8；deleted_at DESC 分頁、current/size） */
    type DeletedUserListReq = CommonSearchParams;

    /**
     * 解鎖登入請求（POST unlockLogin；007 既有端點、008 維度欄擴充）
     *
     * dimension 'user'＝帳號維（userName 必填）／'ip'＝IP 源維（target 必填、IP 位址字面）；
     * 2222 backend.biz.unlock.invalidTarget／invalidDimension（FR-036）。
     */
    type UnlockLoginReq = {
      dimension: 'user' | 'ip';
      userName?: string;
      target?: string;
    };
  }
}
