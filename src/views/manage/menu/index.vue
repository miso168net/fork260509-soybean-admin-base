<script setup lang="tsx">
import { ref } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { fetchGetAllPages } from '@/service/api';
// [rev3-inline 010-menu-management MW(a)] 寫端+統一清單 wrapper 直接路徑 import（非 barrel）
import {
  fetchBatchDeleteMenu,
  fetchDeleteMenu,
  fetchGetMenuListV2,
  fetchRestoreMenu
} from '@/service/api/rev3-system-manage';
// [rev3-inline 010-menu-management MW(b)] hasAuth gating
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

// [rev3-inline 010-menu-management MW(b)] 寫入鈕依按鈕層權限顯隱（前端體驗層、後端 require_policy 仍為安全邊界）
const { hasAuth } = useAuth();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

// [rev3-inline 010-menu-management MW(a)] 統一清單 read：rust getMenuList/v2 回【裸陣列樹】（非分頁包）；
//   既有 defaultTransform 解構 {records} 對裸陣列回 undefined → 表空 → 改用 custom transform 包成 PaginationData（含已刪除節點）
const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useNaivePaginatedTable({
  api: () => fetchGetMenuListV2(),
  transform: response => {
    const rows = response.error ? [] : response.data || [];
    return {
      data: rows,
      pageNum: 1,
      pageSize: rows.length || 10,
      total: rows.length
    };
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: $t('page.manage.menu.id'),
      align: 'center'
    },
    {
      key: 'menuType',
      title: $t('page.manage.menu.menuType'),
      align: 'center',
      width: 80,
      render: row => {
        const tagMap: Record<Api.SystemManage.MenuType, NaiveUI.ThemeColor> = {
          1: 'default',
          2: 'primary'
        };

        const label = $t(menuTypeRecord[row.menuType]);

        return <NTag type={tagMap[row.menuType]}>{label}</NTag>;
      }
    },
    {
      key: 'menuName',
      title: $t('page.manage.menu.menuName'),
      align: 'center',
      minWidth: 120,
      render: row => {
        const { i18nKey, menuName } = row;

        const label = i18nKey ? $t(i18nKey) : menuName;

        return <span>{label}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      render: row => {
        const icon = row.iconType === '1' ? row.icon : undefined;

        const localIcon = row.iconType === '2' ? row.icon : undefined;

        return (
          <div class="flex-center">
            <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
          </div>
        );
      }
    },
    {
      key: 'routeName',
      title: $t('page.manage.menu.routeName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'routePath',
      title: $t('page.manage.menu.routePath'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.menu.menuStatus'),
      align: 'center',
      width: 80,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'hideInMenu',
      title: $t('page.manage.menu.hideInMenu'),
      align: 'center',
      width: 80,
      render: row => {
        const hide: CommonType.YesOrNo = row.hideInMenu ? 'Y' : 'N';

        const tagMap: Record<CommonType.YesOrNo, NaiveUI.ThemeColor> = {
          Y: 'error',
          N: 'default'
        };

        const label = $t(yesOrNoRecord[hide]);

        return <NTag type={tagMap[hide]}>{label}</NTag>;
      }
    },
    {
      key: 'parentId',
      title: $t('page.manage.menu.parentId'),
      width: 90,
      align: 'center'
    },
    {
      key: 'order',
      title: $t('page.manage.menu.order'),
      align: 'center',
      width: 60
    },
    // [rev3-inline 010-menu-management MW(a)] 已刪除欄（統一清單回收桶；讀 row.deleted）
    {
      key: 'deleted',
      title: $t('page.manage.menu.deleted'),
      align: 'center',
      width: 90,
      render: row => {
        const type: NaiveUI.ThemeColor = row.deleted ? 'error' : 'success';
        const label = row.deleted ? $t('page.manage.menu.statusDeleted') : $t('page.manage.menu.statusActive');
        return <NTag type={type}>{label}</NTag>;
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 230,
      // [rev3-inline 010-menu-management MW(a)+MW(b)] 已刪除列→復原鈕；現役列→addChild/edit/delete（皆依 hasAuth gating）
      render: row => {
        if (row.deleted) {
          if (!hasAuth('menu:edit')) {
            return null;
          }
          return (
            <div class="flex-center justify-end gap-8px">
              <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
                {{
                  default: () => $t('page.manage.menu.confirmRestore'),
                  trigger: () => (
                    <NButton type="primary" ghost size="small">
                      {$t('page.manage.menu.restore')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
            </div>
          );
        }

        return (
          <div class="flex-center justify-end gap-8px">
            {row.menuType === '1' && hasAuth('menu:add') && (
              <NButton type="primary" ghost size="small" onClick={() => handleAddChildMenu(row)}>
                {$t('page.manage.menu.addChildMenu')}
              </NButton>
            )}
            {hasAuth('menu:edit') && (
              <NButton type="primary" ghost size="small" onClick={() => handleEdit(row)}>
                {$t('common.edit')}
              </NButton>
            )}
            {hasAuth('menu:delete') && (
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
        );
      }
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  // [rev3-inline 010-menu-management MW(a)] 原 stub：console.log(checkedRowKeys.value);onBatchDeleted();
  // 後端逐項獨立驗證、整批拒（父含 active 子→整批拒、無 partial）
  const { error } = await fetchBatchDeleteMenu(checkedRowKeys.value);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  // [rev3-inline 010-menu-management MW(a)] 原 stub：console.log(id);onDeleted();
  const { error } = await fetchDeleteMenu(id);
  if (!error) {
    onDeleted();
  }
}

// [rev3-inline 010-menu-management MW(a)] 復原已刪除選單（父已刪→後端置頂層、不產生孤兒）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreMenu(id);
  if (!error) {
    onDeleted();
  }
}

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.MenuListItem | null> = ref(null);

function handleEdit(item: Api.SystemManage.MenuListItem) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.MenuListItem) {
  operateType.value = 'addChild';

  editingData.value = { ...item };

  openModal();
}

const allPages = ref<string[]>([]);

async function getAllPages() {
  const { data: pages } = await fetchGetAllPages();
  allPages.value = pages || [];
}

function init() {
  getAllPages();
}

// init
init();
</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <!-- [rev3-inline 010-menu-management MW(b)] 寫入鈕 hasAuth gating（override default slot 條件顯隱 add/batchDelete） -->
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #default>
            <NButton v-if="hasAuth('menu:add')" size="small" ghost type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </NButton>
            <NPopconfirm v-if="hasAuth('menu:delete')" @positive-click="handleBatchDelete">
              <template #trigger>
                <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                  <template #icon>
                    <icon-ic-round-delete class="text-icon" />
                  </template>
                  {{ $t('common.batchDelete') }}
                </NButton>
              </template>
              {{ $t('common.confirmDelete') }}
            </NPopconfirm>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1088"
        :loading="loading"
        :row-key="row => row.id"
        remote
        :pagination="pagination"
        class="sm:h-full"
      />
      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-pages="allPages"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
