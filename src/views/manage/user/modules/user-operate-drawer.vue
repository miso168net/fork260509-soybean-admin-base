<script setup lang="ts">
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 h：角色欄已選標籤改由本檔自繪（見 renderRoleTag）；原行: import { computed, ref, watch } from 'vue';
import { computed, h, ref, watch } from 'vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 編輯回填改逐欄取值（見 handleInitModel）、本檔不再深拷貝整列；原行: import { jsonClone } from '@sa/utils';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 角色候選改打角色管理包裝（直接路徑、不經 barrel；barrel 之 upstream 同名函式一行不動）——回應項同為 id、代碼、名稱三欄，本抽屜取 id 作選項值；原行: import { fetchGetAllRoles } from '@/service/api';
import { fetchGetAllRoles } from '@/service/api/rev6-role-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 新增、更新與會話政策三支送出改打使用者管理包裝（直接路徑）；
// 操作者是否超管、所編是否本人列，皆取自登入者資訊；角色欄自繪標籤用標籤元件與其型；新增態「隨機密碼」之產密浮層取密碼政策投影作構造界
import { NTag } from 'naive-ui';
import type { SelectRenderTag } from 'naive-ui';
import { fetchAddUser, fetchUpdateUser, fetchUpdateUserSessionPolicy } from '@/service/api/rev6-user-admin';
import { useAuthStore } from '@/store/modules/auth';
import { usePwdPolicy } from '@/hooks/business/pwd-policy';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
import { $t } from '@/locales';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 列型改使用者管理清單的 wire 列型（清單頁傳入的即此型）；原行: rowData?: Api.SystemManage.User | null;
  rowData?: Api.UserAdmin.UserRecord | null;
}

const props = defineProps<Props>();
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 兩態與兩種身分判定，及會話政策下拉之選項。
// 「是否超管」只用來決定會話政策欄能否改動，不拿來預判任何其他後端規則（包含規則由後端唯一裁判、角色候選全列不過濾）。
const SUPER_ROLE_CODE = 'R_SUPER';

const authStore = useAuthStore();

const isEdit = computed(() => props.operateType === 'edit');

/** 操作者現役角色集含超管角色（登入者資訊之 roles 為現役角色代碼集） */
const isSuper = computed(() => authStore.userInfo.roles.includes(SUPER_ROLE_CODE));

/**
 * 所編之列即操作者本人。登入者資訊之 userId 是字串、列之 id 是數值，故把列 id 轉字串來比（反向把字串轉數值，遇超出安全整數之 id
 * 會靜默失真）。
 */
const isSelf = computed(() => {
  const rowId = props.rowData?.id;

  return rowId !== undefined && String(rowId) === authStore.userInfo.userId;
});

/**
 * 本人列的狀態與角色兩控件停用（只在編輯態成立）：後端對本人列之更新請求只要帶了狀態或角色欄即拒，值同現值亦然；停用而不隱藏，
 * 現值照樣看得見。送出面另有同一判斷（見 handleSubmit），不只靠這個顯示屬性。
 */
const selfFieldsLocked = computed(() => isEdit.value && isSelf.value);

/**
 * 會話政策欄停用＝操作者非超管：該端點只授超管，非超管送出必得授權拒絕。停用而不隱藏——欄仍顯示現值並附提示，看得到這個帳號
 * 目前的政策、也知道為何改不動。
 */
const sessionPolicyLocked = computed(() => !isSuper.value);

