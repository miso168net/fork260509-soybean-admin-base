<script setup lang="tsx">
// [rev4-inline (d) 010-menu-admin] 原行: import { ref } from 'vue';
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { fetchGetAllPages, fetchGetMenuList } from '@/service/api';
// [rev4-inline MODAL-WIRING(a) 010-menu-admin] delete/batchDelete 接線 WRAPPER（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchBatchDeleteMenu, fetchDeleteMenu, fetchGetDeletedMenus, fetchRestoreMenu } from '@/service/api/rev4-menu-admin';
// [rev4-inline MODAL-WIRING(b) 010-menu-admin] hasAuth gating 取用（menu:add/edit/delete 按鈕顯隱）
import { useAuth } from '@/hooks/business/auth';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

// [rev4-inline MODAL-WIRING(b) 010-menu-admin] hasAuth：操作鈕以 menu:add/edit/delete 按鈕碼 gating
const { hasAuth } = useAuth();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

// [rev4-inline (d) 010-menu-admin] 顯示已刪除 toggle 狀態＋回收桶分頁參（憲法 §III.2(d)；切換資料源 fetchGetMenuList⇄fetchGetDeletedMenus）
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.SystemManage.GetDeletedMenusParams>({ current: 1, size: 10 });

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useNaivePaginatedTable({
  // [rev4-inline (d) 010-menu-admin] 原行: api: () => fetchGetMenuList(),
  api: () => (showDeleted.value ? fetchGetDeletedMenus(deletedSearchParams.value) : fetchGetMenuList()),
  // [rev4-inline (d) 010-menu-admin] 回收桶分頁同步（鏡像 policy-archive onPaginationParamsChange；僅已刪模式消費 deletedSearchParams）
  onPaginationParamsChange: params => {
    deletedSearchParams.value.current = params.page ?? 1;
    deletedSearchParams.value.size = params.pageSize ?? 10;
  },
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
      // [rev4-inline MODAL-WIRING(b) 010-menu-admin] 列操作鈕 hasAuth gating：addChild→menu:add（疊 menuType==='1'）、edit→menu:edit、delete→menu:delete 顯隱
      // [rev4-inline MODAL-WIRING(b) 010-menu-admin] 原行: {row.menuType === '1' && (
      render: row => (
        // [rev4-inline (d) 010-menu-admin] 已刪模式操作欄換逐列 restore 鈕、隱 addChild/edit/delete（憲法 §III.2(d)；鏡像 policy-archive restore 鈕）
        showDeleted.value ? (
          <div class="flex-center justify-end gap-8px">
            <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
              {{
                default: () => $t('page.manage.menu.confirmRestore'),
                trigger: () => (
                  <NButton type="primary" ghost size="small">
                    {$t('page.manage.policyArchive.restore')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        ) : (
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
        )
      )
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

// [rev4-inline (d) 010-menu-admin] 切換顯示已刪除 → 回第一頁重取（憲法 §III.2(d)）
watch(showDeleted, () => {
  getDataByPage(1);
});

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  // [rev4-inline MODAL-WIRING(a) 010-menu-admin] 原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteMenu(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部復用凍結 fetchGetMenuList（getData）刷新列表＋清選取
  onBatchDeleted();
}

// [rev4-inline MODAL-WIRING(a) 010-menu-admin] 原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev4-inline MODAL-WIRING(a) 010-menu-admin] 原行: console.log(id);
  const { error } = await fetchDeleteMenu(id);
  if (error) {
    return;
  }

  // onDeleted 內部復用凍結 fetchGetMenuList（getData）刷新列表
  onDeleted();
}

// [rev4-inline (d) 010-menu-admin] 復原已刪選單（憲法 §III.2(d)；鏡像 policy-archive handleRestore：error 才 return→success toast→getData 刷新）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreMenu(id);
  if (error) {
    // notFound／parent 未活 等業務碼由共用攔截器 onError 彈訊息（明細通道）
    return;
  }

  window.$message?.success($t('page.manage.policyArchive.restoreSuccess'));

  await getData();
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
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!-- [rev4-inline (d) 010-menu-admin START] 顯示已刪除 toggle（憲法 §III.2(d) 錨點；prefix slot 常駐、切換資料源＋操作欄；仿 system-settings NSwitch、prefix 為 upstream 擴充點不動共用元件） -->
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.menu.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
          <!-- [rev4-inline (d) 010-menu-admin END] -->
          <!-- [rev4-inline MODAL-WIRING(b) 010-menu-admin START] 覆寫 default slot、以 menu:add/menu:delete 顯隱 add/batchDelete 鈕（憲法 §III MODAL-WIRING (b)；不動共用 table-header-operation.vue、gating 全落 index.vue） -->
          <template #default>
            <NButton v-if="!showDeleted && hasAuth('menu:add')" size="small" ghost type="primary" @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </NButton>
            <NPopconfirm v-if="!showDeleted && hasAuth('menu:delete')" @positive-click="handleBatchDelete">
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
          <!-- [rev4-inline MODAL-WIRING(b) 010-menu-admin END] -->
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
