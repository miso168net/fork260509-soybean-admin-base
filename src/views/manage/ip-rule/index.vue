<script setup lang="tsx">
// [rev5-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則管理頁（新增檔；基線 example 無此路徑、零原行）。
// 內容＝三維搜尋卡＋混排清單（現役與回收桶同列、狀態欄辨識）＋新增／編輯抽屜＋逐列軟刪／復原；
// 四顆操作鈕接既有按鈕權限碼機制（`ipRule:add|edit|delete|restore`，m002 seed 已在案；★僅前端可見性，
// 後端 `require_policy` 才是安全邊界）。
// ★寫端成功後**前端零追加「生效」呼叫**：後端於同一交易落稽核、隨即重載判定面並發門鈴（contracts §2），
// 本頁只需刷新清單。
// ★拒因（selfLock／conflict／invalidCidr／invalidRuleType／notFound）一律由 service/request 共用攔截層
// 轉譯 `backend.biz.ipRule.*` 後 toast，頁內零拒因專屬 UI。
// ★自由文字欄（備註）一律純文字插值——JSX 內 `{row.wbipMemo}` 由 Vue 逸出成字面；本目錄下一切
// 原始 HTML 注入用法（指令／屬性／DOM API）皆禁（spec FR-038；機器守＝tools/view-render-guard.py，
// ★該守門逐字掃本目錄原文、不解析註解，故此處**刻意不寫出被禁字面**——寫了就自撞）。
// ★script lang 用 tsx（欄 render 函式需要），沿本 repo `views/manage/role/index.vue` 既有範式。
// rev4: 高度參照 rev4 之 views/manage/ip-rule/index.vue（欄集、狀態欄、逐列鈕分流）；
// rev4 該檔以 `Api.SystemManage.IpRule*` 取型、rev5 改取獨立命名空間 `Api.IpRule.*`（見 rev5-ip-rule.d.ts）。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
// WRAPPER fetcher：★直接路徑、不經 barrel（沿 rev5-settings.ts／rev5-auth.ts 先例）
import { fetchDeleteIpRule, fetchGetIpRuleList, fetchRestoreIpRule } from '@/service/api/rev5-ip-rule';
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import IpRuleOperateDrawer from './modules/ip-rule-operate-drawer.vue';
import IpRuleSearch from './modules/ip-rule-search.vue';

const appStore = useAppStore();

const { hasAuth } = useAuth();

// 三維搜尋參數（contracts §1）：wbipCidr 模糊／wbipType 等值／deleted 三態。
// ★`deleted` 預設 'all'＝與後端缺省一致，首屏即混排全景（回收桶列不必再點一次才看得到）。
const searchParams = ref<Api.IpRule.ListQuery>({
  current: 1,
  size: 10,
  wbipCidr: null,
  wbipType: null,
  deleted: 'all'
});

// 類型欄色（allow＝放行走 success、deny＝阻擋走 error）與標籤鍵，沿 constants/business 的 Record 形。
const ruleTypeTagMap: Record<Api.IpRule.RuleType, NaiveUI.ThemeColor> = {
  allow: 'success',
  deny: 'error'
};

const ruleTypeLabelMap: Record<Api.IpRule.RuleType, App.I18n.I18nKey> = {
  allow: 'page.manage.ipRule.ruleTypeMap.allow',
  deny: 'page.manage.ipRule.ruleTypeMap.deny'
};

