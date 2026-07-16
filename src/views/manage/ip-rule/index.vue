<script setup lang="tsx">
// [rev4 net-new 013-ip-rule-admin] IP 規則管理頁：US1 混排清單（現役沉頂＋已刪殿後、排序權威在後端）＋三維搜尋卡＋審計欄；
// 憲法 §III.2 MODAL-WIRING (e) 標準鏡像管理頁＋(d) 擴字串 v1.11.0 授權（已刪列顯示與狀態欄辨識＋狀態三態過濾＋逐列 restore 鈕；ADR 0061）；
// ★U3 邊界：操作欄（編輯／刪除／復原）與新增鈕僅 disabled 佔位——drawer／NPopconfirm／fetcher 點擊接線屬 U4 T017、不超前；
// ★order 欄語彙一律「排序值」（島 F F1：any-match、無順序化規則鏈、絕不「優先」）；
// script lang 自 ts 改 tsx（欄 render 函式需要、照 user/index.vue 範式）；example 基線無此檔、零原行。
import { ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
// WRAPPER fetcher（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchGetIpRuleList } from '@/service/api/rev4-ip-rule';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import IpRuleSearch from './modules/ip-rule-search.vue';

const appStore = useAppStore();

// 三維搜尋參數（契約 §2：wbipCidr 模糊／wbipType 等值／deleted 三態；★deleted 預設 'all'＝D1 混排全景不改預設行為）
const searchParams = ref<Api.SystemManage.IpRuleListQuery>({
  current: 1,
  size: 10,
  wbipCidr: null,
  wbipType: null,
  deleted: 'all'
});

// 類型欄 NTag 色與標籤鍵（allow=success 放行／deny=error 阻擋；照 constants/business Record 房式）
const ruleTypeTagMap: Record<Api.SystemManage.IpRuleType, NaiveUI.ThemeColor> = {
  allow: 'success',
  deny: 'error'
};

const ruleTypeLabelMap: Record<Api.SystemManage.IpRuleType, App.I18n.I18nKey> = {
  allow: 'page.manage.ipRule.ruleTypeMap.allow',
  deny: 'page.manage.ipRule.ruleTypeMap.deny'
};

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetIpRuleList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'wbipCidr',
      title: $t('page.manage.ipRule.wbipCidr'),
      align: 'center',
      minWidth: 150
    },
    {
      key: 'wbipType',
      title: $t('page.manage.ipRule.wbipType'),
      align: 'center',
      width: 100,
      render: row => <NTag type={ruleTypeTagMap[row.wbipType]}>{$t(ruleTypeLabelMap[row.wbipType])}</NTag>
    },
    {
      key: 'wbipMemo',
      title: $t('page.manage.ipRule.wbipMemo'),
      align: 'center',
      minWidth: 120,
      render: row => row.wbipMemo ?? $t('page.manage.ipRule.empty')
    },
    {
      // ★「排序值」＝純顯示排序語意（島 F F1 any-match、無優先序）
      key: 'order',
      title: $t('page.manage.ipRule.order'),
      align: 'center',
      width: 80,
      render: row => row.order ?? $t('page.manage.ipRule.empty')
    },
    {
      // 狀態欄＝混排清單辨識錨點（憲法 §III.2(d) v1.11.0；deleted 導出布林）
      key: 'status',
      title: $t('page.manage.ipRule.status'),
      align: 'center',
      width: 90,
      render: row => (
        <NTag type={row.deleted ? 'error' : 'success'}>
          {row.deleted ? $t('page.manage.ipRule.statusDeleted') : $t('page.manage.ipRule.statusActive')}
        </NTag>
      )
    },
    {
      // RFC3339 帶 offset 直渲染（FR-005；照 audit createTime 先例）
      key: 'createdAt',
      title: $t('page.manage.ipRule.createdAt'),
      align: 'center',
      minWidth: 170
    },
    {
      key: 'updatedAt',
      title: $t('page.manage.ipRule.updatedAt'),
      align: 'center',
      minWidth: 170,
      render: row => row.updatedAt ?? $t('page.manage.ipRule.empty')
    },
    {
      // 帳號名經後端批次 enrich（含已軟刪用戶查得名）；id 查無→null 降級「—」（沿 user 頁 null 降級房式）
      key: 'createdBy',
      title: $t('page.manage.ipRule.createdBy'),
      align: 'center',
      minWidth: 100,
      render: row => row.createdBy ?? $t('page.manage.ipRule.empty')
    },
    {
      key: 'updatedBy',
      title: $t('page.manage.ipRule.updatedBy'),
      align: 'center',
      minWidth: 100,
      render: row => row.updatedBy ?? $t('page.manage.ipRule.empty')
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 160,
      // 依 deleted 切換：現役列＝編輯＋刪除、已刪列＝僅復原（憲法 §III.2(d) 逐列 restore 鈕）；
      // ★U3 全為 disabled 佔位、零點擊行為——接線（drawer／NPopconfirm／fetcher）屬 U4 T017；
      // restore 標籤復用 policyArchive.restore entity-neutral 鍵（照 010 menu／011 user 先例）
      render: row =>
        row.deleted ? (
          <div class="flex-center gap-8px">
            <NButton type="primary" ghost size="small" disabled>
              {$t('page.manage.policyArchive.restore')}
            </NButton>
          </div>
        ) : (
          <div class="flex-center gap-8px">
            <NButton type="primary" ghost size="small" disabled>
              {$t('common.edit')}
            </NButton>
            <NButton type="error" ghost size="small" disabled>
              {$t('common.delete')}
            </NButton>
          </div>
        )
    }
  ]
});

// [佔位] useTableOperate（tasks T013 明列）：drawer 開關／編輯暫存／onDeleted 刷新等回傳屬 U4 T016/T017 消費；
// U3 操作鈕一律 disabled 佔位、暫不解構回傳（避免未使用綁定）。
useTableOperate(data, 'id', getData);
</script>

<template>
  <!-- U3 清單面：三維搜尋卡＋混排清單（新增鈕／操作欄 disabled 佔位、U4 T017 接線） -->
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <IpRuleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.manage.ipRule.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <!-- 覆寫 default slot：本頁無批次刪除、只渲染新增鈕（disabled 佔位；drawer 接線屬 U4） -->
          <template #default>
            <NButton size="small" ghost type="primary" disabled>
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1300"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
