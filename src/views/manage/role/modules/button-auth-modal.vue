<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 加 watch（init() 改於 modal 開啟時重取、見檔尾）；原行: import { computed, shallowRef } from 'vue';
import { computed, shallowRef, watch } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 按鈕維授權讀寫＋候選全集 WRAPPER
// （★直接路徑、不經 barrel——沿 role-operate-drawer 之 rev5-role-admin 消費先例）。拒因 protectedRevoke／notFound 由共用
// 攔截層 toast、頁內零專屬 UI（FR-042；rev4 之 protected-revoke-detail 明細通道不帶回）。
// rev4: 承 rev4 button-auth-modal 之三支接線形、wire 鍵 roleId→rev5 id。
import { fetchGetAllButtons, fetchGetRoleButton, fetchUpdateRoleButton } from '@/service/api/rev5-role-admin';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
import { $t } from '@/locales';

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

type ButtonConfig = {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] id 欄復用為樹節點鍵＝按鈕碼（模板 key-field="id" 一行不動；research R9-4）；原行: id: number;
  id: string;
  label: string;
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] code 欄併入 id（同上）、位置改承 protected 鎖定旗標（NTree disabledField 預設 'disabled'＝naive-ui 2.44.1 es/tree/src/Tree.mjs treeSharedProps）；原行: code: string;
  disabled: boolean;
};

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 候選全集＋protected 鎖定＋就緒守（FR-004／FR-041；rev4 零藍本）
/** 按鈕碼候選全集（getAllButtons 原樣：治理域 buttons 聯集、去重、首見序） */
const codes = shallowRef<string[]>([]);

/**
 * 受保護授權之按鈕碼集（讀端 `protected: true` 項；後端單一真源）。鎖定雙保險：①tree 注入 `disabled: true`
 * （naive-ui 2.44.1 es/tree/src/Tree.mjs `handleCheck` 遇 `isNodeDisabled` 即 return、TreeNode.mjs 把 checkbox 渲染為
 * disabled ⇒ 視覺＋不可點、既勾保留）②受控 checked-keys 的 setter 強制補回（見 checks）；後端整批拒＝最終防線。
 */
const protectedCodes = shallowRef(new Set<string>());

/** NTree 實際持有的勾選集（只經下方 `checks` setter 寫入） */
const rawChecks = shallowRef<string[]>([]);

/**
 * getChecks 的請求世代序號（B-116）：角色 A 的現況讀還在飛行中、使用者關掉本 modal 改開角色 B 時，
 * B 讀失敗而 A 遲到成功 ⇒ A 的回應會寫進 protected 集與 checks 並開閘就緒守（確定鈕可按、內容卻是
 * A 的授權集），按下去等於把 A 的集合覆蓋到 B 身上。守法＝每輪 getChecks 起手遞增本序號，await 回來
 * 先比對，非最新一輪即整段丟棄（成功、失敗一律丟棄——就緒守毋須在此補救：新一輪起手已把 checksLoaded
 * 復位為 false、確定鈕維持停用）。
 * ★取序號而非 AbortController：包裝層（packages/axios flatRequest）對外只回 `{data, error}`、abort 通道
 * 鎖在內部 abortControllerMap（對外僅 cancelAllRequest 全域形），rev5-role-admin wrapper 亦不收 config 參
 * ⇒ 走 abort 得連 wrapper 簽名一起改；序號是最小改動、且三顆 modal 可逐字同形。
 */
let checksReq = 0;

/**
 * 現況讀就緒守（★user 拍板 2026-08-24、U9 品質審查升級）：全量替換語意下、`getRoleButton` 未成即按確定＝把空集
 * 當「期望全集」送出→該角色按鈕維授權整批被撤。守法＝確定鈕在現況讀成功前 `disabled`（見模板 footer）；
 * 讀失敗（攔截層已 toast）維持停用、使用者僅能取消重開。每次開啟（含切換角色）於 getChecks 起手復位。
 */
const checksLoaded = shallowRef(false);
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改 computed：候選（getAllButtons）與現況（getRoleButton）並發取回、先後不定，任一到位即重算（id=label=code、disabled＝protected 鎖定第一道；模板 :data="tree" 一行不動）；原行: const tree = shallowRef<ButtonConfig[]>([]);
const tree = computed<ButtonConfig[]>(() =>
  codes.value.map(code => ({ id: code, label: code, disabled: protectedCodes.value.has(code) }))
);

async function getAllButtons() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 假資料移除、改接 getAllButtons（回 string[]＝按鈕碼聯集，映成樹項見 tree）；原行: tree.value = [
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 1, label: 'button1', code: 'code1' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 2, label: 'button2', code: 'code2' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 3, label: 'button3', code: 'code3' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 4, label: 'button4', code: 'code4' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 5, label: 'button5', code: 'code5' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 6, label: 'button6', code: 'code6' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 7, label: 'button7', code: 'code7' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 8, label: 'button8', code: 'code8' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 9, label: 'button9', code: 'code9' },
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: { id: 10, label: 'button10', code: 'code10' }
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: ];
  const { error, data } = await fetchGetAllButtons();
  if (error) {
    return;
  }
  codes.value = data;
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 鍵型 number→string（按鈕碼）＋改可寫 computed＝受控 checked-keys 攔截點：模板 `v-model:checked-keys="checks"` 即 `:checked-keys`＋`@update:checked-keys`（一行不動），NTree 每次回報先過 setter、受保護碼一律補回（鎖定第二道——disabled 已讓 UI 點不動，此處兜住一切非點擊路徑，提交集恆含 protected 項＝契約 §4）；原行: const checks = shallowRef<number[]>([]);
const checks = computed<string[]>({
  get: () => rawChecks.value,
  set: keys => {
    const merged = new Set(keys);
    protectedCodes.value.forEach(code => merged.add(code));
    rawChecks.value = Array.from(merged);
  }
});

async function getChecks() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 getRoleButton（query 鍵 id；回 {code, protected}[]）；原行: console.log(props.roleId);
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死 1..5 移除、改讀現況（先落 protected 集、再經 setter 落勾選集；就緒守起手復位、成功才開閘）；原行: checks.value = [1, 2, 3, 4, 5];
  const req = ++checksReq;
  checksLoaded.value = false;
  const { error, data } = await fetchGetRoleButton(props.roleId);
  // 過期回應一律丟棄（成功、失敗皆然；理由與就緒守的關係見 checksReq）
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

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 提交改 async 接真；原行: function handleSubmit() {
async function handleSubmit() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 updateRoleButton（body {id, buttons}＝期望全集、含 protected 項；回 GrantResult 本體不消費、只看 error；拒因 toast 由攔截層）；原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleButton({ id: props.roleId, buttons: checks.value });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllButtons();
  getChecks();
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 掛載即 init() 改於 modal 開啟時重取（roleId 隨編輯角色而變、初掛後切換角色會讀到舊 checks；鏡像 menu-auth-modal 的 watch(visible) 形——research R2#19）；原行: init();
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
        <!--
          就緒守：現況讀成功前停用確定鈕（送空集＝整批撤，見 checksLoaded doc；user 拍板 2026-08-24）。
          ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
          [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: <NButton type="primary" size="small" class="mt-16px" @click="handleSubmit">
        -->
        <NButton type="primary" size="small" class="mt-16px" :disabled="!checksLoaded" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