/** 會話政策三值之下拉選項（值域＝wire 之 SessionPolicy；標籤與清單欄共用同一組譯文鍵） */
const sessionPolicyOptions = computed<CommonType.Option<Api.UserAdmin.SessionPolicy>[]>(() => [
  { label: $t('page.manage.user.sessionPolicyOption.inherit'), value: 'inherit' },
  { label: $t('page.manage.user.sessionPolicyOption.single'), value: 'single' },
  { label: $t('page.manage.user.sessionPolicyOption.multi'), value: 'multi' }
]);
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 表單模型改自持：角色載體由角色代碼集換成角色 id 集（寫端收 roleIds）、補設密欄（僅新增態）、記事（新增與編輯兩態皆有）與會話政策（僅編輯態）；可空文字欄在表單內一律以字串承載（沒填＝空字串）；原行: type Model = Pick<
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: Api.SystemManage.User,
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: >;
type Model = {
  userName: string;
  password: string;
  /** 同列之 wire 型 `string | null`：DB 原值之十進位字串、值域外可達 */
  userGender: string | null;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userMemo: string;
  roleIds: number[];
  status: Api.Common.EnableStatus | null;
  sessionPolicy: Api.UserAdmin.SessionPolicy;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    userName: '',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 補欄之起始值：設密欄（僅新增態渲染）、記事，
    // 及會話政策（僅編輯態渲染、開抽屜即以列值回填；起始值取 inherit＝與後端新建帳號之落值同義）
    password: '',
    userMemo: '',
    sessionPolicy: 'inherit',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
    userGender: null,
    nickName: '',
    userPhone: '',
    userEmail: '',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 角色載體換角色 id 集；原行: userRoles: [],
    roleIds: [],
    status: null
  };
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 設密欄入必填（該欄只在新增態渲染、編輯態不註冊即不觸驗；只驗必填、不掛即時政策規則，政策由後端裁判）；原行: type RuleKey = Extract<keyof Model, 'userName' | 'status'>;
type RuleKey = Extract<keyof Model, 'userName' | 'status' | 'password'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 設密欄之必填規則（見上）
  password: defaultRequiredRule,
  status: defaultRequiredRule
};

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 角色候選之持有快照、讀取態、請求世代與自繪標籤。
/**
 * 編輯態開抽屜當下之列上持有角色（含停用、不含已軟刪）：送出時判「角色有無改動」之基準，也是灰色保留選項之料源。
 * 每次開抽屜重置（見 handleInitModel）。
 */
const heldRoles = ref<Api.UserAdmin.UserRole[]>([]);

/**
 * 角色候選之讀取態：'loading'＝本輪讀取未落地、'ready'＝落地且成功、'failed'＝落地但失敗。非 ready 一律停用下拉；只有 failed
 * 出告知文字（每次開抽屜都會先經過 loading，那時出字＝把常態當異常報）。failed 時下拉仍顯示列上持有之角色、送出恆不帶角色欄。
 */
const roleOptionsState = ref<'loading' | 'ready' | 'failed'>('loading');

/**
 * 候選讀取之請求世代：抽屜不卸載（display-directive="show"），開→關→開即可能有兩支讀取同時在飛。每輪起手遞增、回應到時先比對，
 * 不是最新一輪就整段丟棄（成功、失敗皆然）——否則遲到的那支會改寫本輪之候選與讀取態（出處＝rev5:src/views/manage/user/modules/user-operate-drawer.vue
 * 之同名守，與本 repo 角色頁三顆授權彈窗之 checksReq 同形）。
 */
let roleOptionsReq = 0;

/** 角色下拉停用：候選未就緒，或本人列（後端拒本人列帶角色欄） */
const roleSelectDisabled = computed(() => roleOptionsState.value !== 'ready' || selfFieldsLocked.value);

/** 兩個角色 id 集是否相等、不計次序——多選下拉交回的次序跟著點選先後走，按位置逐一比對會把未動過的選擇誤判為已變更 */
function sameRoleIdSet(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false;
  }

  const set = new Set(a);

  return b.every(id => set.has(id));
}

