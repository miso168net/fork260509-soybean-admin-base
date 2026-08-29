// [rev5-inline BASE-WEB-ADAPT+ 007-user-password-admin] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-user-admin.md、同軌先例＝rev5-role-admin.d.ts／rev5-menu-admin.d.ts）。
declare namespace Api {
  /**
   * user 管理（`/systemManage/*User*` 十端點；contracts/wire-user-admin.md §1~§10）
   *
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（沿 rev5-role-admin.d.ts／rev5-ip-rule.d.ts
   * 拍板理由）：demo 殼的 `User`／`UserSearchParams`／`UserList` 同名家族仍住在凍結的
   * system-manage.d.ts，併入就得逐支改名閃避；獨立命名空間讓消費端寫 `Api.UserAdmin.UserRecord`，
   * 前綴由命名空間本身承擔。
   * rev4: 承 rev4-user-admin.d.ts 的請求／回應**欄形**，但 rev4 併入 `Api.SystemManage` 且讀端復用
   * demo 型（`createBy` id 字串／`createTime`）＝rev5 差異點（research R2#13／#14）——rev5 讀端 wire
   * 依拍板換 `createdAt` RFC3339／`createdBy` 帳號名 enrich（004 慣例），demo 型欄名對不上、必須自持。
   */
  namespace UserAdmin {
    /**
     * 會話政策三值（contracts §共用型 `SessionPolicy`）：`inherit`＝跟隨全域設定、
     * `single`＝單一裝置、`multi`＝多裝置並存。值域外由後端回 `2222 biz.user.sessionPolicyInvalid`。
     * ★rev5 無同義既有型（`Api.Common.EnableStatus` 只涵蓋二值枚舉），故本命名空間自持。
     */
    type SessionPolicy = 'inherit' | 'single' | 'multi';

    /**
     * 使用者列 wire 形（`getUserList`／`getDeletedUsers` 之 `records` 元素；contracts §共用型 `UserRecord`）
     *
     * - ★**結構性無 `password`／`sessionId` 欄**：後端逐欄構造、欄集本身即防線（島 I5 三重不洩）；
     *   前端型面同樣不得補這兩欄回來。
     * - `status` 恆 `'1'|'2'`（後端 `db_status_to_wire` 二值收斂、非 null）——契約稱之 `UserStatus`，
     *   rev5 既有同義型＝`Api.Common.EnableStatus`（FR-039「status `'1'|'2'`」照三頁既有慣例），
     *   故不另立一份二值別名。
     * - `userGender` ★契約逐字 `string | null`、**不**是二值枚舉：後端誠實 `to_string`（DB `Option<i16>`
     *   直轉、`None`→`null`），未套 status 那顆二值收斂器——把「未填」收成 `'2'` 等於拿一個看起來
     *   像值的東西蓋掉「沒填」。渲染端據此須自行收斂值域（見 views/manage/user/index.vue 的性別欄）。
     * - `userMemo` ★管理員備註＝使用者可寫的自由文字，渲染端 MUST 純文字插值（FR-015；機器守＝
     *   tools/view-render-guard.py）。
     * - `roles`＝該使用者現有指派的角色 **code** 陣列（口徑＝成員身分：濾已軟刪角色、★不濾角色
     *   `status`）；空陣列＝未掛角色，回收桶列恆空（契約 §2）。
     * - `createdBy`／`updatedBy`＝操作者**帳號名**（後端批次 enrich、查無即 `null`），不是 id。
     * - ★軟刪欄不上 wire：回收桶列的刪除時間不入本型（rev4 的 `deletedAt` 孤兒鍵不帶回——R2#28），
     *   回收桶的次序語意由契約 §2 的 `deleted_at DESC, id DESC` 承載。
     */
    type UserRecord = {
      /** 主鍵；後端 i64 過 2^53 fail-loud 守衛後以 JSON number 上 wire（憲法 §I.3） */
      id: number;
      /** 登入帳號名——★建立後不可變（`updateUser` 出現即拒 `userNameImmutable`） */
      userName: string;
      /** 暱稱（★誠實 null：DB 欄可空、新增時亦為選填；rev4 空字串摺疊形不帶回） */
      nickName: string | null;
      /** 性別字面（現行值域 `'1'`＝男／`'2'`＝女；契約為 `string | null`、見型 doc） */
      userGender: string | null;
      userPhone: string | null;
      userEmail: string | null;
      /** `'1'`＝啟用｜`'2'`＝停用（wire 契約字串枚舉、恆非 null） */
      status: Api.Common.EnableStatus;
      sessionPolicy: SessionPolicy;
      /** 管理員備註（★渲染端 MUST 純文字插值） */
      userMemo: string | null;
      /** 現役角色 code 集（成員身分口徑；回收桶列恆 `[]`） */
      roles: string[];
      /** RFC3339 帶 offset 字面 */
      createdAt: string;
      createdBy: string | null;
      updatedAt: string | null;
      updatedBy: string | null;
    };

