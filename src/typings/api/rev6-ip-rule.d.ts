// [rev6-inline BASE-WEB-ADAPT+ 004-ip-trust-anchor] IP 規則管理五端點的 wire 型別新檔——以 declaration merging 開 `Api.IpRule` 節、既有 typings 檔零改（specs/004-ip-trust-anchor/contracts/wire-ip-rule.md）
declare namespace Api {
  /**
   * IP 存取規則管理域。本節即憲法 §I.3 的 wire 權威：`tools/wire-schema.py extract` 由此抽快照、rust 側 `tests/wire_schema.rs` 據快照裁後端 DTO。
   *
   * 自成一節而不掛進 `Api.SystemManage`：型名已自帶 `IpRule` 字首，與該節的 `Role`／`User` 家族互不相撞。
   * 型名取 rev6 契約與後端 DTO 同名（`IpRuleRecord`／`IpRuleListQuery`／三支 Req）；欄形出處＝rev5:src/typings/api/rev5-ip-rule.d.ts。
   */
  namespace IpRule {
    /** 規則類型的封閉二值；值域權威在後端寫端守門，超出即 `2222`。 */
    type RuleType = 'allow' | 'deny';

    /** 清單的軟刪篩選三態；後端對缺省與認不得的字面一律當 `all`。 */
    type DeletedFilter = 'active' | 'deleted' | 'all';

    /** 清單列（`getIpRuleList` 之 `records` 元素）。十欄恆在場；`deletedAt`／`deletedBy` 不上 wire。 */
    interface IpRuleRecord {
      /** 後端 i64 過 2^53 守衛後以 JSON number 出 wire */
      id: number;
      /** 已正規化的網段字面（主機位元歸零後的形） */
      wbipCidr: string;
      wbipType: RuleType;
      /** 使用者自由輸入的文字——顯示端只准純文字插值 */
      wbipMemo: string | null;
      /** 只供顯示排序；判定為 any-match、與本欄無關 */
      order: number | null;
      /** 由後端 `deleted_at` 是否有值導出＝是否在回收桶 */
      deleted: boolean;
      /** RFC3339 帶 offset */
      createdAt: string;
      updatedAt: string | null;
      /** 操作者帳號名（不是 uid）；後端查無對應帳號即 null */
      createdBy: string | null;
      updatedBy: string | null;
    }

    /** 清單 query：分頁兩欄沿 `Common.CommonSearchParams`，三個篩選條件皆可空、彼此 AND（網段為模糊比對、其餘等值）。 */
    type IpRuleListQuery = CommonType.RecordNullable<
      Common.CommonSearchParams & {
        wbipCidr: string;
        wbipType: RuleType;
        deleted: DeletedFilter;
      }
    >;

    /**
     * `addIpRule` 請求體。兩個選填欄對應後端 `Option`：缺席與 JSON null 同落 `None`，
     * 表單清空數字欄得到的 null 可原樣送出；備註送空字串亦落 `None`。
     */
    interface IpRuleAddReq {
      wbipCidr: string;
      wbipType: RuleType;
      wbipMemo?: string | null;
      order?: number | null;
    }

    /** `updateIpRule` 請求體＝新增形加定位用的 `id`；四個內容欄全量覆寫。 */
    interface IpRuleUpdateReq extends IpRuleAddReq {
      id: number;
    }

    /** `deleteIpRule`／`restoreIpRule` 共用的請求體。 */
    interface IpRuleIdReq {
      id: number;
    }
  }
}
