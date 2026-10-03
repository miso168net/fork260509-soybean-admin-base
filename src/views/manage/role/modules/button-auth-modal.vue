<script setup lang="ts">
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 補匯入 `watch`：初始化由掛載即跑改為隨彈窗開啟觸發（見檔尾）；原行: import { computed, shallowRef } from 'vue';
import { computed, shallowRef, watch } from 'vue';
import { $t } from '@/locales';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 按鈕維授權的現況讀、全量寫與候選讀（006 刀 wrapper）
// 以直接路徑匯入、不經 barrel。排在語系匯入之後（003 刀登入三表單的 wrapper 匯入同此位置）：`vue` 那行匯入是修改型，本塊若緊貼
// 其下會併入同一變更塊；隔著未改的語系匯入行即自成純新增變更塊，拔掉圈界會被 fork-delta-lint 判為未圈界新增。
// 寫端拒因（`biz.role.protectedRevoke`／`biz.role.notFound`）由共用攔截層轉譯出 toast，本檔只判 `error` 有無、不設專屬提示。
import { fetchGetAllButtons, fetchGetRoleButton, fetchUpdateRoleButton } from '@/service/api/rev6-authz';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

defineOptions({
  name: 'ButtonAuthModal'
});

interface Props {
  /** the roleId */
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.buttonAuth'));

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 候選碼、受保護鎖定、請求世代與就緒守（FR-034；rev5:B-116）
// 擺在樹節點型之前：其後的樹節點型與 `tree` 都有修改型，本塊若緊鄰它們會併入同一變更塊、拔掉圈界也不報；隔著未改的型別首行即可。
/** 按鈕碼候選：候選讀端原樣（治理域各選單按鈕碼的聯集、去重、保首見序）；每次開啟重取、讀成功才覆蓋 */
const codes = shallowRef<string[]>([]);

/**
 * 受保護按鈕碼集：取自現況讀端各項的 `protected: true`（判準只在後端、前端不另推）。鎖定分兩道——其一，下方 `tree` 為這些碼
 * 的節點帶上 `disabled`：naive-ui 2.44.1 的樹在勾選處理（`es/tree/src/Tree.mjs` 之 `handleCheck`）遇停用節點即返回、勾選框也
 * 畫成停用，故點不動、已勾者保留；其二，受控勾選集 `checks` 的 setter 每次寫入都把本集補回。後端對撤銷受保護項整批拒，是最後一道。
 */
const protectedCodes = shallowRef(new Set<string>());

/** NTree 實際持有的勾選集；只經下方 `checks` 的 setter 寫入 */
const rawChecks = shallowRef<string[]>([]);

/**
 * 現況讀的請求世代序號（rev5:B-116）。失效情境：角色甲的現況讀未回、管理員關窗改開角色乙，乙的讀失敗而甲的回應遲到成功——
 * 照單全收的話，甲的授權集會落進勾選集與受保護集並解開就緒守，按下確定即把甲的集合全量寫到乙身上。守法：每輪現況讀起手遞增
 * 本序號、回應到時先比對，不是最新一輪就整段丟棄（成功或失敗皆丟；就緒守不必在此另補，新一輪起手已把它復位、確定鈕維持停用）。
 * 用序號而不用 AbortController：請求層（`packages/axios`）為每筆請求自建的中止控制器收在內部對照表、對外只有全域
 * `cancelAllRequest`；呼叫端自帶 `signal` 雖可行，但本檔所用的 wrapper 都只收業務參數、不收請求設定，走中止就得連 wrapper
 * 簽名一起改，序號則只動本檔。
 */
let checksReq = 0;

/**
 * 就緒守：按鈕維寫端是全量替換，現況讀還沒成功就送出＝把空集當成期望全集，該角色的按鈕維授權會整批被撤。故確定鈕在現況讀
 * 成功前停用（見模板確定鈕的 `:disabled`）；讀失敗（攔截層已出 toast）維持停用、只能取消後重開；每次開啟（含換角色）都在
 * 現況讀起手復位。
 */
const checksLoaded = shallowRef(false);
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

type ButtonConfig = {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 樹節點鍵改承按鈕碼（字串），模板的 `key-field="id"` 那行因而不動；原行: id: number;
  id: string;
  label: string;
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 按鈕碼已由 `id` 承載，此欄改承受保護鎖定旗標（NTree 的停用欄位名預設即 `disabled`）；原行: code: string;
  disabled: boolean;
};

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改為 computed：候選碼逐一映成樹項（`id` 與 `label` 皆取按鈕碼）並疊上受保護鎖定；候選與現況兩支讀並行、到達先後不定，任一支落地都會重算（模板的樹資料繫結那行因而不動）；原行: const tree = shallowRef<ButtonConfig[]>([]);
const tree = computed<ButtonConfig[]>(() =>
  codes.value.map(code => ({ id: code, label: code, disabled: protectedCodes.value.has(code) }))
);

async function getAllButtons() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死的十筆假按鈕連同首尾兩行逐行移除、改打候選讀端（回 `string[]`；映成樹項見 `tree`）；原行: tree.value = [
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 1, label: 'button1', code: 'code1' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 2, label: 'button2', code: 'code2' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 3, label: 'button3', code: 'code3' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 4, label: 'button4', code: 'code4' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 5, label: 'button5', code: 'code5' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 6, label: 'button6', code: 'code6' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 7, label: 'button7', code: 'code7' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 8, label: 'button8', code: 'code8' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 9, label: 'button9', code: 'code9' },
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 10, label: 'button10', code: 'code10' }
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: ];
  const { error, data } = await fetchGetAllButtons();
  if (error) {
    return;
  }
  codes.value = data;
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 鍵型改字串（按鈕碼）並改為可寫 computed 充當受控勾選集：模板的勾選雙向綁定那行不動，NTree 每次回報都先經 setter、受保護碼一律補回，送出的集合因而恆含受保護項（授權契約：受保護項須原樣帶回）；按鈕樹無父子層級、不設 `cascade`，setter 只補回；原行: const checks = shallowRef<number[]>([]);
const checks = computed<string[]>({
  get: () => rawChecks.value,
  set: keys => {
    const merged = new Set(keys);
    protectedCodes.value.forEach(code => merged.add(code));
    rawChecks.value = Array.from(merged);
  }
});

