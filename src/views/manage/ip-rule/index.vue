<!-- [rev6-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則管理頁主檔（新增檔；上游基線無此路徑）——搜尋卡＋現役與回收桶混排的清單＋新增／編輯抽屜＋逐列軟刪／復原 -->
<script setup lang="tsx">
// 不變式（驗收＝specs/004-ip-trust-anchor/spec.md SC-010 結構清單；出處＝rev5:src/views/manage/ip-rule/index.vue）：
// · 四顆操作鈕各接一個按鈕權限碼（`ipRule:add|edit|delete|restore`）。這層只管「看不看得到」，安全邊界在後端的政策判定。
// · 失敗提示不在本頁處理：業務拒絕與 HTTP 層拒絕都由 `service/request` 的 onError 鏈轉譯後出 toast，本頁只看 `error` 有無。
// · 寫入成功後只刷新清單；判定面的重載與跨實例廣播由後端自己做。
// · 備註是使用者自由輸入的文字：欄 render 只回字串、由 Vue 當純文字節點輸出。本目錄禁用任何原始 HTML 注入寫法
//   （機器守＝tools/view-render-guard.py；該守門逐字掃原文、不分註解與碼，故此處不寫出被禁的字面）。
// · script 用 tsx＝欄 render 需要 JSX，同 `views/manage/role/index.vue`。
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
// 直接路徑 import、不經 barrel（理由見該檔檔頭）
import { fetchDeleteIpRule, fetchGetIpRuleList, fetchRestoreIpRule } from '@/service/api/rev6-ip-rule';
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import IpRuleOperateDrawer from './modules/ip-rule-operate-drawer.vue';
import IpRuleSearch from './modules/ip-rule-search.vue';

const appStore = useAppStore();

const { hasAuth } = useAuth();

// `deleted` 起始值取 'all'＝後端缺省值：首屏就是現役與回收桶混排，回收桶列不必先切篩選才看得到。
const searchParams = ref<Api.IpRule.IpRuleListQuery>({
  current: 1,
  size: 10,
  wbipCidr: null,
  wbipType: null,
  deleted: 'all'
});

const ruleTypeTagMap: Record<Api.IpRule.RuleType, NaiveUI.ThemeColor> = {
  allow: 'success',
  deny: 'error'
};

const ruleTypeLabelMap: Record<Api.IpRule.RuleType, App.I18n.I18nKey> = {
  allow: 'page.manage.ipRule.ruleTypeMap.allow',
  deny: 'page.manage.ipRule.ruleTypeMap.deny'
};

/** 可空欄的顯示降級：null 顯破折號。本頁一列有五格可能同時為 null，留白會分不出「沒有值」與「沒載到」。 */
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
      // 排序值只影響顯示、不影響判定（any-match）
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
      // 混排清單靠這一欄分辨現役列與回收桶列
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
      // 自由文字欄：render 回字串＝純文字節點，標記字元原樣顯示
      key: 'wbipMemo',
      title: $t('page.manage.ipRule.wbipMemo'),
      align: 'center',
      minWidth: 140,
      render: row => renderNullable(row.wbipMemo)
    },
    {
      // 後端給的 RFC3339 字面原樣顯示、前端不另做時區換算
      key: 'createdAt',
      title: $t('page.manage.ipRule.createdAt'),
      align: 'center',
      minWidth: 180
    },
    {
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
      // 回收桶列只給復原；現役列給編輯＋刪除。刪除與復原都先過二次確認。
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

// 本頁沒有批次刪除，勾選列與批刪回呼不取用。
const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(
  data,
  'id',
  getData
);

/** 欄 render 寫在 `handleEdit`（const）宣告之前；函式宣告會提升，隔這一層才能在欄定義裡前置引用（role 頁同形）。 */
function openEditDrawer(id: number) {
  handleEdit(id);
}

async function handleDelete(id: number) {
  // 刪掉放行規則也可能因防自鎖被後端拒絕；被拒時提示已由 onError 鏈送出
  const { error } = await fetchDeleteIpRule(id);
  if (error) {
    return;
  }

  onDeleted();
}

async function handleRestore(id: number) {
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
    <NCard :title="$t('page.manage.ipRule.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
          <!--
            覆寫 default 插槽＝只留新增鈕（本頁無批次刪除）。外層 div 恆渲染、內層按鈕才掛 v-if：
            若把 v-if 直接掛在按鈕上，無權時插槽只剩註解節點，Vue 會判插槽為空而改渲染共用元件自帶的
            備援內容（新增鈕＋批次刪除鈕）——無權者反而看見兩顆寫入口（出處＝rev5:1597a671）。
            外層以 v-show 在無權時移出版面、不佔間距；gap-12px 同 NSpace 預設水平間距。
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
      <!-- scroll-x 1414＝上方各欄 width／minWidth 之和；增刪欄或調欄寬須同批改，否則窄視窗下 minWidth 兌現不了 -->
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