    /**
     * 現役清單查詢參數（`GET getUserList`；contracts §共用型 `UserSearchParams`）
     *
     * ★**恰四個過濾欄**：`userName`／`nickName` **模糊**（空字串＝未設）、`status`／`userGender`
     * **等值**（值域外後端沉默＝不濾）；`current`／`size` 沿 §I.3 分頁形。
     * ★demo 殼的搜尋卡另有手機／信箱兩欄，**不在本契約的過濾面內**——本型刻意不補那兩欄，
     * 讓「送得出去的參數」與「後端真的會濾的欄」在型面上一致。
     */
    type ListQuery = CommonType.RecordNullable<
      {
        userName: string;
        nickName: string;
        status: Api.Common.EnableStatus;
        userGender: string;
      } & Common.CommonSearchParams
    >;

    /**
     * 回收桶清單查詢參數（`GET getDeletedUsers`；contracts §2）：★**只收分頁參**——
     * 已刪清單無過濾欄，故已刪模式的搜尋卡誠實隱藏（防「搜了沒反應」）。
     */
    type DeletedListQuery = CommonType.RecordNullable<Common.CommonSearchParams>;

    /** 清單回應（現役與回收桶共用；沿 §I.3 分頁形 `{current, size, total, records}`＝後端 envelope::PageRes） */
    type ListRes = Common.PaginatingQueryRecord<UserRecord>;

    /**
     * 新增請求（`POST addUser`；contracts §3）
     *
     * `status` 缺席（或 null）＝預設啟用 `'1'`；`roleIds` 缺席＝`[]`（不掛角色）；四個可空字串欄
     * 之空字串由後端 `blank_to_none` 落 `None`（來回等價，表單以空字串承載「沒填」即可——★這是
     * **新增**專屬的收斂，更新端走三態、見 `UpdateReq`）。
     * ★`password` 為明文上行、後端 argon2id 落庫；回應、稽核 payload 與日誌三面皆不得帶回（島 I5）。
     */
    type AddReq = {
      userName: string;
      password: string;
      nickName?: string;
      userGender?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      status?: Api.Common.EnableStatus;
      /** 期望指派的角色 id 集（界外／已軟刪 id → 整筆拒 `roleNotFound`） */
      roleIds?: number[];
      userMemo?: string | null;
    };

    /** 新增回應（contracts §3：`data: { id: number }`）——★恰一欄，新列其餘欄由前端重拉清單取得。 */
    type AddRes = {
      id: number;
    };

    /**
     * 更新請求（`POST updateUser`；contracts §4；三態語意＝ADR 0023）
     *
     * ★**結構性無 `userName` 欄**：契約「出現即拒」（`2222 userNameImmutable`、值不比對）——
     * rev4 的「等值放行」為 rev5 差異點不帶回（R2#2），型別層把誤送直接擋在編譯期，呼叫端
     * 因此**不得散開整列 record 組 body**。
     * ★五個可空欄＝真三態：**缺席＝不動／`null`＝清空／有值＝設值**。契約 §4 的欄形速寫在
     * `nickName` 上漏了 `| null`（與 §共用型 `nickName` 那筆已勘誤的落字之誤同源、同一欄），
     * 但同節散文逐字寫著「三態：缺席＝不動、null＝清空」且後端該欄走 `tristate`
     * （`Option<Option<String>>`）——故此處逐欄比照其餘四欄補上 `| null`。★**這一格是必要的**：
     * 更新端**不走** `blank_to_none`，表單把空字串原樣送出即是「設成空字串」＝對一個原本為 NULL
     * 的欄造出一次真變更（值 diff 判定會判有變、no-op 零寫入的驗收條件當場破功）。
     * ★`status`／`roleIds` 出現即觸發 self 守門（`cannotEditSelfRoleOrStatus`），故只在真要改時帶。
     */
    type UpdateReq = {
      id: number;
      nickName?: string | null;
      userGender?: string | null;
      userPhone?: string | null;
      userEmail?: string | null;
      status?: Api.Common.EnableStatus;
      /** 期望全集、**全量替換**（空陣列＝解除全部指派；界外 id 整筆拒——R2#25 拍板、非 orphan skip） */
      roleIds?: number[];
      userMemo?: string | null;
    };

