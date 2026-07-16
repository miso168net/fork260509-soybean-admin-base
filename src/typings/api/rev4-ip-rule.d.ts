// BASE-WEB-ADAPT (013-ip-rule-admin)：新增 typings 檔，不改凍結 system-manage.d.ts（upstream Api.SystemManage 凍結）。
// 透過 TS 跨檔 declaration merging 併入 Api.SystemManage；IP 規則清單列型＋查詢參＋寫端請求形（camelCase wire）。
// ★列型逐欄對齊 contracts §2 response（rust-api handler/ip_rule.rs IpRuleRecord）：
//   id＝number（2^53 守衛後端擔保）；wbipCidr＝恆帶遮罩字串（IpNetwork::to_string）；deleted＝導出 boolean；
//   createdAt＝RFC3339 帶 offset 字串；updatedAt／createdBy／updatedBy＝string|null（null 恆在不省略）。
// ★新檔零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
declare namespace Api {
  namespace SystemManage {
    /** IP 規則類型值域（allow=白名單／deny=黑名單；封閉二值） */
    type IpRuleType = 'allow' | 'deny';

    /** 清單狀態三態 filter 值域（active=現役／deleted=已刪除／all=全部、缺省 all；contracts §2） */
    type IpRuleDeletedFilter = 'active' | 'deleted' | 'all';

    /**
     * IP 規則列 wire 形（GET getIpRuleList records 元素；contracts §2 response）
     *
     * hybrid 混排清單（含軟刪列、active 沉頂）；`deleted` 布林辨識回收桶列（deletedAt/deletedBy 不上 wire）；
     * `createdBy`／`updatedBy`＝帳號名（後端批次 enrich、id 查無→null）；`order` 無優先序語意（any-match）。
     */
    type IpRuleRecord = {
      id: number;
      wbipCidr: string;
      wbipType: IpRuleType;
      wbipMemo: string | null;
      order: number | null;
      deleted: boolean;
      createdAt: string;
      updatedAt: string | null;
      createdBy: string | null;
      updatedBy: string | null;
    };

    /**
     * IP 規則清單查詢參數（GET getIpRuleList；contracts §2 request）
     *
     * 三 filter 皆可空、AND 合取；空字串等同未設（後端正規化）；wbipCidr 模糊（比對面含遮罩、
     * 單主機以「/32」可搜到）；wbipType 精確等值；deleted 三態（預設 all）。
     */
    type IpRuleListQuery = CommonType.RecordNullable<
      {
        wbipCidr: string;
        wbipType: IpRuleType;
        deleted: IpRuleDeletedFilter;
      } & CommonSearchParams
    >;

    /** IP 規則清單回應（PageRes 分頁形） */
    type IpRuleList = Common.PaginatingQueryRecord<IpRuleRecord>;

    /** 新增 IP 規則請求（POST addIpRule；contracts §3；memo 空字串→None 落庫、cidr 經 normalize_cidr） */
    type AddIpRuleReq = {
      wbipCidr: string;
      wbipType: IpRuleType;
      wbipMemo?: string | null;
      order?: number | null;
    };

    /** 更新 IP 規則請求（POST updateIpRule；contracts §3；add 形＋id、四欄皆可改） */
    type UpdateIpRuleReq = AddIpRuleReq & { id: number };
  }
}
