<script setup lang="tsx">
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 watch：回收桶開關一切換就清勾選並回第一頁；原行: import { ref } from 'vue';
import { ref, watch } from 'vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 NDropdown：列操作下拉（踢除下線等維運動作）的收納入口；原行: import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { NButton, NDropdown, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 清單、回收桶、單刪、批刪、復原、踢除、解鎖登入一律改打使用者管理包裝（直接路徑、不經 barrel；barrel 之 upstream 同名清單函式一行不動；重設密碼之送出住重設浮層）；原行: import { fetchGetUserList } from '@/service/api';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetDeletedUsers,
  fetchGetUserList,
  fetchKickUser,
  fetchRestoreUser,
  fetchUnlockLogin
} from '@/service/api/rev6-user-admin';
import { useAppStore } from '@/store/modules/app';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 按鈕碼顯隱的判準來源、密碼政策投影（產密浮層之構造界）、
// 登入者資訊（判本人列）與重設密碼浮層
import { useAuth } from '@/hooks/business/auth';
import { usePwdPolicy } from '@/hooks/business/pwd-policy';
import { useAuthStore } from '@/store/modules/auth';
import UserResetPwdModal from './modules/user-reset-pwd-modal.vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';

const appStore = useAppStore();

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 按鈕碼、回收桶開關與會話政策欄的顯示映射。
// 本頁之選單授權不限超管，故表頭兩鈕、列上各鈕與列操作下拉逐鈕依按鈕碼顯隱；按鈕碼只決定看得見什麼，
// 端點授權仍由後端判定（鈕可見而端點未授者，按下去得到的是授權拒絕）。
const { hasAuth } = useAuth();

// 回收桶開關：打開即資料源換成已刪清單、搜尋卡隱藏、操作欄整欄換「復原」。已刪清單只收分頁兩欄，故另持一份分頁參數
// （開關與分頁之形照選單頁回收桶；出處＝rev5:src/views/manage/user/index.vue）。
const showDeleted = ref(false);
const deletedSearchParams = ref<Api.UserAdmin.DeletedUserListQuery>({ current: 1, size: 10 });