    /**
     * 重設密碼請求（`POST resetUserPassword`；contracts §9）：管理員手輸或前端產密；
     * ★後端不回傳密碼、成功 `data: null`。拒因含政策違規（攜參 `{violations}`）與冷卻
     * （攜參 `{remainingSeconds}`），一律由共用攔截層轉譯後 toast。
     */
    type ResetPasswordReq = {
      id: number;
      password: string;
    };

    /** 踢除回應（`POST kickUser`；contracts §8）：`revoked`＝本次實際撤銷的 active 票數（rotated 列不動）。 */
    type KickRes = {
      revoked: number;
    };

    /**
     * 會話政策更新請求（`POST updateUserSessionPolicy`；contracts §10）：值域外→
     * `2222 biz.user.sessionPolicyInvalid`；與現值相同＝no-op；改 `single` **不**即時踢除
     * （下次登入才生效）。★本端點為 protected（super-only、結構性）。
     */
    type UpdateSessionPolicyReq = {
      id: number;
      sessionPolicy: SessionPolicy;
    };

    /**
     * 解鎖登入請求（既有 `POST /systemManage/unlockLogin`；004 建、本刀 U7 只接 UI——
     * contracts/wire-user-admin.md 末節「既有 `POST /systemManage/unlockLogin`（004；本刀接 UI＋帳號維套規則）」）
     *
     * ★`dimension` **必給**：後端該 DTO 走 `#[serde(default)]`，欄缺席不由 serde 判死、而是落成
     * 空字串後由守門判「維度不明」→ `2222 biz.throttle.invalidUnlockTarget`（rev4 之「缺席預設帳號維」
     * 為 rev5 拍板差異、不帶回——research R2#17）。故本型該欄**非選填**，呼叫端一律顯式帶。
     * ★★**來源維的標的欄名是 `target`、不是 `ip`**：本刀契約末節的欄形速寫作 `ip?: string` 係轉抄之誤
     * ——同節自陳「既有契約不變」，而既有契約（specs/004-ip-trust-anchor/contracts/wire-throttle-unlock.md
     * 請求表三欄）與後端 DTO（`handler/throttle.rs` 之 `UnlockLoginReq`，`rename_all = "camelCase"`
     * ⇒ 上 wire 為 `target`）兩者皆為 `target`。照 `ip` 落地會是一種**靜默**的錯：請求形制正確、
     * 後端只看到「來源維標的缺席」⇒ 恆得 `2222`，畫面上看起來像「這個 IP 沒被鎖」。
     * ★兩個標的欄刻意維持**選填的平坦形**（不做判別聯合）：與 004 契約的三欄請求表逐欄對齊、
     * 亦與本命名空間其餘請求型同形；「哪一維帶哪一欄」由呼叫端在送出處分支
     * （見 views/manage/user/modules/user-unlock-modal.vue）。
     */
    type UnlockReq = {
      /** `'user'`＝帳號維（`userName` 必給、套 no-escalation）｜`'ip'`＝來源維（`target` 必給、不套） */
      dimension: 'user' | 'ip';
      /**
       * 帳號維標的：★**帳號名原樣**（大小寫敏感、零 trim、零正規化）——鎖端以登入時送出的帳號名
       * 逐字渲染快取鍵，標的在此只要被加工過，導出的就是一把沒有人寫過的鍵 ⇒ 解鎖靜默無效。
       */
      userName?: string;
      /**
       * 來源維標的：**位址字面**（v4／v6 皆可），由後端導出與計數側同粒度的桶
       * （v4 `/32`、v6 聚合 `/64`、IPv4-mapped 先折 v4）——前端不自行換算粒度。
       */
      target?: string;
    };
  }
}