/**
 * 角色欄已選標籤之自繪。naive-ui 2.44.1 多選下拉之內建標籤對停用選項不給關閉鈕（`_internal/selection` 之
 * `closable: !option.disabled`），灰色保留選項（持有而已停用之角色）便移除不掉；本函式重繪標籤，關閉鈕恆在、可用與否只隨下拉
 * 整體停用與否：下拉可用時每個標籤（含灰項）之關閉鈕可點；下拉停用時（讀取中、讀取失敗、本人列）關閉鈕呈灰色、點了不觸發
 * （NTag 之 disabled 擋下關閉事件）——與內建標籤對一般選項之呈現同形，停用態照樣顯示灰色關閉鈕、標籤寬度不隨讀取態變動。
 * 與內建標籤逐項對照：disabled、onClose 與兩個內部關閉鈕旗標（internalCloseIsButtonTag、internalCloseFocusable）照抄；
 * closable 由內建形之 `!option.disabled` 改為恆 true；size 未傳——內建標籤取下拉之合併尺寸（下拉→表單項→表單→全域 Form
 * 預設→medium），本函式之標籤則走 NTag
 * 自身之解析（全域 Tag 預設→medium）：本表單與下拉皆未設尺寸、全域亦未設此兩項預設，兩者才同為 medium（日後任一處設尺寸即分岔、
 * 須於此補 size）；標籤文字以 String(option.label) 渲染，候選與灰項之 label 皆為字串，與內建形之渲染結果相同。
 * 移除後該灰項仍見於下拉、不可再選。
 */
const renderRoleTag: SelectRenderTag = ({ option, handleClose }) =>
  h(
    NTag,
    {
      closable: true,
      disabled: roleSelectDisabled.value,
      internalCloseIsButtonTag: false,
      internalCloseFocusable: false,
      onClose: handleClose
    },
    { default: () => String(option.label) }
  );
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

/** the enabled role options */
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 選項值改角色 id（寫端收 roleIds），並容停用旗標：候選以外另立之灰色保留選項（持有而已停用之角色）帶 disabled＝不可新選，故本清單不再盡是上行所說之啟用角色；原行: const roleOptions = ref<CommonType.Option<string>[]>([]);
const roleOptions = ref<(CommonType.Option<number> & { disabled?: boolean })[]>([]);

