<!-- [rev6-inline MANAGE-ROLE-AUTH-VIEW+ 006-authz-governance] 端點權限彈窗（新增檔；上游基線無此路徑）——由角色抽屜第三鈕開啟，以路徑分組的勾選樹讀寫角色的端點維授權 -->
<script setup lang="ts">
// 版式與守衛和同目錄另兩顆授權彈窗（menu-auth-modal／button-auth-modal）同形：卡片式彈窗、固定高度的樹、頁尾取消與確定兩鈕；
// 受保護鎖定兩道、現況讀的請求世代序號、就緒守、每次開啟先清角色維狀態（FR-034）。候選＝端點全集讀端、現況＝端點維現況讀端、
// 送出＝端點維全量寫（FR-033；授權契約 §5／§6／§8），三支皆取自 006 刀 wrapper `rev6-authz.ts`（該檔不入 barrel、以直接路徑匯入）。
// 寫端拒因（`biz.role.protectedRevoke`／`biz.role.protectedGrant`／`biz.role.notFound`）由共用攔截層轉譯出 toast，本檔只判 `error` 有無、
// 不設專屬提示。
// 出處：`rev5:src/views/manage/role/modules/endpoint-auth-modal.vue`（路徑分組建樹、葉鍵反查表、顯式 cascade、確定鈕的候選就緒守）。
// rev6 差異：型與 wrapper 改取 `Api.Authz`／`rev6-authz`；葉鍵改為方法字面起首（理由見 `leafKey`）；反查表由候選以 computed 導出、
// 不另存一份；每次開啟清狀態的兩行擺在 `init()`（另兩顆同此位置）。
import { computed, shallowRef, watch } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetAllEndpoints, fetchGetRoleEndpoints, fetchUpdateRoleEndpoints } from '@/service/api/rev6-authz';
import { $t } from '@/locales';

defineOptions({
  name: 'EndpointAuthModal'
});

