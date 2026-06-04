<script setup lang="tsx">
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NSwitch, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import {
  fetchBatchDeleteMenu,
  fetchDeleteMenu,
  fetchGetAllPages,
  fetchGetDeletedMenus,
  fetchGetMenuList,
  fetchRestoreMenu
} from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

const authStore = useAuthStore();

const { hasAuth } = useAuth();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

// 025 US1：回收桶 toggle — true 時資料源切到 getDeletedMenus、operate 欄只給「復原」
const showDeleted = ref(false);

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage, reloadColumns } =
  useNaivePaginatedTable({
  api: () => (showDeleted.value ? fetchGetDeletedMenus() : fetchGetMenuList()),
  transform: response => defaultTransform(response),
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
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 230,
      render: row => {
        if (showDeleted.value) {
          // 回收桶檢視：每列只給「復原」鈕（restore/getDeletedMenus 為 Super-only，後端強制）
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

// §2.26 / R4：getUserInfo 以 Object.assign 整批替換 userInfo.buttons（新陣列參照），故 shallow watch 即可偵測按鈕授權變動；
// reloadColumns() 重建 columns → operate 欄 render 重跑 → hasAuth 對最新 buttons 重算（建立可重用 reactive pattern 供 menu/user 頁沿用）。
watch(() => authStore.userInfo.buttons, () => reloadColumns());

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  const { error } = await fetchBatchDeleteMenu(checkedRowKeys.value);
  if (!error) {
    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMenu(id);
  if (!error) {
    onDeleted();
  }
}

async function handleRestore(id: Api.SystemManage.Menu['id']) {
  const { error } = await fetchRestoreMenu(id);
  if (!error) {
    window.$message?.success($t('page.manage.menu.restoreSuccess'));
    getData();
  }
}

// 切換回收桶檢視：清選取 → 重建 columns（operate 欄改 render）→ 換資料源重撈
function handleToggleDeleted(value: boolean) {
  showDeleted.value = value;
  checkedRowKeys.value = [];
  reloadColumns();
  getData();
}

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);

function handleEdit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
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
        <div class="flex-y-center gap-12px">
          <div class="flex-y-center gap-8px">
            <span>{{ $t('page.manage.menu.showDeleted') }}</span>
            <NSwitch :value="showDeleted" @update:value="handleToggleDeleted" />
          </div>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="showDeleted || checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="!showDeleted && hasAuth('menu:add')"
            @add="handleAdd"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
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