async function getRoleOptions() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 請求世代起手（見 roleOptionsReq）
  const req = ++roleOptionsReq;
  const { error, data } = await fetchGetAllRoles();

  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 非最新一輪之回應整段丟棄；
  // 讀取態必在此守之後才落地——遲到之失敗不得把本輪已就緒之下拉反鎖、遲到之成功也不得解鎖本輪未就緒之下拉
  if (req !== roleOptionsReq) {
    return;
  }

  roleOptionsState.value = error ? 'failed' : 'ready';
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

  if (!error) {
    const options = data.map(item => ({
      label: item.roleName,
      // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 選項值改角色 id；候選全列、不過濾（含超管角色——包含規則由後端唯一裁判，前端剔除即預判）；原行: value: item.roleCode
      value: item.id
    }));

    // 範例資料補選項之碼（連同其上下三行說明註解）改為灰色保留選項：持有而不在候選內者＝已停用之角色（候選只回啟用角色、列上持有則含停用），
    // 另立選項——標籤為角色名接停用標示、disabled＝不可新選，仍以自繪標籤保有移除鈕（見 renderRoleTag）；編輯初值已含其 id，未移除即隨之保留
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 改為灰色保留選項（見上兩行）；沿用基線變數名與下方合併行之次序，灰項列在候選之前；原行: const userRoleOptions = model.value.userRoles.map(item => ({
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: label: item,
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: value: item
    const candidateIds = new Set(options.map(item => item.value));
    const userRoleOptions = heldRoles.value
      .filter(role => !candidateIds.has(role.id))
      .map(role => ({
        label: `${role.roleName}${$t('page.manage.user.roleDisabledTag')}`,
        value: role.id,
        disabled: true
      }));

    roleOptions.value = [...userRoleOptions, ...options];
  }
}

function handleInitModel() {
  model.value = createDefaultModel();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 每次開抽屜重置候選、持有快照與讀取態：抽屜不卸載，
  // 不重置就把上一列（或上一輪）之灰色選項與讀取態帶進本輪——帶著 ready 者，本輪候選尚未落地下拉卻已可點
  heldRoles.value = [];
  roleOptions.value = [];
  roleOptionsState.value = 'loading';
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

  if (props.operateType === 'edit' && props.rowData) {
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 逐欄回填、不整列併入（列另帶 id、審計欄等表單不管之欄）：四個可空文字欄之 null 轉空字串進輸入框；角色初值取列上持有角色之 id（含停用者）同步落定、不等候選，並記下持有快照；候選未到位前下拉以持有角色之名稱為選項（停用中、只供顯示）；原行: Object.assign(model.value, jsonClone(props.rowData));
    const { userName, userGender, nickName, userPhone, userEmail, userMemo, roles, status, sessionPolicy } =
      props.rowData;

    model.value = {
      userName,
      password: '',
      userGender,
      nickName: nickName ?? '',
      userPhone: userPhone ?? '',
      userEmail: userEmail ?? '',
      userMemo: userMemo ?? '',
      roleIds: roles.map(role => role.id),
      status,
      sessionPolicy
    };
    heldRoles.value = roles;
    roleOptions.value = roles.map(role => ({ label: role.roleName, value: role.id }));
  }
}

function closeDrawer() {
  visible.value = false;
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 更新請求體之型與可空文字欄之空值歸一。
/**
 * 更新請求體：wire 型容 `userName`（建立後不可變，出現即被拒——型別照實涵蓋 wire 可達形）；本抽屜組 body 時以 `never` 封住該欄，
 * 逐欄寫出 `userName`、或展開含該欄之物件（例：整個表單物件）即 typecheck 紅。射程外：展開不含 `userName` 之物件（例：先解構
 * 拿掉帳號名再展開其餘）——展開來的多餘欄不受物件字面多餘屬性檢查，型別判不出，由審查承接。
 */
type UpdateBody = Api.UserAdmin.UpdateReq & { userName?: never };

/** 空字串→null：更新端可空文字欄之「清空」以 null 表達（後端亦把空字串歸一為清空、畫面零差） */
function blankToNull(value: string) {
  return value === '' ? null : value;
}
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

async function handleSubmit() {
  await validate();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 送出接真（取代基線之請求佔位註解）。
  // 拒因提示由共用攔截層轉譯，本抽屜只看成敗。
  if (isEdit.value) {
    const row = props.rowData;

    if (!row) {
      return;
    }

    // 狀態與角色只在改動時才帶（缺席＝不動）：開抽屜期間他處若已停用該帳號或改了其指派，未動這兩欄之送出不會拿開啟時之舊值蓋回去。
    // 本人列一律不帶（見 selfFieldsLocked）；角色另須候選讀取就緒——未就緒時下拉停用、選取值只是持有角色之原樣
    const statusChanged = !selfFieldsLocked.value && model.value.status !== row.status;
    const rolesChanged =
      !selfFieldsLocked.value &&
      roleOptionsState.value === 'ready' &&
      !sameRoleIdSet(
        heldRoles.value.map(role => role.id),
        model.value.roleIds
      );

    // 會話政策不在更新請求內、另打其端點；門＝超管且值有變（寫在送出面、不倚賴欄位停用）——非超管送出必被拒、沒改則不發。
    // 值與門皆在更新請求送出前、與 row 同一時點取快照：抽屜不卸載、請求在途期間可關可重開，重開即重置模型，等更新回來才讀模型＝
    // 拿新一輪之值配上這裡的 row（寫錯帳號、或把本次改動判成沒改而吞掉）
    const sessionPolicy = model.value.sessionPolicy;
    const sessionPolicyChanged = isSuper.value && sessionPolicy !== row.sessionPolicy;

    // 逐欄顯式構造、不帶帳號名（見 UpdateBody）；值為 undefined 之欄不上 wire
    const body: UpdateBody = {
      id: row.id,
      nickName: blankToNull(model.value.nickName),
      userGender: model.value.userGender,
      userPhone: blankToNull(model.value.userPhone),
      userEmail: blankToNull(model.value.userEmail),
      userMemo: blankToNull(model.value.userMemo),
      status: statusChanged ? (model.value.status ?? undefined) : undefined,
      roleIds: rolesChanged ? model.value.roleIds : undefined
    };

    const { error } = await fetchUpdateUser(body);

    if (error) {
      return;
    }

    // 只用送出起手之快照（見 sessionPolicyChanged）
    if (sessionPolicyChanged) {
      const { error: sessionPolicyError } = await fetchUpdateUserSessionPolicy({ id: row.id, sessionPolicy });

      if (sessionPolicyError) {
        // 更新那支已生效：先讓清單刷新顯示已生效之改動，抽屜留在原地供重試會話政策；不出成功提示
        emit('submitted');
        return;
      }
    }
  } else {
    const { error } = await fetchAddUser({
      userName: model.value.userName,
      password: model.value.password,
      nickName: model.value.nickName,
      userGender: model.value.userGender,
      userPhone: model.value.userPhone,
      userEmail: model.value.userEmail,
      userMemo: model.value.userMemo,
      status: model.value.status ?? undefined,
      roleIds: model.value.roleIds
    });

    if (error) {
      return;
    }
  }
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleOptions();
  }
});

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 新增態設密欄之兩件輔助：「隨機密碼」產密入口、關閉即清明文密碼。
// 產密入口：設密欄右側之鈕開產密浮層、「帶入」即填欄（填進的是尚未送出之新增表單、送出前本有確定鈕，不另加確認）；只有新增態開得了它
// （編輯態不渲染設密欄）。浮層掛在表單之外（見模板）；其帳號名比對對象＝本表單正在建立之帳號名、不是登入者自己。
const pwdGenVisible = ref(false);

/** 密碼政策投影（產密浮層之構造界；取得與快取皆在共用 hook，本檔只讀） */
const { policy: pwdPolicy, ensureLoaded: ensurePwdPolicy } = usePwdPolicy();

async function openPwdGen() {
  // 已有快取即零請求；讀失敗維持 null＝產密浮層以其後備界產生、不擋產密
  await ensurePwdPolicy();

  pwdGenVisible.value = true;
}

function handlePwdGenApply(password: string) {
  model.value.password = password;
}

// 關閉即清明文密碼：抽屜不卸載、模型跨開關存活，
// 新增態打進去的密碼不清就一直留在記憶體裡直到下次開抽屜。掛在 visible 之 falsy 邊、不掛 closeDrawer()——
// 標題列關閉鈕、遮罩點擊與 ESC 都直接改 visible、不經該函式；另立一支 watch 而不在上面那支補 else，免動基線既有行
watch(visible, value => {
  if (!value) {
    model.value.password = '';
  }
});
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 本項只在新增態渲染；編輯態改渲染下方停用之同欄（帳號名建立後不可變、更新請求不帶此欄）；原行: <NFormItem :label="$t('page.manage.user.userName')" path="userName"> -->
        <NFormItem v-if="!isEdit" :label="$t('page.manage.user.userName')" path="userName">
          <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 編輯態之帳號名欄（停用、承上項之 v-if）；設密欄僅新增態（更新請求無此欄），只驗必填、右接「隨機密碼」鈕、下附提示一行。帳號名欄以兩態兩項分寫而不在上項輸入框加停用屬性：改輸入框行會使本塊與上方改行之間只隔一個重複多見之閉合標籤行、差異工具將兩者併成同一變更塊，本塊拔圈界即驗不出 -->
        <NFormItem v-else :label="$t('page.manage.user.userName')" path="userName">
          <NInput v-model:value="model.userName" disabled :placeholder="$t('page.manage.user.form.userName')" />
        </NFormItem>
        <NFormItem v-if="!isEdit" :label="$t('page.manage.user.password')" path="password">
          <div class="w-full flex-col-stretch gap-4px">
            <NInputGroup>
              <NInput
                v-model:value="model.password"
                type="password"
                show-password-on="click"
                :placeholder="$t('page.manage.user.form.password')"
              />
              <NButton @click="openPwdGen">{{ $t('page.manage.user.randomPassword') }}</NButton>
            </NInputGroup>
            <span class="text-12px text-#999">{{ $t('page.manage.user.passwordHint') }}</span>
          </div>
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
        <NFormItem :label="$t('page.manage.user.userGender')" path="userGender">
          <NRadioGroup v-model:value="model.userGender">
            <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.nickName')" path="nickName">
          <NInput v-model:value="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userPhone')" path="userPhone">
          <NInput v-model:value="model.userPhone" :placeholder="$t('page.manage.user.form.userPhone')" />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] path 改正為模型欄名 userEmail（基線之 email 非本表單任一模型欄、掛規則即落空）；原行: <NFormItem :label="$t('page.manage.user.userEmail')" path="email"> -->
        <NFormItem :label="$t('page.manage.user.userEmail')" path="userEmail">
          <NInput v-model:value="model.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userStatus')" path="status">
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 加 :disabled——本人列停用（見 selfFieldsLocked）；原行: <NRadioGroup v-model:value="model.status"> -->
          <NRadioGroup v-model:value="model.status" :disabled="selfFieldsLocked">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] path 改正為模型欄名 roleIds（基線之 roles 非模型欄名）；加 feedback 與 validation-status 兩屬性：候選讀取失敗時於本項回饋列出告知文字（警示色）、其餘時候不設。此呈現與 rev5 不同（rev5 於下拉之下另起一行 12px 警示色文字、下拉框不變色；此處為表單回饋列之字級、下拉框隨之轉警示色），成因（兩形皆實測）：在下拉之後、本項閉合標籤之前插入告知行，或以直排容器包覆下拉（下拉隨之重縮排），本項閉合行即與其後會話政策那段新增碼併成同一替換塊，該告知段與會話政策段拔圈界皆驗不出；原行: <NFormItem :label="$t('page.manage.user.userRole')" path="roles"> -->
        <NFormItem
          :label="$t('page.manage.user.userRole')"
          path="roleIds"
          :feedback="roleOptionsState === 'failed' ? $t('page.manage.user.roleOptionsUnavailable') : undefined"
          :validation-status="roleOptionsState === 'failed' ? 'warning' : undefined"
        >
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 值改綁角色 id 集；加 :disabled（候選未就緒或本人列）與 :render-tag（自繪標籤使灰色保留選項仍可移除，見 renderRoleTag），兩新屬性緊接被替換行、同一變更塊；原行: v-model:value="model.userRoles" -->
          <NSelect
            v-model:value="model.roleIds"
            :disabled="roleSelectDisabled"
            :render-tag="renderRoleTag"
            multiple
            :options="roleOptions"
            :placeholder="$t('page.manage.user.form.userRole')"
          />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 會話政策欄僅編輯態（新增請求無此欄、新帳號由後端落 inherit）；非超管顯示現值但停用並附提示。記事欄為多行輸入；其清單端只以純文字插值顯示 -->
        <NFormItem v-if="isEdit" :label="$t('page.manage.user.sessionPolicy')" path="sessionPolicy">
          <div class="w-full flex-col-stretch gap-4px">
            <NSelect
              v-model:value="model.sessionPolicy"
              :disabled="sessionPolicyLocked"
              :options="sessionPolicyOptions"
            />
            <span v-if="sessionPolicyLocked" class="text-12px text-warning">
              {{ $t('page.manage.user.sessionPolicyHint') }}
            </span>
          </div>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userMemo')" path="userMemo">
          <NInput v-model:value="model.userMemo" type="textarea" :placeholder="$t('page.manage.user.form.userMemo')" />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
      </NForm>
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 產密浮層（新增態設密欄之「隨機密碼」鈕開它）：掛在表單之外——掛在表單項內，浮層裡的輸入元件會注入該表單項（承其驗證狀態色與停用態、並把失焦與輸入事件回報給設密欄） -->
      <PwdGenModal
        v-model:visible="pwdGenVisible"
        :policy="pwdPolicy"
        :user-name="model.userName"
        @apply="handlePwdGenApply"
      />
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
