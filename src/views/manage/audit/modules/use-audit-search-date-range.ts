// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(viii)+ 008-audit-settings-pages] 稽核中心四搜尋卡共用
// daterange＋reset/search 段（新增檔；基線 example 無此路徑、零原行；憲法 §III.2 (viii) 列明文
// 「view 新檔為 rev5 新增型新檔、不入名冊」——承 ADR 0021 款 1）。
// 四卡（operation／access／login／session）的時間區間控件值、轉 wire、重設回填三段完全同構，
// 提為單一 composable 由各卡呼叫（FR-E02：時間區間以 UTC ISO 上 wire、重設清空並觸發搜尋）。
// rev4: 高度參照 rev4 之 modules/use-audit-search-date-range.ts 同名檔（其把四卡逐字重複的
// daterange 段提煉為共用檔之形；落點照 modules 內共用檔慣例）。
import { ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import { jsonClone } from '@sa/utils';

/** 稽核查詢參共通時間區間欄（四源 SearchParams 經 RecordNullable 後皆為此形：可選可空 string） */
type AuditDateRangeModel = {
  timeFrom?: string | null;
  timeTo?: string | null;
};

/**
 * 稽核搜尋卡共用 daterange＋reset/search 段。
 *
 * daterange 控件（NDatePicker type="datetimerange"）值型＝兩元素毫秒 timestamp 陣列或 null
 * （rev4: 其 spike 實測結論、rev5 沿用）；search/reset 時經 `Date#toISOString` 轉 wire
 * `timeFrom`／`timeTo`（★恆 UTC RFC3339、後端閉開 `[from, to)`——contracts/wire-audit.md §1）。
 * reset＝快照回填（composable 建立當下的 model 深拷貝）＋清空 daterange＋補 `emit('search')`
 * ——重置即刷新列表（鏡像本 repo policy-archive-search.vue 的 reset 後補發搜尋慣例）。
 */
export function useAuditSearchDateRange<T extends AuditDateRangeModel>(model: Ref<T>, emit: (e: 'search') => void) {
  const dateRange = ref<[number, number] | null>(null);

  function applyDateRange() {
    // 以共通欄型窄視角寫入（四源 timeFrom/timeTo 欄型同構、寬化零損；避免對泛型 T 屬性直接賦值）
    const target: AuditDateRangeModel = model.value;
    if (dateRange.value) {
      target.timeFrom = new Date(dateRange.value[0]).toISOString();
      target.timeTo = new Date(dateRange.value[1]).toISOString();
    } else {
      target.timeFrom = null;
      target.timeTo = null;
    }
  }

  const defaultModel = jsonClone(toRaw(model.value));

  function resetModel() {
    Object.assign(model.value, defaultModel);
    dateRange.value = null;
    applyDateRange();
    emit('search');
  }

  function search() {
    applyDateRange();
    emit('search');
  }

  return {
    dateRange,
    resetModel,
    search
  };
}
