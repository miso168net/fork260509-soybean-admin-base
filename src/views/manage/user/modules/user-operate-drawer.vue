<script setup lang="ts">
import { computed, ref, watch } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 編輯回填改逐欄顯式構造（見 handleInitModel）、jsonClone 隨之無消費者；原行: import { jsonClone } from '@sa/utils';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 角色候選改打 rev5 wrapper 的 getAllRoles（★直接路徑、不經 barrel——沿 role 頁三顆 modal 之 rev5-role-admin 消費先例；回 `{id, roleCode, roleName}` 三欄白名單，本抽屜要的是 **id**：寫端契約收 roleIds、demo 殼那支的型不帶語意差別但走的是凍結的 demo 命名空間）；原行: import { fetchGetAllRoles } from '@/service/api';
import { fetchGetAllRoles } from '@/service/api/rev5-role-admin';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 新增／更新提交接真（同上，直接路徑）
import { fetchAddUser, fetchUpdateUser } from '@/service/api/rev5-user-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 型別切 rev5 獨立命名空間（接真 wire 形）；原行: rowData?: Api.SystemManage.User | null;
  rowData?: Api.UserAdmin.UserRecord | null;
}

const props = defineProps<Props>();

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

const isEdit = computed(() => props.operateType === 'edit');

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 表單模型改自持（demo 型 Pick 不敷用）：
// ①`userRoles`（角色 code 集）換 `roleIds`（角色 id 集）＝寫端契約的指派載體（R2#25 期望全集拍板）
// ②補 `password`（僅新增模式渲染＝契約 §3 必填欄的輸入載體）與 `userMemo`（FR-015 記事欄）
// ③可空欄一律以空字串承載「沒填」（送出時的收斂見 handleSubmit——★新增與更新兩端的收斂規則不同）。
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: type Model = Pick<
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: Api.SystemManage.User,
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: >;
type Model = {
  userName: string;
  password: string;
  /** 契約 §共用型逐字 `string | null`（非二值枚舉——後端誠實 to_string、值域外可達） */
  userGender: string | null;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userMemo: string;
  roleIds: number[];
  status: Api.Common.EnableStatus | null;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    userName: '',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 新增模式密碼空值起手（編輯模式該欄不渲染、恆留空）
    password: '',
    userGender: null,
    nickName: '',
    userPhone: '',
    userEmail: '',
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 指派載體換角色 id 集；原行: userRoles: [],
    roleIds: [],
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 記事欄（FR-015）
    userMemo: '',
    status: null
  };
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] password 入必填規則集（欄僅新增模式渲染、編輯模式隱欄不註冊即不觸驗；政策細則為後端權威、前端不預判）；原行: type RuleKey = Extract<keyof Model, 'userName' | 'status'>;
type RuleKey = Extract<keyof Model, 'userName' | 'status' | 'password'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  status: defaultRequiredRule,
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 見上
  password: defaultRequiredRule
};

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 下拉值改 id（原為 role code）；原行: const roleOptions = ref<CommonType.Option<string>[]>([]);
/** the enabled role options */
const roleOptions = ref<CommonType.Option<number>[]>([]);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 編輯模式的角色指派初值快照
// ＝送出時的 diff 基準（見 handleSubmit）。★候選讀失敗時本快照與 model.roleIds 同為空集 ⇒ 判為「沒改」、
// roleIds 整欄缺席送出（契約 §4 缺席＝不動），不會把一次讀失敗變成一次「解除全部角色」的寫入。
const initialRoleIds = ref<number[]>([]);

