<script setup lang="tsx">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 回收桶 toggle 需 watch（切換即回第一頁重取——rev4: (d) 010-menu-admin 同形）；原行: import { ref } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) maint-b097] computed 供治理清單分頁凍結（B-097／ADR 0060）；原行: import { ref, watch } from 'vue';
import { computed, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 樹表資料源＋刪除批刪換 rev5 wrapper（直接路徑、不經 barrel——沿 rev5-role-admin 先例）；fetchGetAllPages 續走 barrel（route 家族、非本刀射程）；demo 版 fetchGetMenuList 續留凍結檔；原行: import { fetchGetAllPages, fetchGetMenuList } from '@/service/api';
import { fetchGetAllPages } from '@/service/api';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] menu 端點 rev5 wrapper（T027 六支＋T031 回收桶兩支；getMenuList/v2 路徑字面在 wrapper 內）
import {
  fetchBatchDeleteMenu,
  fetchDeleteMenu,
  fetchGetDeletedMenus,
  fetchGetMenuList,
  fetchRestoreMenu
} from '@/service/api/rev5-menu-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 「顯示已刪除」toggle
// 狀態＋回收桶分頁參（rev4: (d) 010-menu-admin toggle 形重打；開＝資料源換打 getDeletedMenus、
// 操作欄整欄換「復原」；已刪模式僅此頁消費 deletedSearchParams）
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.MenuAdmin.ListQuery>({ current: 1, size: 10 });
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END]

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useNaivePaginatedTable({
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] toggle 切資料源（治理清單⇄回收桶——契約 §1/§7；rev4: (d) 同形）；原行: api: () => fetchGetMenuList(),
  api: () => (showDeleted.value ? fetchGetDeletedMenus(deletedSearchParams.value) : fetchGetMenuList()),
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 回收桶分頁同步
  // （僅已刪模式消費 deletedSearchParams；治理清單維持無參一次取全樹形）
  onPaginationParamsChange: params => {
    deletedSearchParams.value.current = params.page ?? 1;
    deletedSearchParams.value.size = params.pageSize ?? 10;
  },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END]
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

        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 接真後 i18nKey 為 wire 誠實 string|null（DB 自由字串）、顯示時收斂前端鍵型；查無鍵時 $t 回退鍵字面＝upstream 既有行為；原行: const label = i18nKey ? $t(i18nKey) : menuName;
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
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 接真後 icon 誠實 nullable（wire 契約）、SvgIcon prop 只收 string|undefined——null 收斂 undefined；原行: const icon = row.iconType === '1' ? row.icon : undefined;
        const icon = row.iconType === '1' ? (row.icon ?? undefined) : undefined;

        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 同上 null 收斂；原行: const localIcon = row.iconType === '2' ? row.icon : undefined;
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
    {
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 新增 menuMemo 欄（FR-043 memo 欄兌現；
      // B-003 語意：R_SUPER 備註、顯示於管理列表）。★使用者可寫的自由文字：不設 render、
      // 走 NDataTable 預設純文字渲染（照 004 wbip_memo 範式；null 整格空白＝本頁對 null 的既有慣例）
      key: 'menuMemo',
      title: $t('page.manage.menu.menuMemo'),
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.menu.menuStatus'),
      align: 'center',
      width: 80,
      render: row => {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 接真後 status 恆 '1'|'2'（後端二值收斂、wire 契約非 null）——demo 型的 null 分支結構性不可達、刪之（留著即 typecheck TS2367 紅）；原行: if (row.status === null) {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: return null;
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
      render: row => (
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 已刪模式操作欄
        // 整欄換「復原」（無按鈕碼 gating——門＝頁級 R_SUPER＋列級復原重驗；confirmRestore
        // 確認流；rev4: (d) 010-menu-admin 同形、rev4 hasAuth gating 不帶回——rev5 拍板不 gating）
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
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END]
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
      )
    }
  ]
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 切換顯示已刪除→
// 回第一頁重取（兩資料源分頁語意不同：治理清單以頂層計、回收桶以已刪列計）；切換即清勾選
// ——兩資料源的列不同族、跨源殘留勾選會把已軟刪 id 送進批刪（B-100：已刪模式亦有 selection
// 欄可勾，勾完關 toggle 即解除批刪鈕的 disabled，送出後端整批拒 2222 notFound）
watch(showDeleted, () => {
  checkedRowKeys.value = [];
  getDataByPage(1);
});
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END]

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 批刪接真（rev4: 同形接線）：契約 §6 child-first 拓撲序逐項全套守門、任一違規整批拒（no-partial）；拒因 toast 由共用攔截層轉譯 backend.biz.menu.*、此處只看 error；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteMenu(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部以 getData 刷新列表＋清選取；★成功後零追加「生效」呼叫（判定面同步在後端 commit 後 reload）
  onBatchDeleted();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改 async 接真（rev4: 同形接線）；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 單刪接真：契約 §5 守門固定序 protected→存在未刪子項；拒因 toast 由攔截層出、此處只看 error；原行: console.log(id);
  const { error } = await fetchDeleteMenu(id);
  if (error) {
    return;
  }

  onDeleted();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 復原已刪選單
// （契約 §8：域內鎖列重驗〔已刪存在→同鍵活性衝突 restoreConflict→父未刪 parentNotFound〕、
// 原 status 保留、零授權回灌；拒因 toast 由共用攔截層轉譯 backend.biz.menu.*、此處只看 error）
async function handleRestore(id: number) {
  const { error } = await fetchRestoreMenu(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.menu.restoreSuccess'));

  await getData();
}
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END]

/** the edit menu data or the parent menu data when adding a child menu */
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 型別切 rev5 獨立命名空間（接真 wire 形）；原行: const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);
const editingData: Ref<Api.MenuAdmin.MenuRecord | null> = ref(null);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 參數型別同步切換；原行: function handleEdit(item: Api.SystemManage.Menu) {
function handleEdit(item: Api.MenuAdmin.MenuRecord) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 參數型別同步切換；原行: function handleAddChildMenu(item: Api.SystemManage.Menu) {
function handleAddChildMenu(item: Api.MenuAdmin.MenuRecord) {
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
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) maint-b097 START] 治理清單分頁凍結（B-097／ADR 0060）
// 治理清單走 fetchGetMenuList() 無參＝一次取全樹（後端 size 預設 100、rev4 as-built 同形），
// 分頁器故對它恆無效：改 pageSize 會被 onFetched 的 `pagination.pageSize = data.pageSize` 回彈成
// 100（且 100 不在 pageSizes [10,15,20,25,30] 內）。此處不抽掉分頁列、改「凍結」——UI 位置不動，
// 僅把三個數字歸位並整列上鎖（user 拍板 2026-08-25）。
// ★itemCount MUST 傳 undefined：naive-ui 之 mergedPageCountRef 讓 itemCount 優先於 pageCount
// （Pagination.mjs「item count has high priority」），保留 itemCount 時 pageSize=0 會令
// pageCount = Math.ceil(11/0) = Infinity，而 createPageItemsInfo 的 rightSplit 分支據此呼叫
// createRange(8, Infinity)＝`for (i=8; i<=Infinity; ++i)` ⇒ 分頁不是被凍結、是把瀏覽器凍死
// （2026-08-25 實測：POC 頁面卡死、CDP 腳本逾時零輸出）。故走 pageCount 分支並自備 prefix。
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
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) maint-b097 END]