// 會話政策三值對譯文鍵：以 wire 值域為鍵全集標型——缺任一值域項、或多出值域外之鍵，皆 typecheck 紅（不設兜底）
const sessionPolicyLabelMap: Record<Api.UserAdmin.SessionPolicy, App.I18n.I18nKey> = {
  inherit: 'page.manage.user.sessionPolicyOption.inherit',
  single: 'page.manage.user.sessionPolicyOption.single',
  multi: 'page.manage.user.sessionPolicyOption.multi'
};
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

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
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 依回收桶開關換資料源：現役清單整份送出搜尋參（六個篩選欄後端皆濾；搜尋卡之首屏物件型可直接交給包裝之查詢型）、已刪清單只送分頁兩欄；原行: api: () => fetchGetUserList(searchParams.value),
  api: () => (showDeleted.value ? fetchGetDeletedUsers(deletedSearchParams.value) : fetchGetUserList(searchParams.value)),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 分頁參數同步進已刪清單的查詢物件（只有已刪模式送出它）
    deletedSearchParams.value.current = params.page;
    deletedSearchParams.value.size = params.pageSize;
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
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
        // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 接真後性別之 wire 型為 string | null（DB 原值之十進位字串、不做二值收斂），值域外之值在型面上可達——只擋 null 會拿值域外之值去索引色表與譯文鍵、畫面出現無色標籤配裸鍵；改判「非 '1'／'2' 即不渲染」，並藉此把下方兩處索引之型收窄為二值；原行: if (row.userGender === null) {
        if (row.userGender !== '1' && row.userGender !== '2') {
          return null;
        }

        const tagMap: Record<Api.SystemManage.UserGender, NaiveUI.ThemeColor> = {
          1: 'primary',
          2: 'error'
        };

        const label = $t(userGenderRecord[row.userGender]);

        return <NTag type={tagMap[row.userGender]}>{label}</NTag>;
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 接真後之七個新欄：角色、會話政策、記事與四個審計欄（欄集與欄寬同 rev5 終態）。
    // 記事是管理員可寫的自由文字：不設 render、交表格預設輸出成純文字節點（null 即留白）；時間欄照 wire 之 RFC3339 原樣顯示
    {
      key: 'roles',
      title: $t('page.manage.user.roles'),
      align: 'center',
      minWidth: 140,
      // 持有角色之代碼以本頁自備之分隔鍵串成一段純文字（含停用角色、不含已軟刪；回收桶列恆空）
      render: row => row.roles.map(role => role.roleCode).join($t('page.manage.user.roleSeparator'))
    },
    {
      key: 'sessionPolicy',
      title: $t('page.manage.user.sessionPolicy'),
      align: 'center',
      width: 110,
      render: row => $t(sessionPolicyLabelMap[row.sessionPolicy])
    },
    {
      key: 'userMemo',
      title: $t('page.manage.user.userMemo'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'createdAt',
      title: $t('page.manage.user.createdAt'),
      align: 'center',
      minWidth: 180
    },
    {
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 操作欄由兩鈕加寬為三控件（＋列操作下拉）——下方表格 :scroll-x 之欄寬總和同批改；原行: width: 130,
      width: 200,
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 改區塊形：已刪模式整欄換「復原」（確認框兩行；不加刪除時間欄），現役模式之編輯、刪除與列操作下拉逐鈕依按鈕碼顯隱，下拉選項集先算一次、判斷渲染與餵給下拉共用；原行: render: row => (
      render: row => {
        if (showDeleted.value) {
          return (
            <div class="flex-center gap-8px">
              {hasAuth('user:restore') && (
                <NPopconfirm onPositiveClick={() => handleRestore(row.id)}>
                  {{
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
              )}
            </div>
          );
        }

        const operateOptions = getOperateOptions(row);

        return (
          <div class="flex-center gap-8px">
            {hasAuth('user:edit') && (
              <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
                {$t('common.edit')}
              </NButton>
            )}
            {hasAuth('user:delete') && (
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
            {operateOptions.length > 0 && (
              <NDropdown options={operateOptions} onSelect={key => handleOperateSelect(key as OperateKey, row)}>
                <NButton size="small" ghost>
                  {$t('common.action')}
                </NButton>
              </NDropdown>
            )}
          </div>
        );
      }
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

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 回收桶之開關切換與復原。
// 開關一切換：清勾選並回第一頁重取——兩個資料源的列不是同一群，留著的勾選會把已刪 id 帶進批刪而整批被拒（rev5:B-100）；
// 兩邊皆常規分頁，每頁筆數沿用、毋需歸位
watch(showDeleted, () => {
  checkedRowKeys.value = [];
  getDataByPage(1);
});

// 自回收桶復原：狀態保留、角色零回灌——「復原後需重新指派角色」已在按下之前的確認框講明（見操作欄），此處只出成功提示；
// 拒因提示由共用攔截層轉譯。成功後留在當前頁重取、不跳回第一頁
async function handleRestore(id: number) {
  const { error } = await fetchRestoreUser(id);
  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.user.restoreSuccess'));

  await getData();
}
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

async function handleBatchDelete() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 批刪接真：任一標的被拒即整批不動；拒因提示由共用攔截層轉譯、本頁只看成敗（勾選鍵實為列 id、逐一轉數值）；原行: console.log(checkedRowKeys.value);
  const { error } = await fetchBatchDeleteUser(checkedRowKeys.value.map(Number));
  if (error) {
    return;
  }

  onBatchDeleted();
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 改 async：要等刪除回應定成敗；原行: function handleDelete(id: number) {
async function handleDelete(id: number) {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 單刪接真：拒因提示由共用攔截層轉譯、本頁只看成敗；原行: console.log(id);
  const { error } = await fetchDeleteUser(id);
  if (error) {
    return;
  }

  onDeleted();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 清掉已刪列的勾選：勾選鍵跨刷新保留，已刪 id 若留著、下一次批刪會因查無而整批被拒（選單頁同形）
  // （排在 onDeleted 之後：與上方修改型改行之間隔一行未改原碼，本塊才自成純新增段、拔其圈界可被驗出）
  checkedRowKeys.value = checkedRowKeys.value.filter(key => Number(key) !== id);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
}

function edit(id: number) {
  handleEdit(id);
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 列操作下拉：選項集、所選動作之分派，與踢除下線、重設密碼、
// 隨機密碼、解鎖登入四項動作之浮層狀態與送出（重設密碼之送出住重設浮層）。拒因提示一律由共用攔截層轉譯、本頁只看成敗。
// 踢除與解鎖兩顆確認對話框送出期間載入中（確定鈕停用並轉圈）、處理器另有重入守——連點只送出一次（前代送出期間仍可再按＝連點即重送）。
/**
 * 列操作下拉之動作鍵：選項側與分派側共用此字面聯合型——選項鍵寫錯即不可指派、分派側比對寫錯即成無交集比較，皆當場 typecheck 紅
 * （本 repo 前端無單元測試框架；兩邊各寫一遍字面而互無型別關聯時，寫錯只會變成點了沒有任何反應）。
 */
type OperateKey = 'kick' | 'resetPwd' | 'randomPassword' | 'unlockLogin';

const authStore = useAuthStore();

/**
 * 該列即操作者本人。登入者資訊之 userId 是字串、列之 id 是數值，故把列 id 轉字串來比（反向把字串轉數值，遇超出安全整數之 id
 * 會靜默失真；抽屜之本人判定同形）。
 */
function isSelfRow(row: Api.UserAdmin.UserRecord) {
  return String(row.id) === authStore.userInfo.userId;
}

/** 依按鈕碼（與本人列與否）組選項集；集合為空時整顆下拉不渲染（一顆點開是空的鈕不如不給） */
function getOperateOptions(row: Api.UserAdmin.UserRecord) {
  const options: { label: string; key: OperateKey }[] = [];

  // 本人列照列：不得踢除自己之拒因由後端回、攔截層出提示，前端不另判
  if (hasAuth('user:kick')) {
    options.push({ label: $t('page.manage.user.kick'), key: 'kick' });
  }

  // 本人列不列兩項：後端對本人之拒因是改道指引（本人密碼請到個人中心改）——既有正確去處，就不讓人按了才知道走錯門。
  // 兩項打同一支端點、共用同一枚碼（「隨機密碼」＝先產一組再進重設浮層確認）
  if (hasAuth('user:reset-pwd') && !isSelfRow(row)) {
    options.push({ label: $t('page.manage.user.resetPwd'), key: 'resetPwd' });
    options.push({ label: $t('page.manage.user.randomPassword'), key: 'randomPassword' });
  }

  // 本人列照列；清單不顯示鎖定狀態、每列皆可按（對未鎖帳號後端照回成功）
  if (hasAuth('user:unlock')) {
    options.push({ label: $t('page.manage.user.unlockLogin'), key: 'unlockLogin' });
  }

  return options;
}

/** 所選動作之標的列：選項被選時鎖定、確認浮層不再回讀清單——浮層開著期間清單被刷新，送出的對象也不會換人 */
const operateTarget = ref<Api.UserAdmin.UserRecord | null>(null);
const kickVisible = ref(false);
const resetPwdVisible = ref(false);
/** 重設浮層之輸入值：產密帶入時由此預填；關閉即清由重設浮層負責 */
const resetPwdValue = ref('');
const pwdGenVisible = ref(false);
const unlockVisible = ref(false);
/** 兩顆確認對話框之送出中：處理器起手置真、一切出口由 finally 解除；對話框據之停用並轉圈確定鈕、處理器據之重入守 */
const kickSubmitting = ref(false);
const unlockSubmitting = ref(false);

/**
 * 選取序號：列操作每被選取一次即遞增。「隨機密碼」先等政策讀取、再開產密浮層——等候期間若已改選他項或他列，await 之後序號已變、
 * 即不開（不然產密浮層會在新選取之浮層之後才彈出；前代同形）
 */
let operateSelectSeq = 0;

/** 密碼政策投影（產密浮層之構造界；取得與快取皆在共用 hook，本頁只讀） */
const { policy: pwdPolicy, ensureLoaded: ensurePwdPolicy } = usePwdPolicy();

function handleOperateSelect(key: OperateKey, row: Api.UserAdmin.UserRecord) {
  operateSelectSeq += 1;
  operateTarget.value = row;

  if (key === 'kick') {
    kickVisible.value = true;
  } else if (key === 'resetPwd') {
    resetPwdVisible.value = true;
  } else if (key === 'randomPassword') {
    openPwdGen();
  } else if (key === 'unlockLogin') {
    unlockVisible.value = true;
  }
}

async function openPwdGen() {
  const seq = operateSelectSeq;

  // 已有快取即零請求；讀失敗維持 null＝產密浮層以其後備界產生、不擋產密
  await ensurePwdPolicy();

  // 等候期間已改選（見 operateSelectSeq）即不開
  if (seq !== operateSelectSeq) {
    return;
  }

  pwdGenVisible.value = true;
}

/** 產密「帶入」→ 預填重設浮層並開之：產出值不直接送出，仍須於重設浮層按確定（改掉他人密碼不可逆、多一次確認） */
function handlePwdGenApply(password: string) {
  resetPwdValue.value = password;
  resetPwdVisible.value = true;
}

/** 解鎖登入（帳號維）：帳號名原樣送出、零修剪；維度顯式帶。只解除登入節流鎖、不改列資料，故不刷新清單 */
async function handleUnlockLogin() {
  const target = operateTarget.value;

  if (!target || unlockSubmitting.value) {
    return;
  }

  unlockSubmitting.value = true;

  try {
    const { error } = await fetchUnlockLogin({ dimension: 'user', userName: target.userName });

    unlockVisible.value = false;

    if (error) {
      return;
    }

    window.$message?.success($t('page.manage.user.unlockLoginSuccess'));
  } finally {
    unlockSubmitting.value = false;
  }
}

async function handleKick() {
  const target = operateTarget.value;

  if (!target || kickSubmitting.value) {
    return;
  }

  kickSubmitting.value = true;

  try {
    // 踢除只撤下該帳號的全部有效票、不改列資料，故不刷新清單；成功提示不依撤下之票數改寫
    const { error } = await fetchKickUser(target.id);

    kickVisible.value = false;

    if (error) {
      return;
    }

    window.$message?.success($t('page.manage.user.kickSuccess'));
  } finally {
    kickSubmitting.value = false;
  }
}
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 已刪模式隱藏搜尋卡（已刪清單只收分頁兩欄、沒有篩選面）；以 v-show 只隱藏不重建——搜尋卡於建立當下擷取「重置」基準，若隨開關重建，往返一次後當下篩選值即成基準、「重置」清不掉（前代同形；007 刀改正、入 spec 刻意分岔登記）；原行: <UserSearch v-model:model="searchParams" @search="getDataByPage" /> -->
    <UserSearch v-show="!showDeleted" v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.user.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 自閉合改成對標籤以承載 prefix 插槽的「顯示已刪除」開關（開關不掛按鈕碼）；並加兩布林 prop：新增與批刪依其按鈕碼顯隱、已刪模式皆不顯（預設插槽不覆寫——覆寫內容不受兩 prop 控制，覆寫成空時元件還會改渲染自帶的備援鈕）。開關於清單取數在途期間停用：兩模式共用同一份清單，取數在途時切換＝遲到之他源回應可覆蓋本模式清單（前代同形；007 刀改正、入 spec 刻意分岔登記）；停用繫結清單之載入中——upstream 之載入中為布林、不計請求數，同模式重疊取數（載入中再按重新整理或換頁）時首支落定即解停用、其後切換仍可能被遲到之同模式回應覆蓋（已知態）。兩個新屬性排在事件之後緊鄰閉合處——屬性之間放不了標記、須與本改行同塊才受本標記涵蓋；原行: /> -->
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
          :show-add="!showDeleted && hasAuth('user:add')"
          :show-delete="!showDeleted && hasAuth('user:delete')"
        >
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.user.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" :disabled="loading" />
            </div>
          </template>
        </TableHeaderOperation>
      </template>
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 下方 :scroll-x 隨新增七欄（寬 970）與操作欄加寬（＋70）改 2002＝各欄 width／minWidth 之和；標記無法置於標籤屬性之間、故緊鄰本元件之上；原行: :scroll-x="962" -->
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="2002"
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
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 列操作下拉四項動作之浮層。踢除與解鎖之確認：觸發點在下拉的選項裡、選後下拉即收合，沒有常駐節點可掛 NPopconfirm，故走 NModal 的 dialog preset；重設密碼浮層與產密浮層之標的帳號名皆取選取當下鎖定之列 -->
      <NModal
        v-model:show="kickVisible"
        preset="dialog"
        type="warning"
        :title="$t('page.manage.user.kick')"
        :content="$t('page.manage.user.confirmKick')"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
        :loading="kickSubmitting"
        @positive-click="handleKick"
      />
      <UserResetPwdModal
        v-model:visible="resetPwdVisible"
        v-model:password="resetPwdValue"
        :row-data="operateTarget"
        @submitted="getData"
      />
      <PwdGenModal
        v-model:visible="pwdGenVisible"
        :policy="pwdPolicy"
        :user-name="operateTarget?.userName ?? ''"
        @apply="handlePwdGenApply"
      />
      <NModal
        v-model:show="unlockVisible"
        preset="dialog"
        type="info"
        :title="$t('page.manage.user.unlockLogin')"
        :content="$t('page.manage.user.unlockLoginConfirm')"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
        :loading="unlockSubmitting"
        @positive-click="handleUnlockLogin"
      />
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
    </NCard>
  </div>
</template>

<style scoped></style>
