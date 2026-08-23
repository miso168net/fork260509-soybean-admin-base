<script setup lang="tsx">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iv)+ 006-authz-governance] 授權回收桶管理頁（新增檔；基線 example 無此路徑、零原行）。
// 內容＝雙維搜尋卡（來源角色×維度）＋歸檔列清單（分頁）＋逐列復原；純列表＋restore、無新增／編輯抽屜。
// 消費 rust-api 之 getArchivedPolicies／restorePolicy 兩端點（contracts/wire-policy-archive.md）。
// ★復原鈕**無按鈕碼 gating**（spec FR-034）：門＝頁級 menu 維政策列（進得了本頁即可操作）＋列級 `restorable`
// 旗標（後端派生；false 即停用態）；後端 restorePolicy 鎖內重驗為最終防線。
// ★寫端成功後**前端零追加「生效」呼叫**：後端 Applied 即同步判定面、NoOp 只消費歸檔列，本頁只需刷新清單
// （★前端不可區分 Applied／NoOp——沿 rev4、已知態）。
// ★拒因（notRestorable）一律由 service/request 共用攔截層轉譯 `backend.biz.policy.notRestorable` 後 toast，
// 頁內零拒因專屬 UI。`archiveReason` 欄顯示封閉詞彙**原字面**、不映譯（沿 rev4、CDP 基準）。
// ★本目錄下一切原始 HTML 注入用法（指令／屬性／DOM API）皆禁（機器守＝tools/view-render-guard.py，
// ★該守門逐字掃本目錄原文、不解析註解，故此處**刻意不寫出被禁字面**——寫了就自撞）；本頁所有欄皆
// 走 NDataTable 預設純文字渲染或 JSX 子節點插值、由 Vue 逸出。
// ★script lang 用 tsx（欄 render 函式需要），沿本 repo `views/manage/ip-rule/index.vue` 既有範式。
// rev4: 高度參照 rev4 之 views/manage/policy-archive/index.vue（8 欄、restorable 分流、restore→getData 動線）；
// rev4 該檔以 `Api.SystemManage.ArchivedPolicy*` 取型、rev5 改取獨立命名空間 `Api.PolicyArchive.*`
// （見 rev5-role-admin.d.ts）；rev4 之 scroll-x 常數與其欄寬總和不符、rev5 重算（見模板註解）。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
// WRAPPER fetcher：★直接路徑、不經 barrel（沿 rev5-ip-rule／rev5-role-admin 先例）
import { fetchGetArchivedPolicies, fetchRestorePolicy } from '@/service/api/rev5-role-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import PolicyArchiveSearch from './modules/policy-archive-search.vue';

const appStore = useAppStore();

// 維度三值各掛一鍵（search 模組另有同名同內容一份——照 rev4 兩處各寫、不為三行抽新檔）
const dimensionRecord: Record<Api.PolicyArchive.ArchivedPolicyDimension, App.I18n.I18nKey> = {
  menu: 'page.manage.policyArchive.dimensionLabel.menu',
  button: 'page.manage.policyArchive.dimensionLabel.button',
  endpoint: 'page.manage.policyArchive.dimensionLabel.endpoint'
};

// 雙維搜尋參數（contracts §1）：roleCode 等值濾 v0／dimension 等值；兩者皆可空＝不濾。
const searchParams = ref<Api.PolicyArchive.ArchivedPolicyListQuery>({
  current: 1,
  size: 10,
  roleCode: null,
  dimension: null
});

// 本頁無 drawer／批刪 ⇒ 不取用 useTableOperate；表頭也不掛 TableHeaderOperation（見模板註解）
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
      // casbin v0＝來源角色代碼
      key: 'v0',
      title: $t('page.manage.policyArchive.sourceRole'),
      align: 'center',
      minWidth: 140
    },
    {
      // 後端由 v2 推導隨列下發；NTag 承載譯文
      key: 'dimension',
      title: $t('page.manage.policyArchive.dimension'),
      align: 'center',
      width: 110,
      render: row => <NTag>{$t(dimensionRecord[row.dimension])}</NTag>
    },
    {
      // casbin v1＝授權標的（route_name／按鈕碼／路徑）
      key: 'v1',
      title: $t('page.manage.policyArchive.target'),
      align: 'center',
      minWidth: 180
    },
    {
      // 封閉詞彙原字面、不映譯（檔頭）
      key: 'archiveReason',
      title: $t('page.manage.policyArchive.archiveReason'),
      align: 'center',
      minWidth: 140
    },
    {
      // RFC3339 帶 offset 直接顯示（不在前端二次格式化——沿 ip-rule 頁慣例）
      key: 'archivedAt',
      title: $t('page.manage.policyArchive.archivedAt'),
      align: 'center',
      minWidth: 180
    },
    {
      // 操作者帳號名（後端批次 enrich、查無即 null→整格空白＝role 頁對 null 的既有慣例）
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
      // 依列級 `restorable` 分流：true＝復原鈕（NPopconfirm 二次確認）／false＝同鍵同文案的停用鈕、
      // 無 Popconfirm（spec FR-034 停用態；選單維／按鈕維列恆 false）。★無按鈕碼 gating（檔頭）。
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
  // 復原；拒因 notRestorable（識別不存在／任一腿拒／競態）一律交攔截層 toast，error 即 return
  const { error } = await fetchRestorePolicy(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));

  // 留當頁刷新（不回第一頁）：歸檔列已消費移除、該頁其餘列照常可續操作
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
          表頭只放 refresh 鈕（沿 rev4 形）：本頁零寫端入口，刻意不掛 TableHeaderOperation——
          該共用元件的 default slot 自帶新增／批刪鈕，覆寫又會落入 B-099 形（條件為空時 fallback 冒出）
        -->
        <NButton size="small" @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.refresh') }}
        </NButton>
      </template>
      <!--
        ★scroll-x ＝上方 columns 的 Σ(width|minWidth) 逐位相等＝
        64（index）＋140（v0）＋110（dimension）＋180（v1）＋140（archiveReason）＋180（archivedAt）
        ＋120（archivedBy）＋120（operate）＝1054（本 repo 各管理頁皆守此不變式；憲法 §III.2 (iv) 列）：
        小於總和時視窗變窄，各欄宣告的 minWidth 無法全數兌現。增刪欄或調欄寬時本數字必須同批改。
        rev4: 同檔寫 1014 與其欄寬總和 1054 不符＝rev4 內部不一致，rev5 以自算值為準、不帶回。
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
