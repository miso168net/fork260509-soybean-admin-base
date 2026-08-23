<script setup lang="ts">
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance] 端點維授權 modal（新增檔；基線 example 無此路徑、零原行；
// 憲法 §III.2 (iii) 列明文「endpoint-auth-modal 為 rev5 新增型新檔、檔頭標記、不入名冊」）。嚴格鏡像 menu／button 兩顆
// auth modal 版式（NModal preset=card w-480px、NTree h-280px、footer 兩鈕）。
// 內容＝候選全集（getAllEndpoints、路由註冊表受政策管制端點）依 path 群組建樹、現況（getRoleEndpoints）預勾＋protected
// 鎖定、提交（updateRoleEndpoints）全量替換（期望全集＝勾選葉鍵經 leafMap 還原之 Endpoint[]）。
// ★群組勾選＝顯式 `cascade`＋`check-strategy="child"`（依據見 template 前註解；rev4 只寫 check-strategy＝結構性 inert、
// research R2#18 差異點）。★拒因（protectedRevoke／protectedGrant／notFound）一律由 service/request 共用攔截層轉譯
// `backend.biz.role.*` 後 toast，頁內零拒因專屬 UI（FR-042；rev4 之 protected-revoke-detail 明細通道不帶回）。
// rev4: 高度參照 rev4 之 views/manage/role/modules/endpoint-auth-modal.vue（leafKey／leafMap／群組建樹形）；rev4 wire
// 鍵 roleId、型住 Api.SystemManage、讀端無 protected 旗標＝差異點不帶回（modal prop 名仍沿基線 roleId）。
import { computed, shallowRef, watch } from 'vue';
import type { TreeOption } from 'naive-ui';
// WRAPPER fetcher：★直接路徑、不經 barrel（沿 rev5-role-admin 既有消費端先例）
import { fetchGetAllEndpoints, fetchGetRoleEndpoints, fetchUpdateRoleEndpoints } from '@/service/api/rev5-role-admin';
import { $t } from '@/locales';

