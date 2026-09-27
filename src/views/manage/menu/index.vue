<script setup lang="tsx">
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 回收桶開關要 watch、治理清單分頁凍結要 computed；原行: import { ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 清單改打選單管理 wrapper（見下方新增 import；barrel 的同名 demo 版一行不動）、頁面下拉續走 barrel；原行: import { fetchGetAllPages, fetchGetMenuList } from '@/service/api';
import { fetchGetAllPages } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 選單管理 wrapper（直接路徑、不經 barrel）：治理清單、單刪、批刪、已刪清單、復原
import {
  fetchBatchDeleteMenu,
  fetchDeleteMenu,
  fetchGetDeletedMenus,
  fetchGetMenuList,
  fetchRestoreMenu
} from '@/service/api/rev6-menu-admin';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 回收桶開關與已刪清單的分頁參數（出處＝rev5:src/views/manage/menu/index.vue）。
// 開關打開＝資料源換成已刪清單、操作欄整欄換成「復原」；已刪清單走常規分頁，`deletedSearchParams` 只有已刪模式會送出。
// `MENU_DEFAULT_PAGE_SIZE`＝共用表格 hook（`hooks/common/table.ts`）的預設每頁筆數、亦為其每頁筆數選單首項：兩處是同一個約定，
// hook 改預設時此值要同改（寫成具名常數＝把這層相依寫在碼上）。切入已刪模式前每頁筆數先歸位成此值，故已刪模式首個請求恆為下方初值形。
const MENU_DEFAULT_PAGE_SIZE = 10;
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.MenuAdmin.MenuListQuery>({ current: 1, size: MENU_DEFAULT_PAGE_SIZE });
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useNaivePaginatedTable({
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 依回收桶開關換資料源：治理清單無參＝一次取全部頂層與全深子樹、已刪清單帶分頁參數；原行: api: () => fetchGetMenuList(),
  api: () => (showDeleted.value ? fetchGetDeletedMenus(deletedSearchParams.value) : fetchGetMenuList()),
  transform: response => defaultTransform(response),
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 分頁參數同步進已刪清單的查詢物件（治理清單不讀它、恆無參）
  onPaginationParamsChange: params => {
    deletedSearchParams.value.current = params.page;
    deletedSearchParams.value.size = params.pageSize;
  },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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

        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] wire 的 i18nKey 是資料庫自由字串（string | null），顯示時收斂成前端鍵型；查無此鍵時 $t 回鍵字面＝upstream 既有行為；原行: const label = i18nKey ? $t(i18nKey) : menuName;
        const label = i18nKey ? $t(i18nKey as App.I18n.I18nKey) : menuName;

        return <span>{label}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      render: row => {
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] wire 的 icon 可為 null、圖示元件只收 string | undefined，null 收斂成 undefined；原行: const icon = row.iconType === '1' ? row.icon : undefined;
        const icon = row.iconType === '1' ? (row.icon ?? undefined) : undefined;

        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 同上一行的 null 收斂；原行: const localIcon = row.iconType === '2' ? row.icon : undefined;
        const localIcon = row.iconType === '2' ? (row.icon ?? undefined) : undefined;

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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註欄：超管自由輸入的文字，不設 render、交表格預設輸出成純文字節點（null 即留白）
    {
      key: 'menuMemo',
      title: $t('page.manage.menu.menuMemo'),
      minWidth: 120
    },
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 已刪模式整欄換成「復原」（先過二次確認；不掛按鈕碼——此頁的門是頁級超管授權、復原另由後端逐列重驗），現役模式照原三鈕；原行: render: row => (
      render: row =>
        showDeleted.value ? (
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
        ) : (
          <div class="flex-center justify-end gap-8px">
            {row.menuType === '1' && (
              <NButton type="primary" ghost size="small" onClick={() => handleAddChildMenu(row)}>
                {$t('page.manage.menu.addChildMenu')}
              </NButton>
            )}
            <NButton type="primary" ghost size="small" onClick={() => handleEdit(row)}>
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

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 切換回收桶開關（出處＝rev5:src/views/manage/menu/index.vue）：
// ①切換即清勾選：兩個資料源的列不是同一群，殘留的勾選會把已刪 id 帶進批刪、整批被拒（rev5:B-100）。
// ②切入已刪模式前每頁筆數先歸位（rev5:B-132）：治理清單無參全取、回應的 `size`＝實得頂層數，共用 hook 會把它寫回每頁筆數——
//   該值不在每頁筆數選單內，又會經 `onPaginationParamsChange` 變成已刪清單請求的 `size`。先判等再賦值並提早返回：
//   頁碼與每頁筆數同一輪一起改只觸發 hook 一次重取，若再呼 `getDataByPage(1)`（頁碼已是 1 時直接重取）會變成一次切換兩個請求；
//   值未變的路徑（如切回治理清單）不觸發 hook，才由下方 `getDataByPage(1)` 補那一次重取。
watch(showDeleted, deleted => {
  checkedRowKeys.value = [];

  if (deleted && pagination.pageSize !== MENU_DEFAULT_PAGE_SIZE) {
    pagination.page = 1;
    pagination.pageSize = MENU_DEFAULT_PAGE_SIZE;
    return;
  }

  getDataByPage(1);
});

// 治理清單的分頁列凍結（出處＝rev5:854a72ee）：一次取全樹，分頁器對它恆無作用，故位置不動、改為第 1 頁／每頁 0／整列停用、前綴自顯真實筆數。
// ★`itemCount` 必須給 undefined：naive-ui 分頁元件算總頁數時筆數優先於頁數，留著筆數而每頁 0＝總頁數 Infinity，頁碼項產生器即
//   逐頁迴圈到 Infinity、瀏覽器凍死；筆數拔掉才走頁數分支（總頁數 1）。前綴自備是因為沒有筆數時，元件自算的筆數＝頁數×每頁筆數＝0。
const tablePagination = computed(() => {
  if (showDeleted.value) return pagination;

  const total = pagination.itemCount ?? 0;

  return {
    ...pagination,
    itemCount: undefined,
    pageCount: 1,
    page: 1,
    pageSize: 0,
    disabled: true,
    prefix: () => $t('datatable.itemCount', { total })
  };
});
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 批刪接真：任一標的被拒即整批不動；拒因提示由共用攔截層轉譯、本頁只看成敗（勾選鍵實為列 id、逐一轉數值）；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteMenu(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  onBatchDeleted();
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改 async：要等刪除回應定成敗；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 單刪接真：拒因提示由共用攔截層轉譯、本頁只看成敗；原行: console.log(id);
  const { error } = await fetchDeleteMenu(id);
  if (error) {
    return;
  }

  onDeleted();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 清掉已刪列的勾選：勾選鍵跨刷新保留，已刪 id 若留著、下一次批刪會因查無而整批被拒
  // （排在 onDeleted 之後＝與上方改行之間隔著一行原碼，本塊才是可單獨驗出的純新增段）
  checkedRowKeys.value = checkedRowKeys.value.filter(key => Number(key) !== id);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
}

/** the edit menu data or the parent menu data when adding a child menu */
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 列型改選單管理清單的 wire 列型（表格列即此型）；原行: const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);
const editingData: Ref<Api.MenuAdmin.MenuRecord | null> = ref(null);

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 參數型同步改 wire 列型；原行: function handleEdit(item: Api.SystemManage.Menu) {
function handleEdit(item: Api.MenuAdmin.MenuRecord) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 參數型同步改 wire 列型；原行: function handleAddChildMenu(item: Api.SystemManage.Menu) {
function handleAddChildMenu(item: Api.MenuAdmin.MenuRecord) {
  operateType.value = 'addChild';

  editingData.value = { ...item };

  openModal();
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 復原已刪選單：後端鎖列重驗後才復原、原啟停狀態保留、不回灌任何授權；
// 拒因提示由共用攔截層轉譯、本頁只看成敗
async function handleRestore(id: number) {
  const { error } = await fetchRestoreMenu(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.menu.restoreSuccess'));

  await getData();
}
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]

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
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 自閉合改成對標籤以承載 prefix 插槽的「顯示已刪除」開關；並加兩布林 prop：已刪模式不顯新增與批刪（預設插槽不覆寫）。兩個新屬性排在事件之後緊鄰閉合處——屬性之間放不了標記、須與本改行同塊才受本標記涵蓋；原行: /> -->
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
          :show-add="!showDeleted"
          :show-delete="!showDeleted"
        >
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.menu.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
        </TableHeaderOperation>
      </template>
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 下方 :scroll-x 隨新增備註欄（minWidth 120）改 1208＝各欄 width／minWidth 之和；標記無法置於標籤屬性之間、故緊鄰本元件之上；原行: :scroll-x="1088" -->
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 下方 :pagination 改綁 tablePagination（治理清單時為凍結版、已刪模式即原分頁物件）；標記位置理由同上；原行: :pagination="pagination" -->
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1208"
        :loading="loading"
        :row-key="row => row.id"
        remote
        :pagination="tablePagination"
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
