<script setup lang="tsx">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 watch（回收桶 toggle 切資料源時清勾選＋回第一頁，見檔尾）；原行: import { ref } from 'vue';
import { ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 資料源與單刪／批刪／復原全數改 rev5 wrapper（★直接路徑、不經 barrel——沿 rev5-role-admin／rev5-ip-rule 先例）；demo 殼的同名 fetchGetUserList 續留 barrel 供 demo 面、一行不動（其去留＝B-018、不在本刀射程）；原行: import { fetchGetUserList } from '@/service/api';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetDeletedUsers,
  fetchGetUserList,
  fetchRestoreUser
} from '@/service/api/rev5-user-admin';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const appStore = useAppStore();

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 「顯示已刪除」toggle 狀態＋回收桶分頁參
// （契約 §2 之 getDeletedUsers 只收 `{current, size}`、無過濾欄，故回收桶側自持一份分頁參；形照本 repo
// views/manage/menu/index.vue 既有 toggle。rev4: 承 rev4 user 頁 (d) 同形重打——rev4 借 page.manage.menu 的
// i18n 鍵，rev5 改 page.manage.user 自備〔R2#15〕）。
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.UserAdmin.DeletedListQuery>({ current: 1, size: 10 });

/**
 * 會話政策三值 → i18n 鍵（列表欄的顯示映射；值域＝契約 §共用型 `SessionPolicy`）。
 *
 * ★不做 `?? 兜底`：值域是 wire 契約面（憲法 §I.3 typings 為唯一權威）、寫端亦以
 * `sessionPolicyInvalid` 把關，形照本 repo views/manage/ip-rule/index.vue 之 `ruleTypeLabelMap` 既有範式。
 */
const sessionPolicyLabelMap: Record<Api.UserAdmin.SessionPolicy, App.I18n.I18nKey> = {
  inherit: 'page.manage.user.sessionPolicyOption.inherit',
  single: 'page.manage.user.sessionPolicyOption.single',
  multi: 'page.manage.user.sessionPolicyOption.multi'
};
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