async function getChecks() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改打按鈕維現況讀端（查詢鍵 `id`；回 `{code, protected}[]`）；原行: console.log(props.roleId);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死的勾選值移除、改落現況：先落受保護集再經 setter 落勾選集；就緒守起手復位、讀成功才放行；原行: checks.value = [1, 2, 3, 4, 5];
  const req = ++checksReq;
  checksLoaded.value = false;
  const { error, data } = await fetchGetRoleButton(props.roleId);
  // 非最新一輪的回應整段丟棄（成功、失敗同樣；與就緒守的關係見 `checksReq`）
  if (req !== checksReq) {
    return;
  }
  if (error) {
    return;
  }
  protectedCodes.value = new Set(data.filter(item => item.protected).map(item => item.code));
  checks.value = data.map(item => item.code);
  checksLoaded.value = true;
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 送出改 async 以等候寫端回應；原行: function handleSubmit() {
async function handleSubmit() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改打按鈕維全量寫（body `{id, buttons}`＝期望全集、受保護碼經 setter 恆在其中）；回應本體不取用、只判 `error`；原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleButton({ id: props.roleId, buttons: checks.value });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllButtons();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 每次開啟先清掉上一角色的勾選與鎖定、再發現況讀
  // （rev5:B-129）：本元件連續編輯不同角色時不重掛（見檔尾），不清的話本輪回應落地前仍顯示上一角色的狀態（確定鈕已被就緒守停用＝
  // 純視覺誤導、不致寫錯）。擺在此處而不在 `getChecks` 起手：該函式本體的基線行全數被替換，塊放進去必與修改型同屬一個變更塊、
  // 拔掉圈界 fork-delta-lint 也不報；`getChecks` 只由本函式呼叫，兩處的執行時序相同（同一同步段內、現況讀發出之前）。
  // ★兩行次序不可對調：先清受保護集、再經 setter 落空集——對調後 setter 會把舊的受保護碼補回去，等於沒清。
  protectedCodes.value = new Set();
  checks.value = [];
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
  getChecks();
}

// init
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 掛載即跑改為每次開啟彈窗時重取：角色抽屜以 `display-directive="show"` 常駐、本元件掛在其編輯態區塊內，連續編輯不同角色時不重掛，掛載即跑只讀得到初掛當下的角色（同目錄 menu-auth-modal 基線即為開啟觸發形）；原行: init();
watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      key-field="id"
      block-line
      checkable
      expand-on-click
      virtual-scroll
      class="h-280px"
    />
    <template #footer>
      <NSpace justify="end">
        <NButton size="small" class="mt-16px" @click="closeModal">
          {{ $t('common.cancel') }}
        </NButton>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 加 `:disabled` 屬性＝就緒守：現況讀成功前停用確定鈕（見 `checksLoaded`）；原行: <NButton type="primary" size="small" class="mt-16px" @click="handleSubmit"> -->
        <NButton type="primary" size="small" class="mt-16px" :disabled="!checksLoaded" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
