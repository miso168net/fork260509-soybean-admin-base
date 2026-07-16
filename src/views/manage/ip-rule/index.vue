<script setup lang="tsx">
// [rev4 net-new 013-ip-rule-admin] IP 規則管理頁：US1 混排清單（現役沉頂＋已刪殿後、排序權威在後端）＋三維搜尋卡＋審計欄
// ＋US2 寫端接線（U4 T017）：新增／編輯開 drawer、刪除／復原 NPopconfirm 二次確認（FR-007）；
// 憲法 §III.2 MODAL-WIRING (e) 標準鏡像管理頁＋(d) 擴字串 v1.11.0 授權（已刪列顯示與狀態欄辨識＋狀態三態過濾＋逐列 restore 鈕；ADR 0061）；
// ★寫成功後端自動 reload＋PUBLISH（FR-007）——前端零追加生效呼叫、只刷新清單；
// 拒因（selfLock／conflict／invalidCidr／invalidRuleType／notFound）一律共用攔截層 onError toast（E2）、頁內零拒因專屬 UI；
// ★order 欄語彙一律「排序值」（島 F F1：any-match、無順序化規則鏈、絕不「優先」）；
// script lang 自 ts 改 tsx（欄 render 函式需要、照 user/index.vue 範式）；example 基線無此檔、零原行。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
// WRAPPER fetcher（★直接路徑、不經 barrel、避 vite stale-export；delete＝DELETE 動詞＋data 載 id、契約 §6）
import { fetchDeleteIpRule, fetchGetIpRuleList, fetchRestoreIpRule } from '@/service/api/rev4-ip-rule';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import IpRuleOperateDrawer from './modules/ip-rule-operate-drawer.vue';
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

// null 降級單一化 helper（U3 review 收斂：五欄共用「值缺→破折號」渲染；破折號降級＝本頁 T013 新立行為、非 user 頁慣例——user 頁對 null 係整格不渲染）
function renderNullable(value: string | number | null) {
  return value ?? $t('page.manage.ipRule.empty');
}

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
      render: row => renderNullable(row.wbipMemo)
    },
    {
      // ★「排序值」＝純顯示排序語意（島 F F1 any-match、無優先序）
      key: 'order',
      title: $t('page.manage.ipRule.order'),
      align: 'center',
      width: 80,
      render: row => renderNullable(row.order)
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
      render: row => renderNullable(row.updatedAt)
    },
    {
      // 帳號名經後端批次 enrich（含已軟刪用戶查得名）；id 查無→null 降級破折號（renderNullable 單一化）
      key: 'createdBy',
      title: $t('page.manage.ipRule.createdBy'),
      align: 'center',
      minWidth: 100,
      render: row => renderNullable(row.createdBy)
    },
    {
      key: 'updatedBy',
      title: $t('page.manage.ipRule.updatedBy'),
      align: 'center',
      minWidth: 100,
      render: row => renderNullable(row.updatedBy)
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 160,
      // 依 deleted 切換：現役列＝編輯＋刪除、已刪列＝僅復原（憲法 §III.2(d) 逐列 restore 鈕）；
      // U4 T017 接線：編輯→開 drawer（帶列資料）、刪除／復原→NPopconfirm 二次確認（FR-007）；
      // restore 標籤改用 ipRule.restore 專屬鍵（T019 兌現、取代 U3 暫借之 policyArchive.restore）
      render: row =>
        row.deleted ? (
          <div class="flex-center gap-8px">
            <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
              {{
                default: () => $t('page.manage.ipRule.confirmRestore'),
                trigger: () => (
                  <NButton type="primary" ghost size="small">
                    {$t('page.manage.ipRule.restore')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        ) : (
          <div class="flex-center gap-8px">
            <NButton type="primary" ghost size="small" onClick={() => handleEdit(row.id)}>
              {$t('common.edit')}
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
              {{
                default: () => $t('common.confirmDelete'),
                trigger: () => (
                  <NButton type="error" ghost size="small">
                    {$t('common.delete')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        )
    }
  ]
});

// U4 T017：解構消費 useTableOperate（drawer 開關／add-edit 分流／編輯暫存／onDeleted 刷新；照 user/index.vue 房式）
const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

async function handleDelete(id: number) {
  // 軟刪（契約 §3 DELETE 動詞）；error 即 return——selfLock／notFound 拒因由共用攔截層 toast（E2）
  const { error } = await fetchDeleteIpRule(id);
  if (error) {
    return;
  }

  onDeleted();
}

// 復原（憲法 §III.2(d) v1.11.0 逐列 restore；鏡像 011 user handleRestore 房式：error 即 return→success toast→getData 刷新）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreIpRule(id);
  if (error) {
    // conflict（同網段×類型現役重複）／selfLock／notFound 拒因由共用攔截層 onError toast
    return;
  }

  window.$message?.success($t('page.manage.ipRule.restoreSuccess'));

  await getData();
}
</script>

<template>
  <!-- 三維搜尋卡＋混排清單＋操作接線（U4 T017：新增／編輯開 drawer、刪除／復原 NPopconfirm 二次確認） -->
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
          <!-- 覆寫 default slot：本頁無批次刪除、只渲染新增鈕（開 drawer add 分流） -->
          <template #default>
            <NButton size="small" ghost type="primary" @click="handleAdd">
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
      <!-- U4 T016 新增／編輯抽屜（submitted＝寫成功後刷新清單；後端自動 reload＋PUBLISH、前端零追加生效呼叫） -->
      <IpRuleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
