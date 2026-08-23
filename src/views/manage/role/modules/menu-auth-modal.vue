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

async function getHome() {
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 接真 getRoleHome（query 鍵 id）；原行: console.log(props.roleId);
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 假值移除、改讀回應 `{home}`；原行: home.value = 'home';
  const { error, data } = await fetchGetRoleHome(props.roleId);
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

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] protected 鎖定（FR-004／FR-041；rev4 零藍本）
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
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii) 006-authz-governance] 寫死 1..21 移除、改讀現況（先落 protected 集、再經 setter 落勾選集）；原行: checks.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const { error, data } = await fetchGetRoleMenu(props.roleId);
  if (error) {
    return;
  }
  protectedIds.value = new Set(data.filter(item => item.protected).map(item => item.id));
  checks.value = data.map(item => item.id);
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
        <NButton type="primary" size="small" class="mt-16px" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
