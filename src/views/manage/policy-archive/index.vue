<!-- [rev6-inline MANAGE-POLICY-ARCHIVE-VIEW+ 006-authz-governance] 授權回收桶頁主檔（新增檔；上游基線無此路徑）——搜尋卡＋歸檔授權清單（分頁）＋逐列復原，無新增／編輯入口 -->
<script setup lang="tsx">
// 不變式（契約＝specs/006-authz-governance/contracts/wire-policy-archive.md；出處＝rev5:src/views/manage/policy-archive/index.vue）：
// · 復原鈕不接按鈕權限碼：門在頁級（本頁選單維的受保護授權列）與列級 `restorable` 旗標。旗標只切換鈕的停用態、不是權威，
//   真正能否復原由後端復原時鎖內重驗定案。
// · 失敗提示不在本頁處理：拒因（含不可復原）由 `service/request` 的 onError 鏈轉譯後出 toast，本頁只看 `error` 有無。
// · 復原成功只刷新清單、留在當頁；判定面同步由後端在 commit 後自己做，前端不追加「生效」請求。真回插與「標的已在現役、只消費歸檔列」
//   兩種成功對前端不可區分（已知態）。
// · 來源角色、標的、歸檔原因、歸檔者都是 wire 原樣字串：一律走表格預設文字渲染或 JSX 子節點插值、由 Vue 當純文字輸出。本目錄禁用任何
//   原始 HTML 注入寫法（機器守＝tools/view-render-guard.py；該守門逐字掃原文、不分註解與碼，故此處不寫出被禁的字面）。
// · 歸檔原因照封閉詞彙原字面顯示、不翻譯；歸檔時間照 wire 字面（UTC）原樣顯示、不做時區換算（ADR-00061）。
// · script 用 tsx＝欄 render 需要 JSX，同 `views/manage/ip-rule/index.vue`。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
// 直接路徑 import、不經 barrel（理由見該檔檔頭）
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api/rev6-authz';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PolicyArchiveSearch from './modules/policy-archive-search.vue';

const appStore = useAppStore();

// 首屏 query：兩個篩選條件起始為 null＝不篩，經請求層的 qs 渲染成 `k=` 空值、後端以空字串吸收。rust-api 之 wire 裁判面
// （`server/tests/wire_schema.rs`）的首屏真串常數須與本物件經請求層實跑出的串全等；兩者之間沒有機器對賬，改這裡的初值須同批以實跑值更新該常數。
const searchParams = ref<Api.Authz.ArchivedPolicyListQuery>({
  current: 1,
  size: 10,
  roleCode: null,
  dimension: null
});

// 維度三值到標籤鍵的對照（搜尋卡另有一份同內容的對照，兩處各寫的理由見該檔）
const dimensionRecord: Record<Api.Authz.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

// 本頁沒有抽屜與批次刪除，不取用 useTableOperate
const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetArchivedPolicies(searchParams.value),
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
      // 歸檔快照的 v0＝被撤授權原屬的角色代碼
      key: 'v0',
      title: $t('page.manage.policyArchive.sourceRole'),
      align: 'center',
      minWidth: 140
    },
    {
      // 維度由後端從 v2 推得、隨列送來；本欄只做標籤翻譯
      key: 'dimension',
      title: $t('page.manage.policyArchive.dimension'),
      align: 'center',
      width: 110,
      render: row => <NTag>{$t(dimensionRecord[row.dimension])}</NTag>
    },
    {
      // 歸檔快照的 v1＝授權標的（路由名、按鈕碼或端點路徑）；端點維的方法（v2）不另立一欄
      key: 'v1',
      title: $t('page.manage.policyArchive.target'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'archiveReason',
      title: $t('page.manage.policyArchive.archiveReason'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'archivedAt',
      title: $t('page.manage.policyArchive.archivedAt'),
      align: 'center',
      minWidth: 180
    },
    {
      // 帳號名而非 uid；查無或未記錄時為 null，格子留白
      key: 'archivedBy',
      title: $t('page.manage.policyArchive.archivedBy'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 120,
      // 可復原列：復原鈕先過二次確認；不可復原列：同文案的停用鈕、不包確認框
      render: row =>
        row.restorable ? (
          <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
            {{
              default: () => $t('page.manage.policyArchive.confirmRestore'),
              trigger: () => (
                <NButton type="primary" ghost size="small">
                  {$t('page.manage.policyArchive.restore')}
                </NButton>
              )
            }}
          </NPopconfirm>
        ) : (
          <NButton type="primary" ghost size="small" disabled>
            {$t('page.manage.policyArchive.restore')}
          </NButton>
        )
    }
  ]
});

async function handleRestore(id: number) {
  const { error } = await fetchRestorePolicy(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));

  // 重取當頁、不跳回第一頁：被復原的歸檔列已消失，同頁其餘列可接著操作
  await getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PolicyArchiveSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.manage.policyArchive.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <!--
          表頭只放一顆重新整理鈕、不掛共用表頭元件：本頁沒有任何寫入口，該元件另帶的欄位勾選選單也不需要；與 rev5 同頁同形，
          瀏覽器三方對照時結構才對得上。
        -->
        <NButton size="small" @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.refresh') }}
        </NButton>
      </template>
      <!--
        scroll-x 1054＝上方各欄 width／minWidth 之和（64＋140＋110＋180＋140＋180＋120＋120）；增刪欄或調欄寬須同批改，
        否則窄視窗下 minWidth 兌現不了
      -->
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1054"
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
