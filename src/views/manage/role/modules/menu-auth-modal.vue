<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] TreeOption 型（protected 鎖定注入 disabled 之樹節點型）
import type { TreeOption } from 'naive-ui';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
import { fetchGetAllPages, fetchGetMenuTree } from '@/service/api';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 選單維授權讀寫＋roleHome 讀寫 WRAPPER
// （★直接路徑、不經 barrel——沿 role-operate-drawer 之 rev5-role-admin 消費先例）；fetchGetAllPages／fetchGetMenuTree
// 續走上一行 barrel、一行不動（research R9-4）。拒因 protectedRevoke／notFound 由共用攔截層 toast、頁內零專屬 UI（FR-042；
// rev4 之 protected-revoke-detail 明細通道不帶回）。rev4: 承 rev4 menu-auth-modal 之四支接線形、wire 鍵 roleId→rev5 id。
import {
  fetchGetRoleHome,
  fetchGetRoleMenu,
  fetchUpdateRoleHome,
  fetchUpdateRoleMenu
} from '@/service/api/rev5-role-admin';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
import { $t } from '@/locales';

defineOptions({
  name: 'MenuAuthModal'
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

const title = computed(() => $t('common.edit') + $t('page.manage.role.menuAuth'));

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] roleHome 誠實 null（005 契約 §7 `{home: string|null}`、未設即 null、不摺疊空字串；rev4 裸 string／'' 初值＝R2#9 不帶回）；原行: const home = shallowRef('');
const home = shallowRef<string | null>(null);

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin START] getHome 的請求世代序號（B-129②）：`home` 與勾選集同為角色維狀態，
// 卻不在 B-116 的射程內（該條文逐字只寫 getChecks）——角色 A 的首頁讀還在飛行中、使用者關掉本 modal
// 改開角色 B 時，A 的遲到回應會覆蓋 B 的值，畫面自此顯示錯的角色首頁。危害低於勾選集（updateHome 只在
// 使用者顯式改選時才寫、且恆帶當下 props.roleId，不會靜默寫錯角色），但顯示面誤導同樣真實。
// 守法逐字比照 checksReq：起手遞增本序號、await 回來先比對，非最新一輪即整段丟棄（成功、失敗一律丟棄）。
let homeReq = 0;
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin END]