const searchParams = ref<Api.SystemManage.UserSearchParams>({
  current: 1,
  size: 10,
  status: null,
  userName: null,
  userGender: null,
  nickName: null,
  userPhone: null,
  userEmail: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] toggle 切兩資料源（現役清單⇄回收桶——契約 §1／§2；★回收桶側同樣帶分頁參、不走無參一次取全的呼法）。
  // ★送出的查詢欄**逐欄顯式列出、不整包散開 searchParams**：搜尋卡的型（凍結檔 user-search.vue 持有）另帶
  // userPhone／userEmail 兩欄，而契約 §1 的過濾面恰四欄——整包送出會讓「畫面上可以填」看起來像「後端會濾」，
  // 而後端對那兩欄是沉默忽略的（該兩欄在本刀屬已知面：搜尋卡明文零改動＝憲法 §III.2 (v) 列）。
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: api: () => fetchGetUserList(searchParams.value),
  api: () =>
    showDeleted.value
      ? fetchGetDeletedUsers(deletedSearchParams.value)
      : fetchGetUserList({
          current: searchParams.value.current,
          size: searchParams.value.size,
          userName: searchParams.value.userName,
          nickName: searchParams.value.nickName,
          status: searchParams.value.status,
          userGender: searchParams.value.userGender
        }),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 回收桶分頁同步（僅已刪模式消費 deletedSearchParams；形照 menu 頁）
    deletedSearchParams.value.current = params.page ?? 1;
    deletedSearchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userGender',
      title: $t('page.manage.user.userGender'),
      align: 'center',
      width: 100,
      render: row => {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 接真後 userGender 之 wire 型為 `string | null`（契約 §共用型逐字）——後端誠實 `to_string`、**未**套 status 那顆二值收斂器，故值域外（DB 歷史值）在型面上是可達的。收斂改判「非 '1' 非 '2' 即不渲染」：舊形只擋 null，值域外會拿 undefined 去索引色表與譯文鍵，畫面出現一顆無色標籤配一段裸鍵；原行: if (row.userGender === null) {
        const gender = row.userGender;

        if (gender !== '1' && gender !== '2') {
          return null;
        }

        const tagMap: Record<Api.SystemManage.UserGender, NaiveUI.ThemeColor> = {
          1: 'primary',
          2: 'error'
        };

        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 改讀收斂後的區域變數（型＝'1'|'2'）；原行: const label = $t(userGenderRecord[row.userGender]);
        const label = $t(userGenderRecord[gender]);

        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 同上；原行: return <NTag type={tagMap[row.userGender]}>{label}</NTag>;
        return <NTag type={tagMap[gender]}>{label}</NTag>;
      }
    },
    {
      key: 'nickName',
      title: $t('page.manage.user.nickName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userPhone',
      title: $t('page.manage.user.userPhone'),
      align: 'center',
      width: 120
    },
    {
      key: 'userEmail',
      title: $t('page.manage.user.userEmail'),
      align: 'center',
      minWidth: 200
    },
    {
      key: 'status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      render: row => {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 接真後 status 恆 '1'|'2'（後端 db_status_to_wire 二值收斂、wire 契約非 null）——demo 型的 null 分支結構性不可達、刪之（留著即 typecheck TS2367 紅；形照 role 頁同段）；原行: if (row.status === null) {
        // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: return null;
        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 接真後新增七欄（FR-035，四類：角色／
    // 會話政策／記事／審計欄）。★rev4 的 user 頁只有基線九欄、無此七欄＝rev5 拍板差異（列表要看得到角色與稽核面）。
    {
      // 角色 code 集（成員身分口徑：濾已軟刪角色、不濾角色 status；回收桶列恆空＝復原零回灌）。
      // ★純文字插值——以 `backend.common.listSeparator` 串接後交 NDataTable 預設渲染。
      key: 'roles',
      title: $t('page.manage.user.roles'),
      align: 'center',
      minWidth: 140,
      render: row => row.roles.join($t('backend.common.listSeparator'))
    },
    {
      key: 'sessionPolicy',
      title: $t('page.manage.user.sessionPolicy'),
      align: 'center',
      width: 110,
      render: row => $t(sessionPolicyLabelMap[row.sessionPolicy])
    },
    {
      // ★記事＝使用者可寫的自由文字：不設 render、走 NDataTable 預設純文字渲染（形照 role 頁 roleMemo
      // 與 ip-rule 頁的備註欄；標記字元由 Vue 逸出成字面＝FR-015、機器守見 tools/view-render-guard.py）。
      // ★本目錄下一切原始標記注入用法（指令／屬性／DOM API）皆禁——該守門逐字掃本目錄原文、不解析註解，
      // 故此處刻意不寫出被禁字面（寫了就自撞；同 ip-rule 頁檔頭既有註記）。
      key: 'userMemo',
      title: $t('page.manage.user.userMemo'),
      align: 'center',
      minWidth: 140
    },
    {
      // RFC3339 帶 offset 直接顯示（不在前端二次格式化——時區換算是後端與人的共識面；形照 ip-rule 頁）
      key: 'createdAt',
      title: $t('page.manage.user.createdAt'),
      align: 'center',
      minWidth: 180
    },
    {
      // 操作者帳號名（後端批次 enrich、查無即 null；null 整格空白＝本頁對 null 的既有慣例）
      key: 'createdBy',
      title: $t('page.manage.user.createdBy'),
      align: 'center',
      minWidth: 110
    },
    {
      key: 'updatedAt',
      title: $t('page.manage.user.updatedAt'),
      align: 'center',
      minWidth: 180
    },
    {
      key: 'updatedBy',
      title: $t('page.manage.user.updatedBy'),
      align: 'center',
      minWidth: 110
    },
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 已刪模式整欄換「復原」、隱編輯與刪除（兩資料源的列不同族：對已軟刪列打編輯／刪除必得 notFound）。★不另加刪除時間欄——回收桶的次序語意由契約 §2 的 `deleted_at DESC, id DESC` 承載，wire 亦不帶該欄（rev4 的 deletedAt 孤兒鍵不帶回＝R2#28）；原行: render: row => (
      render: row =>
        showDeleted.value ? (
          <div class="flex-center gap-8px">
            <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
              {{
                // ★確認框逐字明示「復原後需重新指派角色」（spec US1 情境 5）：復原是零回灌——刪除交易已硬刪
                // 全部指派列，不在按下去之前講清楚，使用者會以為角色會跟著回來。
                default: () => (
                  <div class="flex-col-stretch gap-4px">
                    <span>{$t('page.manage.user.confirmRestore')}</span>
                    <span>{$t('page.manage.user.restoreHint')}</span>
                  </div>
                ),
                trigger: () => (
                  <NButton type="primary" ghost size="small">
                    {$t('page.manage.user.restore')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </div>
        ) : (
          <div class="flex-center gap-8px">
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
        )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  editingData,
  handleAdd,
  handleEdit,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, 'id', getData);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 切換資料源 → 清勾選＋回第一頁重取。
// ★清勾選不可省（B-100 同形）：已刪模式同樣有 selection 欄可勾，勾完關 toggle 即解除批刪鈕的 disabled，
// 送出後端整批拒 notFound；兩資料源的列不同族、跨源殘留勾選毫無意義。
watch(showDeleted, () => {
  checkedRowKeys.value = [];
  getDataByPage(1);
});
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

async function handleBatchDelete() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 批刪接真（契約 §6）：ids 去重後依 id 升序逐一取鎖、逐筆全套守門，任一違規整批 rollback（no-partial）；拒因 toast 由共用攔截層轉譯 backend.biz.user.*、此處只看 error；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteUser(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  // onBatchDeleted 內部以 getData 刷新列表＋清選取；★成功後前端零追加「生效」呼叫（後端同交易落稽核並重載判定面）
  onBatchDeleted();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 改 async 接真；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 單刪接真（契約 §5）：守門序 notFound→seed 保護→self→no-escalation；副作用含撤該帳號全部 active 票；拒因 toast 由攔截層出、此處只看 error；原行: console.log(id);
  const { error } = await fetchDeleteUser(id);
  if (error) {
    return;
  }

  onDeleted();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 復原已刪使用者（契約 §7）：拒因
// （notFound／同名或同信箱活性衝突／no-escalation）一律交攔截層 toast；「復原後需重新指派角色」的告知落在
// **按下去之前**的確認框（見 operate 欄），此處只出成功 toast。
async function handleRestore(id: number) {
  const { error } = await fetchRestoreUser(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.user.restoreSuccess'));

  await getData();
}
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

function edit(id: number) {
  handleEdit(id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!--
      已刪模式隱搜尋卡：getDeletedUsers 只收分頁參、無過濾欄（契約 §2），留著等於給一張搜了不會有反應的表單。
      ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
      [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: <UserSearch v-model:model="searchParams" @search="getDataByPage" />
    -->
    <UserSearch v-if="!showDeleted" v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <!--
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 回收桶 UI 入口兩件：
            ①「顯示已刪除」toggle（prefix slot；v-model 綁 showDeleted＝資料源／操作欄切換的唯一寫入者；
            NSwitch 走 unplugin 全域註冊、毋須 script import）。
            ②已刪模式下新增／批量刪除入口不現（資料源語意不同：新增後刷新的是已刪清單、批刪打已軟刪列必 notFound）。
            ★此 slot 不得渲染成全註解（B-099）：兩鈕若直接掛 v-if、已刪模式下 slot 只剩註解 vnode，Vue renderSlot
            判定內容無效即改渲染 **fallback**（共用元件自帶的新增／批刪鈕，且本頁確有 @add／@delete 綁定＝綁定仍活）
            ——寫端入口反而冒回來。故外層容器 div 永遠渲染（保底非註解節點）、以 v-show 於已刪模式移出版面
            （空 div 不佔 NSpace 間距）；內層 v-if 負責把互動入口自 DOM 誠實移除。gap-12px＝NSpace medium 水平間距同值。
          -->
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.user.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
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
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
        </TableHeaderOperation>
      </template>
      <!--
        新增七欄（roles 140＋sessionPolicy 110＋userMemo 140＋createdAt 180＋createdBy 110＋updatedAt 180＋updatedBy 110＝+970）
        ⇒ scroll-x 隨欄寬總和 962+970＝1932（欄寬總和不變式：scroll-x＝Σ(width|minWidth)，增刪欄或調欄寬時本數字必須同批改；
        ★rev4 該頁 scroll-x 停在 962 未隨欄改＝瑕疵不抄，R2#19）。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: :scroll-x="962"
      -->
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1932"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <UserOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
