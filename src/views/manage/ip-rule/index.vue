<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
// [rev3-inline 022-ip-access-control MW] IP 規則 CRUD + 手動解鎖 wrapper 直接路徑 import（非 barrel）
import { fetchDeleteIpRule, fetchGetIpRuleList, fetchRestoreIpRule } from '@/service/api/rev3-system-manage';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { ref } from 'vue';
import IpRuleSearch from './modules/ip-rule-search.vue';
import IpRuleOperateModal from './modules/ip-rule-operate-modal.vue';
import IpRuleUnlockModal from './modules/ip-rule-unlock-modal.vue';

// [rev3-inline 022-ip-access-control T023] IP 存取控制管理頁（list 含已刪+Deleted欄+搜索分頁+CRUD+復原 比照 menu；手動解鎖 modal）
// 頁為 R_SUPER-only（m007 menu policy `manage_ip-rule` + dynamic getUserRoutes 自動）；API 亦 policy-gated（require_policy）；
// IP 規則無獨立 button-policy 種子 → 不以 hasAuth 假碼隱藏（會對所有人隱藏）；後端 require_policy 為安全邊界（同 policy-archive）。
defineOptions({
  name: 'ManageIpRule'
});

const appStore = useAppStore();

const { bool: unlockVisible, setTrue: openUnlock } = useBoolean();

const searchParams = ref<Api.SystemManage.IpRuleSearchParams>({
  current: 1,
  size: 10,
  cidr: null,
  ruleType: null
});

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
      key: 'cidr',
      title: $t('page.manage.ipRule.cidr'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'ruleType',
      title: $t('page.manage.ipRule.ruleType'),
      align: 'center',
      width: 140,
      render: row => {
        const tagMap: Record<Api.SystemManage.IpRuleType, NaiveUI.ThemeColor> = {
          allow: 'success',
          deny: 'error'
        };
        const labelMap: Record<Api.SystemManage.IpRuleType, App.I18n.I18nKey> = {
          allow: 'page.manage.ipRule.ruleTypeMap.allow',
          deny: 'page.manage.ipRule.ruleTypeMap.deny'
        };
        return <NTag type={tagMap[row.ruleType]}>{$t(labelMap[row.ruleType])}</NTag>;
      }
    },
    {
      key: 'order',
      title: $t('page.manage.ipRule.order'),
      align: 'center',
      width: 80,
      render: row => (row.order === null ? $t('page.manage.ipRule.empty') : String(row.order))
    },
    {
      key: 'description',
      title: $t('page.manage.ipRule.description'),
      align: 'center',
      minWidth: 160,
      render: row => (row.description === null ? $t('page.manage.ipRule.empty') : row.description)
    },
    {
      key: 'deleted',
      title: $t('page.manage.ipRule.deleted'),
      align: 'center',
      width: 90,
      render: row => {
        const type: NaiveUI.ThemeColor = row.deleted ? 'error' : 'success';
        const label = row.deleted ? $t('page.manage.ipRule.statusDeleted') : $t('page.manage.ipRule.statusActive');
        return <NTag type={type}>{label}</NTag>;
      }
    },
    {
      key: 'createTime',
      title: $t('page.manage.ipRule.createTime'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'updateTime',
      title: $t('page.manage.ipRule.updateTime'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 160,
      // 已刪除列→復原鈕（比照 menu）；現役列→編輯/刪除
      render: row => {
        if (row.deleted) {
          return (
            <div class="flex-center justify-center gap-8px">
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
          );
        }

        return (
          <div class="flex-center justify-center gap-8px">
            <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
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
        );
      }
    }
  ]
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, onDeleted } = useTableOperate(data, 'id', getData);

async function handleDelete(id: number) {
  const { error } = await fetchDeleteIpRule(id);
  if (!error) {
    onDeleted();
  }
}

// 復原已刪除規則（同 (cidr,ruleType) 已有 active→2222 conflict toast；成功則 reload）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreIpRule(id);
  if (!error) {
    window.$message?.success($t('page.manage.ipRule.restoreSuccess'));
    getDataByPage();
  }
}

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <IpRuleSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.ipRule.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-delete="false"
          @add="handleAdd"
          @refresh="getData"
        >
          <template #prefix>
            <NButton size="small" ghost type="warning" @click="openUnlock">
              {{ $t('page.manage.ipRule.unlock.trigger') }}
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1080"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <IpRuleOperateModal
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <IpRuleUnlockModal v-model:visible="unlockVisible" @submitted="getDataByPage" />
    </NCard>
  </div>
</template>

<style scoped></style>