async function getHome() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 getRoleHome（query 鍵 id）；原行: console.log(props.roleId);
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 假值移除、改讀回應 `{home}`；原行: home.value = 'home';
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin] 世代守起手（見 homeReq）
  const req = ++homeReq;
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin START] B-129① 的同型缺口補在 home 欄（本刀 U6 碼品質輪補）：
  // 世代守擋的是「A 的遲到回應覆蓋 B 的值」，擋不到「B 的回應還沒到、畫面沿用 A 的值」——兩者是不同的失效路徑，
  // 補了前者不會使後者消失。`home` 是模組級 shallowRef、modal 不卸載 ⇒ 換角色開 modal 時須起手復位，形逐字比照
  // 同檔 getChecks 起手清上一角色的顯示狀態。★首頁 NSelect 沒有對應的就緒指示（不像確定鈕有 checksLoaded），
  // 值看起來已載好、管理員更容易直接採信；下方 error 分支沿用上一角色值的同型問題亦由本行一併收掉。
  home.value = null;
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin END]
  const { error, data } = await fetchGetRoleHome(props.roleId);
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin START] 過期回應一律丟棄（成功、失敗皆然）
  if (req !== homeReq) {
    return;
  }
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin END]
  if (error) {
    return;
  }
  home.value = data.home;
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] NSelect clearable 清空即送 null（三形同義清空、契約 §8）；原行: async function updateHome(val: string) {
async function updateHome(val: string | null) {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 updateRoleHome（body {id, home}；成功才落 home=val、失敗不改本地）
  const { error } = await fetchUpdateRoleHome({ id: props.roleId, home: val });
  if (error) {
    return;
  }

  home.value = val;
}

const pages = shallowRef<string[]>([]);

async function getPages() {
  const { error, data } = await fetchGetAllPages();

  if (!error) {
    pages.value = data;
  }
}

const pageSelectOptions = computed(() => {
  const opts: CommonType.Option[] = pages.value.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原樹改名 menuTree 承載 getMenuTree 原樣、`tree` 讓位給下方注入 disabled 的 computed（模板 :data="tree" 一行不動）；原行: const tree = shallowRef<Api.SystemManage.MenuTree[]>([]);
const menuTree = shallowRef<Api.SystemManage.MenuTree[]>([]);

async function getTree() {
  const { error, data } = await fetchGetMenuTree();

  if (!error) {
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 落原樹（見上）；原行: tree.value = data;
    menuTree.value = data;
  }
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] protected 鎖定＋就緒守（FR-004／FR-041；rev4 零藍本）
/**
 * 受保護授權之選單 id 集（讀端 `protected: true` 項；後端單一真源）。鎖定雙保險：①tree 注入 TreeOption
 * `disabled: true`（naive-ui 2.44.1 es/tree/src/Tree.mjs `handleCheck` 遇 `isNodeDisabled` 即 return、TreeNode.mjs 把
 * checkbox 渲染為 disabled ⇒ 視覺＋不可點、既勾保留）②受控 checked-keys 的 setter 強制補回（見 checks）；
 * 後端撤銷集觸及 protected 整批拒＝最終防線。
 */
const protectedIds = shallowRef(new Set<number>());

/**
 * 對 getMenuTree 回來的樹遞迴注入 `disabled`（TreeOption 形；wire 四欄不動、僅前端加旗標）。
 * 已知態：受保護**目錄**節點的整行點擊（expand-on-click）同受 disabled 攔（TreeNode.mjs `handleNodeClick`
 * 之 `!disabledRef` 守）、展開箭頭（switcher onClick 直掛 `handleSwitcherClick`、不經該守）仍可用——子選單仍可達。
 */
function lockTree(nodes: Api.SystemManage.MenuTree[]): TreeOption[] {
  return nodes.map(node => ({
    ...node,
    disabled: protectedIds.value.has(node.id),
    children: node.children ? lockTree(node.children) : undefined
  }));
}

/** 餵給 NTree 的樹＝原樹＋protected 鎖定（computed：樹與現況並發取回、先後不定，任一到位即重算） */
const tree = computed(() => lockTree(menuTree.value));

/** NTree 實際持有的勾選集（只經下方 `checks` setter 寫入） */
const rawChecks = shallowRef<number[]>([]);

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
 * 現況讀就緒守（★user 拍板 2026-08-24、U9 品質審查升級）：全量替換語意下、`getRoleMenu` 未成即按確定＝把空集
 * 當「期望全集」送出→該角色選單維授權整批被撤。守法＝確定鈕在現況讀成功前 `disabled`（見模板 footer）；
 * 讀失敗（攔截層已 toast）維持停用、使用者僅能取消重開。每次開啟（含切換角色）於 getChecks 起手復位。
 */
const checksLoaded = shallowRef(false);
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改可寫 computed＝受控 checked-keys 攔截點：模板 `v-model:checked-keys="checks"` 即 `:checked-keys`＋`@update:checked-keys`（一行不動），NTree 每次回報先過 setter、受保護 id 一律補回（鎖定第二道——disabled 已讓 UI 點不動，此處兜住一切非點擊路徑，提交集恆含 protected 項＝契約 §2「含 protected 項須原樣帶回」）；★不加 cascade（沿基線／rev4 形＝CDP 基準、research R9-1），setter 只做補回、無父子連動語意；原行: const checks = shallowRef<number[]>([]);
const checks = computed<number[]>({
  get: () => rawChecks.value,
  set: keys => {
    const merged = new Set(keys);
    protectedIds.value.forEach(id => merged.add(id));
    rawChecks.value = Array.from(merged);
  }
});

async function getChecks() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 getRoleMenu（query 鍵 id；回 {id, protected}[]）；原行: console.log(props.roleId);
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死 1..21 移除、改讀現況（先落 protected 集、再經 setter 落勾選集；就緒守起手復位、成功才開閘）；原行: checks.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const req = ++checksReq;
  checksLoaded.value = false;
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin START] B-129①：起手清上一角色的顯示狀態——舊形只復位就緒守，
  // 換角色開 modal 時在自身回應落地前仍顯示上一角色的勾選集與鎖定狀態（確定鈕已由就緒守停用 ⇒ 純視覺誤導、
  // 無資料風險）。★兩行次序不可反：先清 protected 集、再經 checks setter 落空集——反過來時 setter 會把
  // 舊的 protected id 原樣補回，清了等於沒清。
  protectedIds.value = new Set();
  checks.value = [];
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 007-user-password-admin END]
  const { error, data } = await fetchGetRoleMenu(props.roleId);
  // 過期回應一律丟棄（成功、失敗皆然；理由與就緒守的關係見 checksReq）
  if (req !== checksReq) {
    return;
  }
  if (error) {
    return;
  }
  protectedIds.value = new Set(data.filter(item => item.protected).map(item => item.id));
  checks.value = data.map(item => item.id);
  checksLoaded.value = true;
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 提交改 async 接真；原行: function handleSubmit() {
async function handleSubmit() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 updateRoleMenu（body {id, menuIds}＝期望全集、含 protected 項；回 GrantResult 本體不消費、只看 error；拒因 toast 由攔截層）；原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleMenu({ id: props.roleId, menuIds: checks.value });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getHome();
  getPages();
  getTree();
  getChecks();
}

watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <div class="flex-y-center gap-16px pb-12px">
      <div>{{ $t('page.manage.menu.home') }}</div>
      <!--
        加 clearable：首頁可清空（清空即 updateHome(null)＝契約 §8 三形同義清空；005 既判、rev4 不可清空＝R2#9 不帶回）。
        ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
        [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原行: <NSelect :value="home" :options="pageSelectOptions" size="small" class="w-160px" @update:value="updateHome" />
      -->
      <NSelect
        :value="home"
        :options="pageSelectOptions"
        size="small"
        class="w-160px"
        clearable
        @update:value="updateHome"
      />
    </div>
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      key-field="id"
      checkable
      expand-on-click
      virtual-scroll
      block-line
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