interface Props {
  /** 標的角色 id（角色抽屜傳入） */
  roleId: number;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

function closeModal() {
  visible.value = false;
}

const title = computed(() => $t('common.edit') + $t('page.manage.role.endpointAuth'));

/**
 * 葉鍵＝方法字面＋一個空白＋路徑（形如 `GET /systemManage/getRoleMenu`）；群組鍵＝純路徑。兩者不相撞：群組鍵是請求路徑、恆以 `/`
 * 起首（HTTP 請求路徑的定義，後端路由框架註冊時亦強制），葉鍵恆以方法字面起首。葉與葉之間也一對一：方法字面依 HTTP 定義不含空白，
 * 首個空白之前必是方法、之後必是路徑，不同的（路徑, 方法）對合不出同一個鍵。送出時不從葉鍵拆回兩段（路徑可含任何字元），
 * 一律經 `leafMap` 查表還原。
 */
function leafKey(path: string, method: string) {
  return `${method} ${path}`;
}

/** 端點候選：候選讀端原樣（受政策管制的端點全集、照路由註冊序）；每次開啟重取、讀成功才覆蓋 */
const endpoints = shallowRef<Api.Authz.Endpoint[]>([]);

/** 葉鍵 → 端點的反查表；與候選同源導出，兩者不會不同步 */
const leafMap = computed(
  () => new Map(endpoints.value.map(endpoint => [leafKey(endpoint.path, endpoint.method), endpoint] as const))
);

/**
 * 受保護端點的葉鍵集：取自現況讀端各項的 `protected: true`（判準只在後端、前端不另推）。授予側不預標——候選讀端不帶受保護旗標，
 * 鎖定只落在該角色已持有的受保護授權上。鎖定分兩道：其一，`tree` 為這些葉帶上 `disabled`；其二，受控勾選集 `checks` 的 setter
 * 每次寫入都把本集補回。後端對撤銷受保護項整批拒，是最後一道。
 */
const protectedKeys = shallowRef(new Set<string>());

/**
 * 交給 NTree 的樹：候選依路徑分組，群組節點＝路徑（不帶方法）、其下各葉＝該路徑的各方法。受保護葉帶 `disabled`＝鎖定第一道——
 * naive-ui 2.44.1 的樹在勾選處理（`es/tree/src/Tree.mjs` 之 `handleCheck`）遇停用節點即返回、勾選框也畫成停用，故點不動、已勾者保留。
 * 候選與現況兩支讀並行、到達先後不定，任一支落地都會重算。
 */
const tree = computed<TreeOption[]>(() => {
  const groups = new Map<string, TreeOption[]>();
  endpoints.value.forEach(endpoint => {
    const key = leafKey(endpoint.path, endpoint.method);
    const leaf: TreeOption = { key, label: endpoint.method, disabled: protectedKeys.value.has(key) };
    const leaves = groups.get(endpoint.path);
    if (leaves) {
      leaves.push(leaf);
    } else {
      groups.set(endpoint.path, [leaf]);
    }
  });
  return Array.from(groups, ([path, children]) => ({ key: path, label: path, children }));
});

/** NTree 實際持有的勾選葉鍵集；只經下方 `checks` 的 setter 寫入 */
const rawChecks = shallowRef<string[]>([]);

/**
 * 受控勾選集（可寫 computed）：模板的勾選雙向綁定接到這裡，NTree 每次回報都先經 setter、受保護葉鍵一律補回（鎖定第二道，
 * 兜住點擊以外的寫入路徑），送出的期望全集因而恆含受保護項（授權契約：受保護項須原樣帶回）。
 */
const checks = computed<string[]>({
  get: () => rawChecks.value,
  set: keys => {
    const merged = new Set(keys);
    protectedKeys.value.forEach(key => merged.add(key));
    rawChecks.value = Array.from(merged);
  }
});

/**
 * 現況讀的請求世代序號（rev5:B-116）。失效情境：角色甲的現況讀未回、管理員關窗改開角色乙，乙的讀失敗而甲的回應遲到成功——
 * 照單全收的話，甲的授權集會落進勾選集與受保護集並解開就緒守，按下確定即把甲的端點集合全量寫到乙身上。守法：每輪現況讀起手遞增
 * 本序號、回應到時先比對，不是最新一輪就整段丟棄（成功或失敗皆丟；就緒守不必在此另補，新一輪起手已把它復位、確定鈕維持停用）。
 * 用序號而不用 AbortController：請求層（`packages/axios`）為每筆請求自建的中止控制器收在內部對照表、對外只有全域
 * `cancelAllRequest`；呼叫端自帶 `signal` 雖可行，但本檔所用的 wrapper 都只收業務參數、不收請求設定，走中止就得連 wrapper
 * 簽名一起改，序號則只動本檔。
 */
let checksReq = 0;

/**
 * 就緒守：端點維寫端是全量替換，現況讀還沒成功就送出＝把空集當成期望全集，該角色候選內的端點維授權會整批被撤。故確定鈕在現況讀
 * 成功前停用（見模板確定鈕的 `:disabled`）；讀失敗（攔截層已出 toast）維持停用、只能取消後重開；每次開啟（含換角色）都在
 * 現況讀起手復位。
 */
const checksLoaded = shallowRef(false);

async function getAllEndpoints() {
  const { error, data } = await fetchGetAllEndpoints();
  if (error) {
    return;
  }
  endpoints.value = data;
}

async function getChecks() {
  const req = ++checksReq;
  checksLoaded.value = false;
  const { error, data } = await fetchGetRoleEndpoints(props.roleId);
  // 非最新一輪的回應整段丟棄（成功、失敗同樣；與就緒守的關係見 `checksReq`）
  if (req !== checksReq) {
    return;
  }
  if (error) {
    return;
  }
  // 先落受保護集、再經 setter 落勾選集
  protectedKeys.value = new Set(data.filter(item => item.protected).map(item => leafKey(item.path, item.method)));
  checks.value = data.map(item => leafKey(item.path, item.method));
  checksLoaded.value = true;
}

async function handleSubmit() {
  // 候選就緒守：期望全集要經 `leafMap` 由勾選葉鍵查回端點，而候選讀與現況讀是兩支獨立請求。候選讀失敗時請求層不拋例外、
  // 回 `{ data: null, error }`，反查表維持空；現況讀若成功，勾選集已落該角色現況、查表卻全數落空，送出的就是空集＝該角色候選內的
  // 端點維授權整批被撤。故反查表為空即不送、彈窗不關（候選讀失敗的提示已由攔截層發出）。候選集本身為空時寫端射程亦空、送出不改
  // 任何授權（只多一列稽核與一次判定面同步），一併擋下無損。另兩顆彈窗直接送勾選集、不經反查，沒有這一道。
  if (leafMap.value.size === 0) {
    return;
  }

  // 勾選葉鍵查回端點＝期望全集（受保護葉鍵經 setter 恆在其中）。查不到的鍵略過：現況讀端只回候選範圍內的授權，而候選讀端與寫端
  // 射程同一真源（授權契約 §8），正常不會查不到。回應本體不取用、只判 `error`。
  const expected = checks.value
    .map(key => leafMap.value.get(key))
    .filter((endpoint): endpoint is Api.Authz.Endpoint => Boolean(endpoint));
  const { error } = await fetchUpdateRoleEndpoints({ id: props.roleId, endpoints: expected });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllEndpoints();
  // 每次開啟先清掉上一角色的勾選與鎖定、再發現況讀（rev5:B-129）：本元件連續編輯不同角色時不重掛（見檔尾），不清的話本輪回應
  // 落地前仍顯示上一角色的狀態（確定鈕已被就緒守停用＝純視覺誤導、不致寫錯）。候選與角色無關、不清，由上一行重取、成功才覆蓋。
  // ★兩行次序不可對調：先清受保護集、再經 setter 落空集——對調後 setter 會把舊的受保護葉鍵補回去，等於沒清。
  protectedKeys.value = new Set();
  checks.value = [];
  getChecks();
}

// 每次開啟彈窗時取數而不在掛載時取：角色抽屜以 `display-directive="show"` 常駐、本元件掛在其編輯態區塊內，連續編輯不同角色時不重掛
watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <!--
      `cascade` 須明寫：naive-ui 2.44.1 的樹 `cascade` 預設 false，而勾選計算（treemate 0.3.11 `es/check.js` 之 `getCheckedKeys`）
      未開 cascade 時首段即以單純併入／移除返回、`check-strategy` 根本讀不到——只寫 `check-strategy="child"` 形同沒寫，勾群組只把群組鍵
      本身併入、其下各葉不動，送出時群組鍵查表落空、對期望全集零貢獻。開了 cascade：勾群組＝勾其下全部未鎖葉；`check-strategy="child"`
      使回報值只含葉鍵（第 0 層的群組鍵自回報集移除）；受保護葉不參與群組的全勾判定，群組級的勾與取消也波及不到它（同檔走訪遇停用
      節點即止）。勾選雙向綁定接 `checks`（可寫 computed，見 script）。
    -->
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      checkable
      cascade
      check-strategy="child"
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
        <!-- 就緒守：現況讀成功前停用確定鈕（見 `checksLoaded`） -->
        <NButton type="primary" size="small" class="mt-16px" :disabled="!checksLoaded" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
