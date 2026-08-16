// [rev5-inline BASE-WEB-ADAPT+ 004-ip-trust-anchor] wire 契約錨點新檔——以 TS 跨檔 declaration merging 併入 Api、不改既有 system-manage.d.ts（contracts/wire-ip-rule.md、ADR 0018 同軌先例＝rev5-settings.d.ts／rev5-auth.d.ts）。
declare namespace Api {
  /**
   * IP 存取規則管理（`/systemManage/*IpRule*` 五端點；contracts/wire-ip-rule.md）
   *
   * ★**刻意獨立命名空間、不併進 `Api.SystemManage`**（與 rev5-settings.d.ts／rev5-auth.d.ts 併入既有
   * 命名空間的做法不同）：本刀是 rev5 第一個自帶完整 CRUD＋回收桶的管理域，型別共七支；併進
   * `Api.SystemManage` 就得逐支戴 `IpRule` 前綴（`IpRuleRecord`／`IpRuleListQuery`／`AddIpRuleReq`…）
   * 才不撞既有的 `Role`／`User` 同名家族，讀起來是同一個字重複兩次。獨立命名空間讓消費端寫
   * `Api.IpRule.RuleRecord`，前綴由命名空間本身承擔。spec/research 逐字亦作「`Api.IpRule` 節」。
   * rev4: 承 rev4-ip-rule.d.ts 之七支型別的**欄形**，但 rev4 併入 `Api.SystemManage`＝rev5 差異點。
   */
  namespace IpRule {
    /** 規則類型值域（`allow`＝放行／`deny`＝阻擋；封閉二值，後端 `validate_wbip_type` 為權威） */
    type RuleType = 'allow' | 'deny';

    /**
     * 清單軟刪三態 filter 值域（contracts §1）
     *
     * `active`＝僅現役／`deleted`＝僅回收桶／`all`＝混排全景；★**缺省即 `all`**（後端
     * `parse_deleted_filter` 對無法辨識的字面亦回 `all`）。
     */
    type DeletedFilter = 'active' | 'deleted' | 'all';

    /**
     * 規則列 wire 形（`getIpRuleList` 之 `records` 元素；contracts §共用型）
     *
     * ★`deleted` 由後端 `deleted_at.is_some()` **導出**；`deletedAt`／`deletedBy` **不上 wire**
     * （布林已足以辨識回收桶列）。`createdBy`／`updatedBy` 是操作者**帳號名**（後端批次 enrich、
     * 查無即 `null`），不是 id。`order` 僅供顯示排序，★**不參與判定**——規則集是 any-match
     * 集合、無優先序語意（憲法 §I.7 島 F 之 F1）。
     */
    type RuleRecord = {
      /** 主鍵；後端 i64 過 2^53 fail-loud 守衛後以 JSON number 上 wire（憲法 §I.3） */
      id: number;
      /** 正規化後的網段字面（主機位元已 mask，例：送 `203.0.113.7/24` 落 `203.0.113.0/24`） */
      wbipCidr: string;
      wbipType: RuleType;
      /** 備註——★使用者可寫的自由文字，渲染端 MUST 純文字插值（spec FR-038） */
      wbipMemo: string | null;
      /** 顯示排序值（★不參與判定） */
      order: number | null;
      /** 是否位於回收桶 */
      deleted: boolean;
      /** RFC3339 帶 offset 字面 */
      createdAt: string;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
    };

    /**
     * 清單查詢參數（`GET getIpRuleList`；contracts §1）
     *
     * 三個 filter 皆可空、AND 合取：`wbipCidr` **模糊**比對（比對面即 wire 顯示值、含 `/32`
     * 遮罩後綴故可直接搜）、`wbipType` 等值、`deleted` 三態。`current`／`size` 沿 §I.3 分頁形
     * （後端預設 1／10、`size` clamp 至 `[1, 100]`）。
     */
    type ListQuery = CommonType.RecordNullable<
      {
        wbipCidr: string;
        wbipType: RuleType;
        deleted: DeletedFilter;
      } & Common.CommonSearchParams
    >;

    /** 清單回應（沿 §I.3 分頁形 `{current, size, total, records}`） */
    type ListRes = Common.PaginatingQueryRecord<RuleRecord>;

    /**
     * 新增請求（`POST addIpRule`；contracts §2）
     *
     * `wbipCidr` 由後端解析＋主機位元正規化後落庫；`wbipMemo` 空字串經後端 `normalize_memo`
     * 落 `None`（來回等價，故前端表單以空字串承載「沒填」即可）。
     */
    type AddReq = {
      wbipCidr: string;
      wbipType: RuleType;
      wbipMemo?: string | null;
      order?: number | null;
    };

    /** 更新請求（`POST updateIpRule`；contracts §3＝新增形＋`id`，四欄皆可改） */
    type UpdateReq = AddReq & { id: number };
  }
}