/**
 * 五個可空欄的共用降級渲染（值缺 → 破折號）。
 *
 * 本頁刻意與 role／user 頁不同：那兩頁對 null 是整格不渲染（空白），而本頁的 `order`／`wbipMemo`／
 * `updatedAt`／`createdBy`／`updatedBy` 皆可能為 null，五格同時空白會讓人分不清「沒值」與「沒載到」。
 */
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
      // ★「排序值」＝純顯示用，不參與判定（島 F F1：any-match、規則集無順序語意）
      key: 'order',
      title: $t('page.manage.ipRule.order'),
      align: 'center',
      width: 90,
      render: row => renderNullable(row.order)
    },
    {
      key: 'wbipCidr',
      title: $t('page.manage.ipRule.wbipCidr'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'wbipType',
      title: $t('page.manage.ipRule.wbipType'),
      align: 'center',
      width: 110,
      render: row => <NTag type={ruleTypeTagMap[row.wbipType]}>{$t(ruleTypeLabelMap[row.wbipType])}</NTag>
    },
    {
      // 狀態欄＝混排清單的辨識錨（`deleted` 由後端 deleted_at 導出）
      key: 'status',
      title: $t('page.manage.ipRule.status'),
      align: 'center',
      width: 100,
      render: row => (
        <NTag type={row.deleted ? 'error' : 'success'}>
          {row.deleted ? $t('page.manage.ipRule.statusDeleted') : $t('page.manage.ipRule.statusActive')}
        </NTag>
      )
    },
    {
      // ★備註＝使用者可寫的自由文字：此處以 JSX 子節點插值，標記字元會被 Vue 逸出成字面（FR-038）
      key: 'wbipMemo',
      title: $t('page.manage.ipRule.wbipMemo'),
      align: 'center',
      minWidth: 140,
      render: row => renderNullable(row.wbipMemo)
    },
    {
      // RFC3339 帶 offset 直接顯示（不在前端二次格式化——時區換算是後端與人的共識面）
      key: 'createdAt',
      title: $t('page.manage.ipRule.createdAt'),
      align: 'center',
      minWidth: 180
    },
    {
      // 操作者帳號名（後端批次 enrich、查無即 null）
      key: 'createdBy',
      title: $t('page.manage.ipRule.createdBy'),
      align: 'center',
      minWidth: 110,
      render: row => renderNullable(row.createdBy)
    },
    {
      key: 'updatedAt',
      title: $t('page.manage.ipRule.updatedAt'),
      align: 'center',
      minWidth: 180,
      render: row => renderNullable(row.updatedAt)
    },
    {
      key: 'updatedBy',
      title: $t('page.manage.ipRule.updatedBy'),
      align: 'center',
      minWidth: 110,
      render: row => renderNullable(row.updatedBy)
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 170,
      // 依 `deleted` 切換兩組鈕：現役列＝編輯＋刪除、回收桶列＝僅復原。
      // 破壞性動作（刪除／復原）一律 NPopconfirm 二次確認。
      render: row =>
        row.deleted ? (
          <div class="flex-center gap-8px">
            {hasAuth('ipRule:restore') && (
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
            )}
          </div>
        ) : (
          <div class="flex-center gap-8px">
            {hasAuth('ipRule:edit') && (
              <NButton type="primary" ghost size="small" onClick={() => openEditDrawer(row.id)}>
                {$t('common.edit')}
              </NButton>
            )}
            {hasAuth('ipRule:delete') && (
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
            )}
          </div>
        )
    }
  ]
});

// 本頁無批次刪除 ⇒ 不取用 checkedRowKeys／onBatchDeleted。
const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

/**
 * 編輯鈕的轉接層。
 *
 * ★不在欄 render 內直接引用解構出的 `handleEdit`：那是 const，宣告位置在欄定義之後、屬「用在定義前」；
 * 函式宣告會提升，故包一層即可安全前置引用（沿本 repo `views/manage/role/index.vue` 的同形處理）。
 */
function openEditDrawer(id: number) {
  handleEdit(id);
}

async function handleDelete(id: number) {
  // 軟刪；★刪 allow 規則同樣可能觸發防自鎖（contracts §4），error 即 return、toast 由攔截層出
  const { error } = await fetchDeleteIpRule(id);
  if (error) {
    return;
  }

  onDeleted();
}

async function handleRestore(id: number) {
  // 復原；拒因含 notFound／conflict／selfLock（contracts §5），一律交攔截層
  const { error } = await fetchRestoreIpRule(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.ipRule.restoreSuccess'));

  await getData();
}
</script>

<template>
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
          <!--
            覆寫 default slot：本頁無批次刪除，只渲染新增鈕（權限碼 gating）。
            ★此 slot 不得渲染成全註解（B-099）：新增鈕若直接掛 v-if、hasAuth=false 時 slot 只剩註解 vnode，
            Vue renderSlot 判定內容無效即改渲染 **fallback**＝共用元件自帶的新增鈕與批次刪除鈕。本頁的
            TableHeaderOperation 只綁 @refresh、未綁 @add／@delete，故 fallback 兩鈕點下去是 no-op（無可寫入路徑）；
            實際危害＝無權使用者仍會看見不該有的寫端入口、且批次刪除鈕本頁根本不存在。故外層容器 div 永遠渲染
            （保底非註解節點）、以 v-show 於無權時移出版面（空 div 不佔 NSpace 間距）；內層 v-if 負責把互動入口自
            DOM 誠實移除。形照 menu/index.vue 既驗寫法——惟該頁確有 @add／@delete 綁定、其註解之「綁定仍活」子句
            對該頁為真、對本頁不成立故不照抄；條件亦取本頁之 hasAuth('ipRule:add')（不照抄 menu 的 !showDeleted）；
            gap-12px＝NSpace medium 水平間距同值。
          -->
          <template #default>
            <div v-show="hasAuth('ipRule:add')" class="flex-y-center gap-12px">
              <NButton v-if="hasAuth('ipRule:add')" size="small" ghost type="primary" @click="handleAdd">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                {{ $t('common.add') }}
              </NButton>
            </div>
          </template>
        </TableHeaderOperation>
      </template>
      <!-- ★scroll-x ＝上方 columns 的 Σ(width|minWidth) 逐位相等＝1414（本 repo 三支既有管理頁
           user／role／menu 皆守此不變式）：小於總和時視窗變窄，各欄宣告的 minWidth 無法全數兌現。
           增刪欄或調欄寬時本數字必須同批改。 -->
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1414"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
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