/** 兩個角色 id 集是否等價（順序無關；NSelect 的回報序隨點選次序而變，逐位比會把「沒改」判成「改了」） */
function sameRoleIdSet(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false;
  }

  const set = new Set(a);

  return b.every(id => set.has(id));
}
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 候選集解不出的持有角色 code。
// 成因＝兩個口徑不同：列 wire 的 `roles` 是**成員身分**（不濾角色 status、只濾軟刪），而候選讀端
// getAllRoles 是「活性**且啟用**」——管理員在角色頁停用一個已被指派的角色，該角色就從候選集消失、
// 卻仍實際掛在使用者身上（後端 sys_user_role 逐字認可此態：「停用角色照回、軟刪角色不回」）。
// 危害：code→id 的映射源只有候選集這一份，解不出的角色既進不了 initialRoleIds、也進不了 model.roleIds；
// 而契約 §4 的 `roleIds` 是**期望全集、全量替換**（R2#25）⇒ 只要在下拉裡動任何一個角色，送出就把那個
// 從頭到尾沒顯示過的指派一併硬刪（連帶觸發 casbin reload），是一次無聲的權限資料遺失。
// 處置：本抽屜結構性補不回那些 id（`AllRole` 白名單恰三欄、且該端點本就不回停用角色），故**不猜、不硬送**
// ——改為在此狀態下鎖住角色指派並逐字告知，把「看不見的遺失」換成「看得見的一次擋下」。
const unresolvedRoleCodes = ref<string[]>([]);
/**
 * 角色候選集的讀取態（本刀 U6 碼品質輪補）：'loading'＝這一輪的 getRoleOptions 尚未落地、'ready'＝落地且成功、
 * 'failed'＝落地但讀失敗。立此態要修的是**顯示面**誤導：getRoleOptions 的 `if (!error)` 不成立時整塊寫入被跳過，
 * 而 handleInitModel 起手已把 roleOptions／initialRoleIds／unresolvedRoleCodes 一併清空（資料面因此是對的——見
 * initialRoleIds：判為沒改、roleIds 整欄缺席送出），於是編輯抽屜停在「下拉空集、可點、無任何說明」，畫面等同
 * 宣告「這個帳號沒有任何角色」；管理員據此誤判權限現況，而攔截層那顆 toast 一閃即逝、頁內留不下痕跡。守法＝把
 * 「候選不可信」這條路徑接進本檔既有的鎖定機制（disabled ＋ 逐字告知），與本刀 U6 同批為 role 頁三顆 modal 補的
 * checksLoaded 就緒守同形。
 * ★取三態而非單一布林旗標：'loading' 與 'failed' 的**告知文字**必須分得開——兩態併成「未就緒」時，每次開抽屜的
 * 正常讀取窗口都會先閃一則警示色文字，把常態當異常報。停用面則兩態同待（皆非 'ready'）。
 */
const roleOptionsState = ref<'loading' | 'ready' | 'failed'>('loading');

/** 角色指派是否鎖定＝候選集未就緒（見 roleOptionsState）或存在候選集解不出的持有角色（見 unresolvedRoleCodes） */
const roleAssignLocked = computed(() => roleOptionsState.value !== 'ready' || unresolvedRoleCodes.value.length > 0);
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] getRoleOptions 的請求世代序號（本刀 U6 碼品質輪補）：
// 抽屜走 display-directive="show"、從不卸載，roleOptions／initialRoleIds／model.roleIds 皆為跨開關存活的模組級狀態，
// 而 watch(visible) 每次開啟都發一支 fetchGetAllRoles（未 await）⇒ 開→關→開即有兩支同時在飛行。兩支算出的值雖逐位
// 相同，但先落地的那支已把下拉 populated 且未 disabled；管理員此刻改了選取，後落地的那支就無條件把 model.roleIds
// 蓋回 initialRoleIds（先發後到、後發先到皆然）。危害不止畫面還原：handleSubmit 的 rolesChanged 隨之恆為 false
// ⇒ roleIds 整欄缺席送出（契約 §4 缺席＝不動）⇒ 後端零寫入零稽核，前端卻照樣 toast「更新成功」，是一次沒有任何
// 錯誤可循的漏改。守法逐字比照本刀同批修的 role 頁三顆 modal（menu-auth-modal 的 checksReq／homeReq）：起手遞增
// 本序號、await 回來先比對，非最新一輪即整段丟棄（成功、失敗一律丟棄）。
let roleOptionsReq = 0;
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

