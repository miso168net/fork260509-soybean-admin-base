// BASE-WEB net-new (B-096 維護批)：稽核中心四 search 卡（operation／access／login／session）共用
// daterange 邏輯——原四卡逐字重複×4 的 dateRange ref＋applyDateRange＋defaultModel/resetModel/search
// 純函式段提煉為單一 composable（落點照 role/modules/protected-revoke-detail.ts 之 modules 內共用檔先例）。
// ★我方新檔、零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
import { ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import { jsonClone } from '@sa/utils';

/** 稽核查詢參共通時間區間欄（四源 SearchParams 經 RecordNullable 後皆為此形：可選可空 string） */
type AuditDateRangeModel = {
  timeFrom?: string | null;
  timeTo?: string | null;
};

/**
 * 稽核 search 卡共用 daterange＋reset/search 段（B-096）。
 *
 * daterange 控件值型＝兩元素毫秒 timestamp 陣列或 null（U8 spike 實測）；search/reset 時轉 wire
 * timeFrom/timeTo（逐端 UTC RFC3339、null 略去）。reset 後補 emit('search')（鏡像
 * policy-archive-search）——重置即刷新列表。
 */
export function useAuditSearchDateRange<T extends AuditDateRangeModel>(
  model: Ref<T>,
  emit: (e: 'search') => void
) {
  const dateRange = ref<[number, number] | null>(null);

  function applyDateRange() {
    // 以共通欄型窄視角寫入（四源 timeFrom/timeTo 欄型完全同構、寬化零損；避免對泛型 T 屬性直接賦值）
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
