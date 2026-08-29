<script setup lang="tsx">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 watch（回收桶 toggle 切資料源時清勾選＋回第一頁，見檔尾）；原行: import { ref } from 'vue';
import { ref, watch } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 本刀 U7 補 NDropdown＝operate 欄「踢除／重設密碼／隨機密碼」三個維運動作的收納入口（憲法 §III.2 (v) 列紀律欄逐字「操作下拉之踢除·重設密碼·隨機密碼」）；原行: import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { NButton, NDropdown, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 資料源與單刪／批刪／復原全數改 rev5 wrapper（★直接路徑、不經 barrel——沿 rev5-role-admin／rev5-ip-rule 先例）；demo 殼的同名 fetchGetUserList 續留 barrel 供 demo 面、一行不動（其去留＝B-018、不在本刀射程）；原行: import { fetchGetUserList } from '@/service/api';
import {
  fetchBatchDeleteUser,
  fetchDeleteUser,
  fetchGetDeletedUsers,
  fetchGetUserList,
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 本刀 U7：踢除（契約 §8）與重設他人密碼（契約 §9）取得 UI 消費者
  fetchKickUser,
  fetchResetUserPassword,
  fetchRestoreUser
} from '@/service/api/rev5-user-admin';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 本刀 U7 三支新相依：
// ①`usePwdPolicy`＝政策七欄投影的共用取得與快取（產密浮層的構造資料源）——★管理頁讀它是為了
//   「產一組合規密碼」，不是為了在前端擋下不合規的輸入（後端仍是唯一裁判、島 I5 單一驗證點）；
//   ★快取住在 hook 的模組層＝本頁與抽屜共用同一份，不是各持一份（FR-007 共用件零拷貝）。
// ②`useAuth().hasAuth`＝七枚按鈕碼的顯隱判準（★僅前端可見性，後端 `require_policy` 才是安全邊界）。
// ③`authStore.userInfo.userId`＝判「這一列是不是自己」的唯一料源（self 五不之「重設密碼」入口收斂）。
import { useAuth } from '@/hooks/business/auth';
import { usePwdPolicy } from '@/hooks/business/pwd-policy';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 本刀 U7：產密浮層（CSPRNG 依政策構造性產出、零網路請求）
import PwdGenModal from '@/components/custom/pwd-gen-modal.vue';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserSearch from './modules/user-search.vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 本刀 U7：頁首解鎖浮層（雙維、打 004 既有 unlockLogin 端點）
import UserUnlockModal from './modules/user-unlock-modal.vue';

const appStore = useAppStore();

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 本刀 U7：按鈕碼 gating 與 self 判定的取用點。
// ★七枚按鈕碼＝`user:add`／`user:edit`／`user:delete`／`user:reset-pwd`／`user:kick`／`user:restore`／`user:unlock`
// （m002 seed 全在案）。本頁**逐鈕** gating 的判準＝該頁 menu 維政策非僅 R_SUPER（`manage_user` 實測
// ＝{R_SUPER, R_ADMIN}）⇒ 非超管進得來、看得到的鈕就必須誠實反映他被授了什麼；role／menu 兩頁的
// menu 維政策僅 R_SUPER、門在頁級，故那兩頁不 gating 之既有拍板不變（ADR 0063 款三例外釋義）。
// ★**鈕可見 ≠ 呼得動**：按鈕碼與端點政策是兩把各自獨立的鑰匙、由超管一併治理——被授鈕未被授端點者
// 按下去得 5003（誠實），反之端點有鈕無者鈕不見而 API 仍可達（spec US4 情境 6）。
const { hasAuth } = useAuth();

const authStore = useAuthStore();

// 密碼政策七欄投影＋其取得（共用 hook；`policy` 具名為 pwdPolicy 以免與本檔其他「政策」字樣混讀）
const { policy: pwdPolicy, ensureLoaded: ensurePwdPolicy } = usePwdPolicy();

// 頁首「解鎖登入」浮層開關（`user:unlock` gating）。★**刻意不隨回收桶 toggle 收起**：解鎖的標的是
// 登入節流的計數桶／帳號鎖，與本頁當下看的是現役清單還是回收桶無關（同 rev4 該鈕的既有取態）；
// 新增／批刪那兩顆才需要跟著 toggle 走——它們打的是清單裡的列。
const unlockVisible = ref(false);
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

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
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 本刀 U7：operate 欄自兩控件（編輯／刪除）加寬到三控件（＋維運動作下拉）——★`scroll-x` 的 Σ 欄寬不變式同批改（見下方 NDataTable）；原行: width: 130,
      width: 200,
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 已刪模式整欄換「復原」、隱編輯與刪除（兩資料源的列不同族：對已軟刪列打編輯／刪除必得 notFound）。★不另加刪除時間欄——回收桶的次序語意由契約 §2 的 `deleted_at DESC, id DESC` 承載，wire 亦不帶該欄（rev4 的 deletedAt 孤兒鍵不帶回＝R2#28）。本刀 U7 再改箭頭本體為區塊形：維運動作的選項集要先算一次再用兩次（渲染判斷＋傳給 NDropdown），表達式形只能重算一遍；原行: render: row => (
      render: row => {
        if (showDeleted.value) {
          return (
            <div class="flex-center gap-8px">
              {hasAuth('user:restore') && (
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
              )}
            </div>
          );
        }

        // 維運動作（踢除／重設密碼／隨機密碼）：選項集空＝兩枚按鈕碼皆無權、或這一列是自己而重設密碼
        // 兩項被收斂掉 ⇒ 整顆下拉不渲染（留一顆點開是空的鈕比不給還糟）。
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

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 本刀 U7：列上維運動作三件
// （踢除／重設密碼／隨機密碼）與兩顆浮層的狀態機。
// ★三個動作共用同一個「標的列」——`operateTarget` 於開浮層時鎖定，浮層本身不再從清單重讀，
// 免得清單在浮層開著的期間被刷新（分頁、搜尋、其他動作的 getData）而讓送出的 id 換了一個人。

/** 這一列是不是操作者自己（`userInfo.userId` 為**字串**、列 wire 的 `id` 為 number ⇒ 對齊字串側比較；反向 Number() 在 id 超出安全整數時會靜默失真） */
function isSelfRow(row: Api.UserAdmin.UserRecord) {
  return String(row.id) === authStore.userInfo.userId;
}

/**
 * 維運動作鍵（下拉選項與分派臂的**唯一**字面來源）
 *
 * ★不可退回裸 `string`：選項側與分派側各寫一遍同樣的字面、彼此零型別關聯時，任一邊打錯字
 * （`resetPwd` 誤寫成 `resetPassword`）六道閘全綠、build 照過，使用者點下該項只會得到**完全靜默
 * 的無反應**（浮層不開、無 toast、無請求）——base-web 無測試 runner，這種錯只有人工點過才會發現。
 * 綁成字面聯合型別後：選項側打錯＝不可指派（TS2322）、分派側打錯＝無交集比較（TS2367），當場紅。
 */
type OperateKey = 'kick' | 'resetPwd' | 'randomPassword';

/**
 * 維運動作下拉的選項集（逐鈕 gating＋self 收斂）
 *
 * ★**自己那一列不列「重設密碼」與「隨機密碼」**（self 五不）：兩者打的是同一支 `resetUserPassword`，
 * 而契約 §9 對 self 的拒因逐字是「請到個人中心修改自己的密碼」＝一條**改道指引**，不是單純的不允許
 * ——既然另有正確的路，就別讓人先按了才知道走錯門。
 * ★踢除**不**做同樣的收斂：`cannotKickSelf` 是單純的不允許（沒有替代路徑），與同列的「刪除」對 self
 * 的處置一致——由後端拒因 toast 承載，前端不多做一套。
 */
function getOperateOptions(row: Api.UserAdmin.UserRecord) {
  const options: { label: string; key: OperateKey }[] = [];

  if (hasAuth('user:kick')) {
    options.push({ label: $t('page.manage.user.kick'), key: 'kick' });
  }

  if (hasAuth('user:reset-pwd') && !isSelfRow(row)) {
    options.push({ label: $t('page.manage.user.resetPwd'), key: 'resetPwd' });
    options.push({ label: $t('page.manage.user.randomPassword'), key: 'randomPassword' });
  }

  return options;
}

/** 當前維運動作的標的列（浮層開啟期間鎖定；null＝沒有進行中的動作） */
const operateTarget = ref<Api.UserAdmin.UserRecord | null>(null);
const kickVisible = ref(false);
const resetPwdVisible = ref(false);
/** 重設密碼浮層的輸入值（手輸或由產密浮層帶入；關閉即清、不跨開關留存） */
const resetPwdValue = ref('');
const pwdGenVisible = ref(false);

function handleOperateSelect(key: OperateKey, row: Api.UserAdmin.UserRecord) {
  operateTarget.value = row;

  if (key === 'kick') {
    kickVisible.value = true;
  } else if (key === 'resetPwd') {
    // 輸入欄不必在此清空：「關閉即清」的不變式由下方 watch 單點維持（closed ⇒ empty），開啟必然是空的
    resetPwdVisible.value = true;
  } else if (key === 'randomPassword') {
    openPwdGen();
  }
}

async function openPwdGen() {
  // 取政策（已有快取即零請求）；讀失敗維持 null＝浮層以自帶預設界生成、不擋產密（見 hook 註）
  await ensurePwdPolicy();

  pwdGenVisible.value = true;
}

// 產密浮層「帶入」→ 填進重設密碼浮層的輸入欄並開之：★產出的密碼**不直接送出**，一律再經一次
// 確認才寫——一鍵改掉別人的密碼是不可逆的破壞性動作，值得多按一下。
function handlePwdGenApply(password: string) {
  resetPwdValue.value = password;
  resetPwdVisible.value = true;
}

async function handleKick() {
  const target = operateTarget.value;

  if (!target) {
    return;
  }

  // 踢除不改列資料（帳號仍活）⇒ 毋需刷新清單；拒因（notFound／cannotKickSelf／5003）由攔截層 toast
  const { error } = await fetchKickUser(target.id);

  kickVisible.value = false;

  if (error) {
    return;
  }

  window.$message?.success($t('page.manage.user.kickSuccess'));
}

// 關閉重設密碼浮層即清明文（同本刀 U6 為抽屜補的「敏感狀態與顯示狀態同進退」）：`resetPwdValue` 是
// 模組級 ref，而本頁常被 KeepAlive 留在分頁堆疊裡——不清就會讓打進去（或產生後帶入）的明文密碼一路
// 留到下一次有人再開這顆浮層為止。
// ★掛在 visible 的 falsy 邊、不掛取消鈕的處理器：NModal 的 closable 叉、遮罩點擊與 ESC 都直接改 visible、
// 不經任何按鈕處理器，掛在鈕上會漏掉那三條路。
watch(resetPwdVisible, val => {
  if (!val) {
    resetPwdValue.value = '';
  }
});

async function handleResetPwd() {
  const target = operateTarget.value;

  if (!target) {
    return;
  }

  // 拒因（notFound／cannotResetSelfPassword／5003／政策攜參 violations／冷卻攜參 remainingSeconds）
  // 一律由攔截層 toast；★失敗時**浮層留著**、輸入值不清，讓使用者就地改一個合規的再送。
  const { error } = await fetchResetUserPassword({ id: target.id, password: resetPwdValue.value });

  if (error) {
    return;
  }

  // 關閉即由 watch 清掉輸入的明文（見上）
  resetPwdVisible.value = false;
  window.$message?.success($t('page.manage.user.resetPwdSuccess'));

  // ★重設**會**改列資料 ⇒ 必須刷新：後端在 UPDATE `password` 的同一交易裡成對 bump 標的列的
  // `updated_at`／`updated_by`（憲法 §I.6：密碼變更＝使用者列變更），而本頁的「更新時間」「更新人」
  // 兩欄預設可見——不刷新的話那兩格會一路停在重設前的舊值（該帳號從未被編輯過時甚至仍是空的），
  // 直到有人手動按刷新鈕、換頁或重新搜尋為止。形同本檔 handleRestore（`await getData()`＝留在當前頁
  // 重取，不像 getDataByPage 會把頁碼帶回第一頁——重設不增刪列、頁碼不該跳）。
  // ★同批的 handleKick **不**做這件事是對的：踢除只撤票、零列變更（見該處註解）。
  await getData();
}
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
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
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 本 slot as-built ＝**三顆鈕**
            （新增／批量刪除／解鎖登入），另含回收桶 UI 入口兩件：
            ①「顯示已刪除」toggle（prefix slot；v-model 綁 showDeleted＝資料源／操作欄切換的唯一寫入者；
            NSwitch 走 unplugin 全域註冊、毋須 script import）。
            ②已刪模式下新增／批量刪除入口不現（資料源語意不同：新增後刷新的是已刪清單、批刪打已軟刪列必 notFound）。
            ★此 slot 不得渲染成全註解（B-099）：三鈕若直接掛 v-if，條件全假時（已刪模式且無 user:unlock、
            或三枚按鈕碼全無權）slot 只剩註解 vnode，Vue renderSlot 判定內容無效即改渲染 **fallback**
            （共用元件自帶的新增／批刪鈕，且本頁確有 @add／@delete 綁定＝綁定仍活）——寫端入口反而冒回來。
            故外層容器 div 永遠渲染（保底非註解節點）、以 v-show 移出版面（空 div 不佔 NSpace 間距）；
            內層 v-if 負責把互動入口自 DOM 誠實移除。
            ★該 v-show 的條件**含兩個維度、不只 showDeleted**：回收桶維（新增／批刪隨 toggle 收起）**與授權維**
            （三枚按鈕碼全無權即整塊移出版面，否則無權者看到空操作區）——授權那半不是冗餘、不得刪。
            ★解鎖鈕刻意不隨 toggle 收起（故其條件是獨立的 or 項），理由寫在 script 區 unlockVisible 宣告處、此處不重述。
            gap-12px＝NSpace medium 水平間距同值。
          -->
          <template #prefix>
            <div class="flex-center gap-8px">
              <span class="text-14px">{{ $t('page.manage.user.showDeleted') }}</span>
              <NSwitch v-model:value="showDeleted" />
            </div>
          </template>
          <template #default>
            <div
              v-show="(!showDeleted && (hasAuth('user:add') || hasAuth('user:delete'))) || hasAuth('user:unlock')"
              class="flex-y-center gap-12px"
            >
              <NButton v-if="!showDeleted && hasAuth('user:add')" size="small" ghost type="primary" @click="handleAdd">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                {{ $t('common.add') }}
              </NButton>
              <NPopconfirm v-if="!showDeleted && hasAuth('user:delete')" @positive-click="handleBatchDelete">
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
              <NButton v-if="hasAuth('user:unlock')" size="small" ghost @click="unlockVisible = true">
                <template #icon>
                  <icon-ic-round-lock-open class="text-icon" />
                </template>
                {{ $t('page.manage.user.unlockLogin') }}
              </NButton>
            </div>
          </template>
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
        </TableHeaderOperation>
      </template>
      <!--
        新增七欄（roles 140＋sessionPolicy 110＋userMemo 140＋createdAt 180＋createdBy 110＋updatedAt 180＋updatedBy 110＝+970）
        ⇒ scroll-x 隨欄寬總和 962+970＝1932（欄寬總和不變式：scroll-x＝Σ(width|minWidth)，增刪欄或調欄寬時本數字必須同批改；
        ★rev4 該頁 scroll-x 停在 962 未隨欄改＝瑕疵不抄，R2#19）。
        ★本刀 U7 再改：operate 欄 130→200（多一顆維運動作下拉）⇒ 1932＋70＝**2002**。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: :scroll-x="962"
      -->
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
      <!--
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 本刀 U7 的三顆浮層。
        ★踢除確認走 NModal 的 dialog preset、不走 NPopconfirm：觸發點在 NDropdown 的選項裡，
        popconfirm 需要一個常駐的觸發節點，而下拉選中即收合、沒有那個節點可掛。
        ★標的帳號名一律純文字插值（`{ userName }` 交 $t 代入、由 Vue 逸出）——本目錄禁一切原始標記注入
        （FR-015；機器守＝tools/view-render-guard.py，該守門逐字掃本目錄原文、不解析註解，故此處刻意不寫出被禁字面）。
      -->
      <NModal
        v-model:show="kickVisible"
        preset="dialog"
        type="warning"
        :title="$t('page.manage.user.kick')"
        :content="$t('page.manage.user.confirmKick')"
        :positive-text="$t('common.confirm')"
        :negative-text="$t('common.cancel')"
        @positive-click="handleKick"
      />
      <NModal
        v-model:show="resetPwdVisible"
        preset="card"
        :title="$t('page.manage.user.resetPwdTitle', { userName: operateTarget?.userName ?? '' })"
        class="w-400px lt-sm:w-300px"
      >
        <NSpace vertical :size="12">
          <span class="text-14px">{{ $t('page.manage.user.newPassword') }}</span>
          <!--
            前端只擋空值（送出鈕 disabled）：長度／字元類／不得同帳號名等政策細則為後端權威，
            違規明細經攔截層以 `passwordPolicy{violations}` 渲染——此處不預判亦不自造規則文案。
          -->
          <NInput
            v-model:value="resetPwdValue"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.manage.user.form.password')"
          />
        </NSpace>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="resetPwdVisible = false">{{ $t('common.cancel') }}</NButton>
            <NButton type="primary" :disabled="resetPwdValue === ''" @click="handleResetPwd">
              {{ $t('common.confirm') }}
            </NButton>
          </NSpace>
        </template>
      </NModal>
      <PwdGenModal
        v-model:visible="pwdGenVisible"
        :policy="pwdPolicy"
        :user-name="operateTarget?.userName ?? ''"
        @apply="handlePwdGenApply"
      />
      <!-- 頁首解鎖浮層：雙維、送出處顯式帶 dimension（後端無預設維度、缺席即 2222） -->
      <UserUnlockModal v-model:visible="unlockVisible" />
      <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
    </NCard>
  </div>
</template>

<style scoped></style>
