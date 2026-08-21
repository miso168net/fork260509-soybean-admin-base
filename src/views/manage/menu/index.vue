<script setup lang="tsx">
import { ref } from 'vue';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 樹表資料源＋刪除批刪換 rev5 wrapper（直接路徑、不經 barrel——沿 rev5-role-admin 先例）；fetchGetAllPages 續走 barrel（route 家族、非本刀射程）；demo 版 fetchGetMenuList 續留凍結檔；原行: import { fetchGetAllPages, fetchGetMenuList } from '@/service/api';
import { fetchGetAllPages } from '@/service/api';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] menu 六端點 rev5 wrapper（T027；getMenuList/v2 路徑字面在 wrapper 內）
import { fetchBatchDeleteMenu, fetchDeleteMenu, fetchGetMenuList } from '@/service/api/rev5-menu-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

const appStore = useAppStore();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

const { columns, columnChecks, data, loading, pagination, getData, getDataByPage } = useNaivePaginatedTable({
  api: () => fetchGetMenuList(),
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
        />
      </template>
      <!--
        新增 menuMemo 欄（minWidth 120）⇒ scroll-x 隨欄寬總和 1088+120＝1208（欄寬總和不變式：scroll-x＝Σ(width|minWidth)，增刪欄時必須同批改）。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: :scroll-x="1088"
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