async function getRoleOptions() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 世代守起手（見 roleOptionsReq）
  const req = ++roleOptionsReq;
  const { error, data } = await fetchGetAllRoles();

  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 過期回應一律丟棄（成功、失敗皆然）
  if (req !== roleOptionsReq) {
    return;
  }
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 讀取態落地（見 roleOptionsState）——★必在世代守之後：過期回應不得改動就緒態，否則一支遲到的失敗會把最新一輪的成功態抹成 'failed'、把已就緒的下拉反鎖起來
  roleOptionsState.value = error ? 'failed' : 'ready';

  if (!error) {
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 下拉值改 id（寫端契約收 roleIds）；★候選**全列不過濾**——no-escalation 的包含規則由後端唯一裁判，前端自行剔除等於預判後端規則（G8）；原行: const options = data.map(item => ({
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: value: item.roleCode
    roleOptions.value = data.map(item => ({
      label: item.roleName,
      value: item.id
    }));

    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 清 demo 補償碼（把使用者現有角色 code 硬塞成選項），改以候選清單把列上的角色 **code** 映回 **id**——列 wire 帶的是 code、寫端契約收的是 id，映射源只有 getAllRoles 這一份；★映射在候選到位後才做，故本段同時是編輯模式 roleIds 的落點——★該落點對 model.roleIds 是無條件覆寫、必須在世代守之後才執行（守與其理由見 roleOptionsReq）；原行: const userRoleOptions = model.value.userRoles.map(item => ({
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: label: item,
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: value: item
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: roleOptions.value = [...userRoleOptions, ...options];
    if (props.operateType === 'edit' && props.rowData) {
      const held = new Set(props.rowData.roles);
      const heldOptions = data.filter(item => held.has(item.roleCode));
      // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 映得出的 code 集＝差集的被減數；
      // 差集非空即進鎖定態（見 unresolvedRoleCodes）。★差集算在 rowData.roles 這一側，不是候選集那一側。
      const resolvedCodes = new Set(heldOptions.map(item => item.roleCode));

      initialRoleIds.value = heldOptions.map(item => item.id);
      model.value.roleIds = [...initialRoleIds.value];
      unresolvedRoleCodes.value = props.rowData.roles.filter(code => !resolvedCodes.has(code));
    }
  }
}

function handleInitModel() {
  model.value = createDefaultModel();
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 快照、鎖定態與候選集皆與模型同進退
  // （見 initialRoleIds／unresolvedRoleCodes／roleOptions）——★不重置就會把上一列的鎖定態帶進這一列的抽屜。
  // ★roleOptions 一併清空的理由（本刀 U6 碼品質輪補）：抽屜走 display-directive="show"、從不卸載，候選集是跨開關
  // 存活的模組級狀態。不清時，第二次以後開抽屜若 getRoleOptions 讀失敗（`if (!error)` 整塊被跳過），下拉仍掛著上
  // 一輪的有效候選，而選取值已被本函式清成空集、unresolvedRoleCodes 亦為空集 ⇒ 鎖定態不成立、下拉未停用亦無任何
  // 告知，畫面謊稱「這個帳號沒有任何角色」。此時點任一項即令 rolesChanged 為真，而契約 §4 的 roleIds 是期望全集
  // 全量替換（R2#25）⇒ 一次點選就硬刪掉從未顯示過的既有指派並觸發 casbin reload（與 unresolvedRoleCodes 要防的
  // 是同一種無聲權限資料遺失，只是觸發器換成「候選讀失敗」）。清空後「候選未到位＝下拉無選項可點」由文字自述
  // 變成程式真相，initialRoleIds 那段「讀失敗＝判為沒改、roleIds 整欄缺席」的不變式才在第二次開抽屜起繼續成立。
  initialRoleIds.value = [];
  unresolvedRoleCodes.value = [];
  roleOptions.value = [];
  // ★讀取態一併復位（見 roleOptionsState）：不復位就把上一列那一輪的 'ready'／'failed' 帶進這一列的抽屜——
  // 帶 'ready' 者更糟：本輪候選連發都還沒落地，鎖定態卻已解除、下拉在空集狀態下可點。
  roleOptionsState.value = 'loading';
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

  if (props.operateType === 'edit' && props.rowData) {
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 逐欄顯式回填、不整包拷貝：UserRecord 另帶 id／roles／審計欄等，整包進 model 再散出去會把 userName 一併送進 updateUser——rev5 契約「出現即拒」（rev4 等值放行不帶回、R2#2）；四個可空欄以空字串進 NInput（送出時的還原見 handleSubmit）；roleIds 於候選到位後由 getRoleOptions 落值；原行: Object.assign(model.value, jsonClone(props.rowData));
    const { userName, userGender, nickName, userPhone, userEmail, userMemo, status } = props.rowData;

    model.value = {
      userName,
      password: '',
      userGender,
      nickName: nickName ?? '',
      userPhone: userPhone ?? '',
      userEmail: userEmail ?? '',
      userMemo: userMemo ?? '',
      roleIds: [],
      status
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 空字串→null（**更新端**三態之「清空」）。
// ★更新端不走後端的 blank_to_none（那顆只在新增端）：空字串原樣送出＝把一個原本為 NULL 的欄設成空字串
// ＝造出一次真變更，於是「沒改任何值按確定」會落一次寫入與一次稽核，把契約 §4 的 no-op 零寫入直接打掉。
function blankToNull(value: string) {
  return value === '' ? null : value;
}
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]

async function handleSubmit() {
  await validate();
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 提交接真（契約 §3／§4）：
  // add→fetchAddUser（含密碼；空字串由後端 blank_to_none 落 NULL）／edit→fetchUpdateUser（★逐欄顯式構造、
  // 絕不散開 model——userName 出現即 2222 userNameImmutable，請求型已結構性無此欄）。
  // ★`status`／`roleIds` **只在真的改了才帶**：契約 §4 的 self 守門是「出現即拒」（`cannotEditSelfRoleOrStatus`），
  // 無條件回送等於讓任何人連自己的暱稱都改不動（FR-013 明寫 self 可改非角色欄）；缺席＝不動，語意正好對上。
  // ★拒因（userNameInvalid／userNameExists／userEmailExists／roleNotFound／seededProtected／守門鍵／政策攜參…）
  // 與 5003（no-escalation）一律由共用攔截層轉譯 backend.biz.user.* 後 toast，此處只看 error 是否為真。
  const { status } = model.value;

  if (!status) {
    // status 必填規則已由上方 validate() 擋下——此處僅型別收窄
    return;
  }

  if (isEdit.value) {
    const rowId = props.rowData?.id;

    if (rowId === undefined) {
      return;
    }

    const statusChanged = status !== props.rowData?.status;
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] ★鎖定態**恆不送 roleIds**（缺席＝不動）：
    // 契約 §4 該欄是期望全集全量替換，而鎖定態下的 model.roleIds 結構性缺了解不出的那幾個角色——送出
    // 等同替使用者做了一次沒說出口的解除。下拉已 disabled、正常路徑本就不會變動，此處把該不變式寫進
    // 提交面本身，不倚賴一個 UI 屬性當唯一防線。
    const rolesChanged = !roleAssignLocked.value && !sameRoleIdSet(initialRoleIds.value, model.value.roleIds);

    const { error } = await fetchUpdateUser({
      id: rowId,
      nickName: blankToNull(model.value.nickName),
      userGender: model.value.userGender,
      userPhone: blankToNull(model.value.userPhone),
      userEmail: blankToNull(model.value.userEmail),
      userMemo: blankToNull(model.value.userMemo),
      status: statusChanged ? status : undefined,
      roleIds: rolesChanged ? model.value.roleIds : undefined
    });

    if (error) {
      return;
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
      status,
      roleIds: model.value.roleIds
    });

    if (error) {
      return;
    }
  }
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
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

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 關閉即清明文密碼（本刀 U6 碼品質輪補）：
// 抽屜走 display-directive="show"、元件從不卸載，而 model 是模組級 ref ⇒ 新增模式打進去的明文密碼在按下確定或關閉
// 之後仍續留在 model.value.password，要等下一次有人再開這個抽屜、handleInitModel 重置時才消失（user 頁被 KeepAlive
// 留在分頁堆疊裡時，殘留期可長達整個 SPA 生命週期）。跨提交無外洩風險（編輯路徑結構性不送 password、再開新增時
// handleInitModel 已重置），純屬敏感狀態的無謂停留——一行收掉，與本刀 U6 在三顆 role modal 上執行的「顯示狀態與
// 模型同進退」同一形。
// ★掛在 visible 的 falsy 邊、不掛 closeDrawer() 內：關閉路徑不只確定鈕與取消鈕——NDrawerContent 的 closable 叉、
// 遮罩點擊與 ESC 都直接改 visible、不經 closeDrawer()，掛函式內會漏掉那三條。
// ★另立一支 watch、不在既有那支補 else 分支：既有 watch 的 if 閉合行逐字承自基線，補 else 即動到基線既有行；
// 另立一支＝純新增、走新增型圈界（憲法 §III.2）。
watch(visible, val => {
  if (!val) {
    model.value.password = '';
  }
});
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END]
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.userName')" path="userName">
          <!--
            編輯模式停用——帳號名建立後不可變（契約 §4 出現即拒；提交面已結構性不送此欄，此處把「改不動」誠實呈現、不留可打字卻無效的入口）。
            ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
          -->
          <NInput
            v-model:value="model.userName"
            :disabled="isEdit"
            :placeholder="$t('page.manage.user.form.userName')"
          />
        </NFormItem>
        <!--
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 密碼欄＝**僅新增模式**（契約 §3 必填、
          §4 無此欄——改他人密碼走另一支端點）。★前端只驗必填：政策細則（長度／字元類／不得同帳號名）為後端權威，
          違規明細經攔截層以 `passwordPolicy{violations}` 渲染，前端不預判亦不自造規則文案。
        -->
        <NFormItem v-if="!isEdit" :label="$t('page.manage.user.password')" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.manage.user.form.password')"
          />
        </NFormItem>
        <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
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
        <!--
          path 修正為 `userEmail`——基線寫的 `email` 不是本表單任何一個模型欄名（NFormItem 的 path 即模型鍵路徑：欄名對不上時該欄的規則與驗證回饋一律落空）。
          ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: <NFormItem :label="$t('page.manage.user.userEmail')" path="email">
        -->
        <NFormItem :label="$t('page.manage.user.userEmail')" path="userEmail">
          <NInput v-model:value="model.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <!--
          path 同上修正（基線的 `roles` 亦非模型欄名）；值改綁 roleIds＝寫端契約的指派載體。
          ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: <NFormItem :label="$t('page.manage.user.userRole')" path="roles">
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v) 007-user-password-admin] 原行: v-model:value="model.userRoles"
        -->
        <NFormItem :label="$t('page.manage.user.userRole')" path="roleIds">
          <!--
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin START] 鎖定態的兩件事：
            ①下拉停用——候選集解不出該帳號全部持有角色時，任何一次改動送出都會全量替換掉解不出的那幾個
            指派（成因與危害見 unresolvedRoleCodes），與其讓管理員白做一輪再被擋，不如當場改不動；
            ②逐字說明——把「改不動」與「該去哪裡解決」一起講明，角色 code 以純文字插值（自由文字一律不走
            原始 HTML；機器守＝tools/view-render-guard.py）。分隔符沿用既有的 listSeparator 鍵、不寫死語系標點。
            ★告知文字兩則、按成因分（本刀 U6 碼品質輪補）：持有角色解不出→roleAssignLocked（帶 {roles}）；
            候選讀失敗→roleOptionsUnavailable（見 roleOptionsState）。'loading' 態只停用、不出文字：正常讀取
            窗口每次開抽屜都會經過，出文字＝把常態當異常報。
          -->
          <div class="w-full flex-col-stretch gap-4px">
            <NSelect
              v-model:value="model.roleIds"
              multiple
              :disabled="roleAssignLocked"
              :options="roleOptions"
              :placeholder="$t('page.manage.user.form.userRole')"
            />
            <span v-if="unresolvedRoleCodes.length > 0" class="text-12px text-warning">
              {{
                $t('page.manage.user.roleAssignLocked', {
                  roles: unresolvedRoleCodes.join($t('backend.common.listSeparator'))
                })
              }}
            </span>
            <span v-else-if="roleOptionsState === 'failed'" class="text-12px text-warning">
              {{ $t('page.manage.user.roleOptionsUnavailable') }}
            </span>
          </div>
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin END] -->
        </NFormItem>
        <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(v)+ 007-user-password-admin] 記事欄 textarea（FR-015；placeholder 逐字註明僅管理員可見；值的顯示端一律純文字插值） -->
        <NFormItem :label="$t('page.manage.user.userMemo')" path="userMemo">
          <NInput v-model:value="model.userMemo" type="textarea" :placeholder="$t('page.manage.user.form.userMemo')" />
        </NFormItem>
      </NForm>
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
