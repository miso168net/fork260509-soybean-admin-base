<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 樹節點型：受保護項注入 `disabled` 後交給 NTree 的節點形
import type { TreeOption } from 'naive-ui';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
import { fetchGetAllPages, fetchGetMenuTree } from '@/service/api';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 選單維授權讀寫（006 刀 wrapper）與首頁讀寫（005 刀 wrapper）
// 皆以直接路徑匯入、不經 barrel；樹與頁面清單照走上一行 barrel、該行原樣保留（research R14 棄案＝改匯入同名 fetcher 多一處修改型）。
// 寫端拒因（`biz.role.protectedRevoke`／`biz.role.notFound`）由共用攔截層轉譯出 toast，本檔只判 `error` 有無、不設專屬提示。
import { fetchGetRoleMenu, fetchUpdateRoleMenu } from '@/service/api/rev6-authz';
import { fetchGetRoleHome, fetchUpdateRoleHome } from '@/service/api/rev6-role-admin';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
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

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 受保護鎖定、請求世代與就緒守（FR-034；rev5:B-116）
// 擺位：放在 `getTree` 與 `checks` 宣告之間時，前後兩處修改型只隔收尾大括號與空行、隔不開，本塊會與之併成同一變更塊，拔掉圈界
// fork-delta-lint 也不報；故提到未改的 `visible` 宣告與 `closeModal` 之間。塊內各宣告皆先於其使用處；`tree` 要讀 `menuTree`，
// 留在該宣告處、由其修改型標記承載。
/**
 * 受保護選單 id 集：取自現況讀端各項的 `protected: true`（後端為唯一判準、前端不另推）。鎖定分兩道——其一，`tree`（見 `menuTree`
 * 宣告處）經 `lockTree` 把這些節點注入 `disabled`：naive-ui 2.44.1 的樹在勾選處理（`es/tree/src/Tree.mjs` 之 `handleCheck`）遇停用
 * 節點即返回、勾選框也畫成停用，故點不動、已勾者保留；其二，受控勾選集 `checks` 的 setter 每次寫入都把本集補回。後端對撤銷受保護項
 * 整批拒，是最後一道。
 */
const protectedIds = shallowRef(new Set<number>());

/**
 * 逐層複製選單樹並注入 `disabled`（只加前端旗標，選單樹原有四欄照帶）。
 * 已知態：受保護的目錄節點，整行點擊（`expand-on-click`）同樣被停用擋下（`es/tree/src/TreeNode.mjs` 之 `handleNodeClick` 先判停用）；
 * 展開箭頭的點擊直接接到 `handleSwitcherClick`、不經那道判斷，所以其下子選單仍展得開、勾得到。
 */
function lockTree(nodes: Api.SystemManage.MenuTree[]): TreeOption[] {
  return nodes.map(node => ({
    ...node,
    disabled: protectedIds.value.has(node.id),
    children: node.children ? lockTree(node.children) : undefined
  }));
}

/** NTree 實際持有的勾選集；只經下方 `checks` 的 setter 寫入 */
const rawChecks = shallowRef<number[]>([]);

/**
 * 現況讀的請求世代序號（rev5:B-116）。情境：角色甲的現況讀尚未回來，管理員關窗改開角色乙；乙的讀失敗、甲的回應卻遲到成功——
 * 若照單全收，甲的授權集會落進勾選集與受保護集並解開就緒守，按下確定即把甲的集合全量寫到乙身上。守法：每輪現況讀起手遞增
 * 本序號、回來先比對，不是最新一輪就整段丟棄（成功或失敗皆丟；就緒守不必在此另補，新一輪起手已把它復位、確定鈕維持停用）。
 * 用序號而不用 AbortController：請求層（`packages/axios`）為每筆請求自建的中止控制器收在內部對照表、對外只有全域
 * `cancelAllRequest`；呼叫端自帶 `signal` 雖可行，但本檔所用的兩支 wrapper 都只收業務參數、不收請求設定，走中止就得連
 * wrapper 簽名一起改，序號則只動本檔，且三顆授權彈窗可同形套用。
 */
let checksReq = 0;

/**
 * 就緒守：選單維寫端是全量替換，現況讀還沒成功就送出＝把空集當成期望全集，該角色的選單維授權會整批被撤。故確定鈕在現況讀
 * 成功前停用（見模板確定鈕的 `:disabled`）；讀失敗（攔截層已出 toast）維持停用、只能取消後重開；每次開啟（含換角色）都在
 * 現況讀起手復位。
 */
const checksLoaded = shallowRef(false);
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