defineOptions({
  name: 'EndpointAuthModal'
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

const title = computed(() => $t('common.edit') + $t('page.manage.role.endpointAuth'));

/**
 * 葉鍵＝`${path}|${method}`（path × method 對唯一 ⇒ 葉鍵唯一）；群組鍵＝純 path。
 * 葉鍵恆含 `|` 片段、群組鍵為註冊表路徑（不含 `|`）⇒ 兩者結構上不碰撞（FR-040「葉鍵以路徑與方法合成、群組鍵＝純路徑」）。
 */
function leafKey(path: string, method: string) {
  return `${path}|${method}`;
}

/** 候選全集（getAllEndpoints 原樣、照註冊序） */
const endpoints = shallowRef<Api.RoleAdmin.Endpoint[]>([]);

/**
 * 葉鍵 → Endpoint 反查表：handleSubmit 由勾選葉鍵經查表精確還原 Endpoint[]（★不 split `|`——查表比拆字串穩，
 * 路徑字面日後含分隔符也不誤拆；FR-040「反查由映射表還原不拆字串」）。
 */
const leafMap = shallowRef(new Map<string, Api.RoleAdmin.Endpoint>());

async function getAllEndpoints() {
  const { error, data } = await fetchGetAllEndpoints();
  if (error) {
    return;
  }
  const map = new Map<string, Api.RoleAdmin.Endpoint>();
  data.forEach(ep => {
    map.set(leafKey(ep.path, ep.method), ep);
  });
  endpoints.value = data;
  leafMap.value = map;
}

/**
 * 受保護授權之葉鍵集（讀端 `protected: true` 項；FR-004 後端單一真源、FR-041 前端預標鎖定）。
 * 鎖定雙保險：①注入 TreeOption `disabled: true`（見 tree）②受控 checked-keys 的 setter 強制補回（見 checks）；
 * 後端撤銷集觸及 protected 整批拒＝最終防線。
 */
const protectedKeys = shallowRef(new Set<string>());

/**
 * 依 path 群組建樹（群組 label＝path、葉 label＝method、葉 key＝leafKey；群組 key＝path）。
 * 取 computed：候選（getAllEndpoints）與現況（getRoleEndpoints）並發取回、先後不定，兩者任一到位即重算、
 * 不依賴回應抵達次序。葉 `disabled`＝protected 鎖定第一道（naive-ui 2.44.1 es/tree/src/Tree.mjs `handleCheck`
 * 遇 `isNodeDisabled` 即 return、TreeNode.mjs 把 checkbox 渲染為 disabled；treemate 0.3.11 es/check.js
 * `getExtendedCheckedKeySet` 走訪遇 disabled 節點即 STOP ⇒ 群組級勾／取消皆不波及受保護葉）。
 */
const tree = computed<TreeOption[]>(() => {
  const groups = new Map<string, TreeOption>();
  endpoints.value.forEach(ep => {
    let group = groups.get(ep.path);
    if (!group) {
      group = { key: ep.path, label: ep.path, children: [] };
      groups.set(ep.path, group);
    }
    const key = leafKey(ep.path, ep.method);
    (group.children as TreeOption[]).push({ key, label: ep.method, disabled: protectedKeys.value.has(key) });
  });
  return Array.from(groups.values());
});

/** NTree 實際持有的勾選葉鍵集（只經下方 `checks` setter 寫入；check-strategy="child" ⇒ NTree 回報值只含葉鍵、群組鍵不入） */
const rawChecks = shallowRef<string[]>([]);

/**
 * 受控 checked-keys 攔截點（鎖定第二道）＝可寫 computed：模板 `v-model:checked-keys="checks"` 即 `:checked-keys`＋
 * `@update:checked-keys`，NTree 每次回報先過 setter、受保護葉鍵一律補回——disabled 已讓 UI 點不動，此處兜住一切
 * 非點擊路徑，提交集恆含 protected 項（契約 §6「含 protected 項須原樣帶回」）。形與 menu／button 兩顆 modal 一致。
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
 * 現況讀就緒守（★user 拍板 2026-08-24、U9 品質審查升級）：全量替換語意下、`getRoleEndpoints` 未成即按確定＝
 * 把空集當「期望全集」送出→該角色端點維授權整批被撤（與 handleSubmit 內的候選就緒守互補：彼守 leafMap、
 * 此守現況）。守法＝確定鈕在現況讀成功前 `disabled`（見模板 footer）；讀失敗（攔截層已 toast）維持停用、
 * 使用者僅能取消重開。每次開啟（含切換角色）於 getChecks 起手復位。
 */
const checksLoaded = shallowRef(false);

async function getChecks() {
  checksLoaded.value = false;
  const { error, data } = await fetchGetRoleEndpoints(props.roleId);
  if (error) {
    return;
  }
  // 先落 protected 集、再經 setter 落勾選集
  protectedKeys.value = new Set(data.filter(item => item.protected).map(item => leafKey(item.path, item.method)));
  checks.value = data.map(item => leafKey(item.path, item.method));
  checksLoaded.value = true;
}

async function handleSubmit() {
  // 候選就緒守：leafMap 由 getAllEndpoints 單獨填充，該讀失敗時（packages/axios flatRequest 捕例外後回
  // `{ data: null, error }`、不 throw ⇒ 上方 `if (error) return;` 是活路徑）leafMap 恆空，而 getChecks 為另一支
  // 獨立請求、成功時 checks 已落該角色現況全部葉鍵 ⇒ 下方查表全 miss 經 filter 濾光、送出 endpoints: [] ＝
  // 全量替換為空集＝該角色端點維授權整批被撤。故候選未就緒即不提交（候選讀失敗之錯誤 toast 已由共用攔截層
  // 於當次請求發出；此處沿同檔 `if (error) return;` 紀律靜默早退、modal 不關）。
  // ★menu／button 兩顆 modal 直接回送讀端原集（menuIds／buttons ＝ checks.value），候選讀失敗只讓樹空、
  // 不影響提交內容；本檔多一層 leafMap 還原，故多這一道守——三檔提交機制在此對齊。
  // ★候選集真的為空時亦早退：後端全量替換射程＝候選集（ADR 0056），射程為空時提交本就零效果、擋下無損。
  if (leafMap.value.size === 0) {
    return;
  }

  // 勾選葉鍵 → 查表還原 Endpoint[]（期望全集）。查無者＝現況含候選集外之歷史端點（讀端回全部現役列、候選集＝
  // 註冊表 Policy 全集；兩者可不等）——靜默略過：後端全量替換射程＝候選集、候選外現役列本就不撤不授（ADR 0056）。
  const endpointList = checks.value
    .map(key => leafMap.value.get(key))
    .filter((ep): ep is Api.RoleAdmin.Endpoint => Boolean(ep));
  const { error } = await fetchUpdateRoleEndpoints({ id: props.roleId, endpoints: endpointList });
  if (error) {
    return;
  }

  window.$message?.success?.($t('common.modifySuccess'));

  closeModal();
}

function init() {
  getAllEndpoints();
  getChecks();
}

// 於 modal 開啟時重取（roleId 隨編輯角色而變；鏡像 menu-auth-modal 的 watch(visible) 形）
watch(visible, val => {
  if (val) {
    init();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-480px">
    <!--
      ★cascade 必須顯式寫出（naive-ui 2.44.1 es/tree/src/Tree.mjs `cascade: Boolean` 預設 false；treemate 0.3.11
      es/check.js `getCheckedKeys` 首段 `if (!cascade)` 早退＝純 merge／minus、check-strategy 完全不生效、indeterminate
      恆不現）——rev4 只寫 check-strategy="child" 未寫 cascade＝群組點擊對 payload 零貢獻（research R2#18、R9-1）。
      cascade＋check-strategy="child" ⇒ 勾群組＝勾其全部未鎖葉、回報值只含葉鍵（check.js 子策略分支把 level-0 群組鍵自
      checkedKeys 移除）；disabled 葉不入父聚合（同檔 `if (childNode.disabled) continue`）。
      v-model:checked-keys 綁到可寫 computed（setter＝protected 補回攔截點、見 script）。
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
        <!-- 就緒守：現況讀成功前停用確定鈕（送空集＝整批撤，見 checksLoaded doc；user 拍板 2026-08-24） -->
        <NButton type="primary" size="small" class="mt-16px" :disabled="!checksLoaded" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