</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <!--
          自閉合改開閉標——TableHeaderOperation 需承載 prefix／default 兩 slot（皆共用元件既有擴充點、table-header-operation.vue 一行不動）。
          ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: />
        -->
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!--
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 回收桶 UI 入口兩件：
            ①「顯示已刪除」toggle（prefix slot；v-model 綁 showDeleted＝資料源／操作欄切換的唯一寫入者；
            NSwitch 走 unplugin 全域註冊、毋須 script import——rev4: (d) 010-menu-admin 同形重打）。
            ②已刪模式下新增／批量刪除入口不現（資料源語意不同：新增後刷新的是已刪清單、批刪打已軟刪列必
            notFound）：覆寫 default slot、!showDeleted 條件化（鈕形照共用元件 default slot 原形重打；
            rev4: MODAL-WIRING(b) 同段之 hasAuth('menu:add'/'menu:delete') 按鈕碼 gating 為 rev5 已推翻
            行為〔spec 拍板不 gating、頁級 R_SUPER 即門〕、不帶回）。
          -->
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.menu.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
          <!--
            ★此 slot 不得渲染成全註解：兩鈕若直接掛 v-if、已刪模式下 slot 只剩註解 vnode，
            Vue renderSlot 判定內容無效即改渲染 **fallback**（共用元件自帶的新增／批刪鈕、
            且 @add/@delete 綁定仍活）——寫端入口反而冒回來。故外層容器 div 永遠渲染
            （保底非註解節點）、以 v-show 於已刪模式移出版面（空 div 不佔 NSpace 間距）；
            內層 v-if 負責把互動入口自 DOM 誠實移除。gap-12px＝NSpace medium 水平間距同值。
          -->
          <template #default>
            <div v-show="!showDeleted" class="flex-y-center gap-12px">
              <NButton v-if="!showDeleted" size="small" ghost type="primary" @click="handleAdd">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                {{ $t('common.add') }}
              </NButton>
              <NPopconfirm v-if="!showDeleted" @positive-click="handleBatchDelete">
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
            </div>
          </template>
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END] -->
        </TableHeaderOperation>
      </template>
      <!--
        新增 menuMemo 欄（minWidth 120）⇒ scroll-x 隨欄寬總和 1088+120＝1208（欄寬總和不變式：scroll-x＝Σ(width|minWidth)，增刪欄時必須同批改）。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: :scroll-x="1088"
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) maint-b097] 治理清單模式綁凍結版（B-097／ADR 0060）；原行: :pagination="pagination"
      -->
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