function closeModal() {
  visible.value = false;
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 首頁讀的請求世代序號（rev5:B-129）：首頁值與勾選集同屬
// 角色維狀態——角色甲的首頁讀遲到時會蓋掉角色乙的值，畫面自此顯示別的角色的首頁。首頁寫只在管理員改選時才發、且恆帶當下角色 id，
// 不會靜默寫錯角色，危害限於顯示誤導，但誤導本身即足以讓人照錯值操作。守法同 `checksReq`：起手遞增、回來先比對，
// 不是最新一輪就整段丟棄（成功或失敗皆丟）。擺位理由同上一塊：緊貼下方 `home` 宣告（修改型）會併入其變更塊，
// 隔著未改的 `title` 那行即自成純新增變更塊。
let homeReq = 0;
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

const title = computed(() => $t('common.edit') + $t('page.manage.role.menuAuth'));

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 首頁現值照讀端 `{home: string | null}` 誠實承載：未設即 null、不摺成空字串（FR-033）；原行: const home = shallowRef('');
const home = shallowRef<string | null>(null);

async function getHome() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改打首頁讀端（查詢鍵 `id`）；原行: console.log(props.roleId);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死值移除、改落讀端回應之 `home`（起手先取世代號、非最新一輪之回應丟棄）；原行: home.value = 'home';
  const req = ++homeReq;
  const { error, data } = await fetchGetRoleHome(props.roleId);
  // 非最新一輪的回應整段丟棄（成功、失敗同樣；見 `homeReq`）
  if (req !== homeReq) {
    return;
  }
  if (error) {
    return;
  }
  home.value = data.home;
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 下拉可清空、清空時收到 null 並照送（null 與空字串同義清空）；原行: async function updateHome(val: string) {
async function updateHome(val: string | null) {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 選值即寫首頁（與確定鈕各自獨立、取消不還原）；寫成功才落本地值、失敗時本地不動；原行: // request
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

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 原樹改名 `menuTree` 承載選單樹讀端原樣；`tree` 改由次行的 computed 重新定義＝原樹疊上受保護鎖定（見 `lockTree`），模板的樹資料繫結那行因而不動；原行: const tree = shallowRef<Api.SystemManage.MenuTree[]>([]);
const menuTree = shallowRef<Api.SystemManage.MenuTree[]>([]);
/** 交給 NTree 的樹；樹與現況兩支讀並行、到達先後不定，任一支落地都會重算 */
const tree = computed(() => lockTree(menuTree.value));

async function getTree() {
  const { error, data } = await fetchGetMenuTree();

  if (!error) {
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫入改名後的原樹（見 `menuTree`）；原行: tree.value = data;
    menuTree.value = data;
  }
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改為可寫 computed 充當受控勾選集：模板的勾選雙向綁定那行不動，NTree 每次回報都先經 setter、受保護 id 一律補回，送出的集合因而恆含受保護項（授權契約：受保護項須原樣帶回）；不設 `cascade`、setter 只補回不做父子連動（FR-033）；原行: const checks = shallowRef<number[]>([]);
const checks = computed<number[]>({
  get: () => rawChecks.value,
  set: keys => {
    const merged = new Set(keys);
    protectedIds.value.forEach(id => merged.add(id));
    rawChecks.value = Array.from(merged);
  }
});

async function getChecks() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改打選單維現況讀端（回 `{id, protected}[]`）；原行: console.log(props.roleId);
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死 id 移除、改落現況：先落受保護集再經 setter 落勾選集；就緒守起手復位、讀成功才放行；原行: checks.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const req = ++checksReq;
  checksLoaded.value = false;
  const { error, data } = await fetchGetRoleMenu(props.roleId);
  // 非最新一輪的回應整段丟棄（成功、失敗同樣；與就緒守的關係見 `checksReq`）
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

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 送出改 async 以等候寫端回應；原行: function handleSubmit() {
async function handleSubmit() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 改打選單維全量寫（body `{id, menuIds}`＝期望全集、受保護項經 setter 恆在其中）；回應本體不取用、只判 `error`；原行: console.log(checks.value, props.roleId);
  const { error } = await fetchUpdateRoleMenu({ id: props.roleId, menuIds: checks.value });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 每次開啟先把首頁值復位、再發首頁讀（rev5:B-129）：
  // 世代守只擋「舊回應蓋掉新值」，擋不到「新回應未到前畫面沿用舊值」，兩者是不同的失效路徑。本彈窗開關不卸載、首頁值跨次開啟存活，
  // 換角色開啟時須先清空；首頁下拉又不像確定鈕有就緒停用可提示，看來像已載好、更易被直接採信。讀失敗時沿用上一角色值的同型問題
  // 也由這一行一併消除。擺在此處而不在 `getHome` 起手：該函式本體的基線行全數被替換，塊放進去必與修改型同屬一個變更塊、
  // 拔掉圈界 fork-delta-lint 也不報；`getHome` 只由本函式呼叫，兩處的執行時序相同（同一同步段內、首頁讀發出之前）。
  home.value = null;
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
  getHome();
  getPages();
  getTree();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 每次開啟先清掉上一角色的勾選與鎖定、再發現況讀
  // （rev5:B-129）：本彈窗不卸載，不清的話換角色開啟時、本輪回應落地前仍顯示上一角色的狀態（確定鈕已被就緒守停用＝純視覺誤導、
  // 不致寫錯）。擺位理由同上一塊（`getChecks` 本體亦全數替換、且只由本函式呼叫）。
  // ★兩行次序不可對調：先清受保護集、再經 setter 落空集——對調後 setter 會把舊的受保護 id 補回去，等於沒清。
  protectedIds.value = new Set();
  checks.value = [];
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]
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
      <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 加 `clearable` 屬性：首頁可清空、清空即以 null 寫回（FR-033）；原行: <NSelect :value="home" :options="pageSelectOptions" size="small" class="w-160px" @update:value="updateHome" /> -->
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
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 加 `:disabled` 屬性＝就緒守：現況讀成功前停用確定鈕（見 `checksLoaded`）；原行: <NButton type="primary" size="small" class="mt-16px" @click="handleSubmit"> -->
        <NButton type="primary" size="small" class="mt-16px" :disabled="!checksLoaded" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
