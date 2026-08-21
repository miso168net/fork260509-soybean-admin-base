<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] ★fetchGetAllRoles 殘留不帶入（upstream 把角色下拉誤植於 menu modal、template 零消費欄——FR-045／R2-10）；父選擇器＋新增更新提交改消費 rev5 wrapper（直接路徑、不經 barrel——沿 rev5-role-admin 先例）；原行: import { fetchGetAllRoles } from '@/service/api';
import { fetchAddMenu, fetchGetMenuTree, fetchUpdateMenu } from '@/service/api/rev5-menu-admin';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { getLocalIcons } from '@/utils/icon';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import {
  getLayoutAndPage,
  getPathParamFromRoutePath,
  getRoutePathByRouteName,
  getRoutePathWithParam,
  transformLayoutAndPageToComponent
} from './shared';

defineOptions({
  name: 'MenuOperateModal'
});

export type OperateType = NaiveUI.TableOperateType | 'addChild';

interface Props {
  /** the type of operation */
  operateType: OperateType;
  /** the edit menu data or the parent menu data when adding a child menu */
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 型別切 rev5 獨立命名空間（接真 wire 形）；原行: rowData?: Api.SystemManage.Menu | null;
  rowData?: Api.MenuAdmin.MenuRecord | null;
  /** all pages */
  allPages: string[];
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
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.Menu,
  | 'menuType'
  | 'menuName'
  | 'routeName'
  | 'routePath'
  | 'component'
  | 'order'
  | 'i18nKey'
  | 'icon'
  | 'iconType'
  | 'status'
  | 'parentId'
  | 'keepAlive'
  | 'constant'
  | 'href'
  | 'hideInMenu'
  | 'activeMenu'
  | 'multiTab'
  | 'fixedIndexInTab'
> & {
  query: NonNullable<Api.SystemManage.Menu['query']>;
  buttons: NonNullable<Api.SystemManage.Menu['buttons']>;
  layout: string;
  page: string;
  pathParam: string;
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] menuMemo 表單欄（FR-043；B-003 語意：R_SUPER 備註；空字串承載「沒填」、後端 blank_to_none 來回等價）
  menuMemo: string;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    menuType: '1',
    menuName: '',
    routeName: '',
    routePath: '',
    pathParam: '',
    component: '',
    layout: '',
    page: '',
    i18nKey: null,
    icon: '',
    iconType: '1',
    parentId: 0,
    status: '1',
    keepAlive: false,
    constant: false,
    order: 0,
    href: null,
    hideInMenu: false,
    activeMenu: null,
    multiTab: false,
    fixedIndexInTab: null,
    query: [],
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] memo 欄預設值（FR-043）
    menuMemo: '',
    buttons: []
  };
}

type RuleKey = Extract<keyof Model, 'menuName' | 'status' | 'routeName' | 'routePath'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  menuName: defaultRequiredRule,
  status: defaultRequiredRule,
  routeName: defaultRequiredRule,
  routePath: defaultRequiredRule
};

const disabledMenuType = computed(() => props.operateType === 'edit');

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] edit 判定＋目標 id（submit 分流 add/update；rev4: 同形、沿 role-operate-drawer 範式）
const isEdit = computed(() => props.operateType === 'edit');
const menuId = computed(() => props.rowData?.id || -1);

const localIcons = getLocalIcons();
const localIconOptions = localIcons.map<SelectOption>(item => ({
  label: () => (
    <div class="flex-y-center gap-16px">
      <SvgIcon localIcon={item} class="text-icon" />
      <span>{item}</span>
    </div>
  ),
  value: item
}));

const showLayout = computed(() => model.value.parentId === 0);

const showPage = computed(() => model.value.menuType === '2');

const pageOptions = computed(() => {
  const allPages = [...props.allPages];

  if (model.value.routeName && !allPages.includes(model.value.routeName)) {
    allPages.unshift(model.value.routeName);
  }

  const opts: CommonType.Option[] = allPages.map(page => ({
    label: page,
    value: page
  }));

  return opts;
});

const layoutOptions: CommonType.Option[] = [
  {
    label: 'base',
    value: 'base'
  },
  {
    label: 'blank',
    value: 'blank'
  }
];

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] ★整段移除 upstream 角色下拉殘留（roleOptions／getRoleOptions——template 零消費欄；FR-045／R2-10）、換父選擇器選項源＝rev5 getMenuTree（治理域輕量樹；watch(visible) 開啟重取）。逐行原行標記如下：
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const roleOptions = ref<CommonType.Option<string>[]>([]);
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: async function getRoleOptions() {
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const { error, data } = await fetchGetAllRoles();
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const options = data.map(item => ({
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: label: item.roleName,
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: value: item.roleCode
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: roleOptions.value = [...options];
const menuTreeOptions = ref<Api.MenuAdmin.MenuTree[]>([]);

async function getMenuTreeOptions() {
  const { error, data } = await fetchGetMenuTree();

  if (!error) {
    menuTreeOptions.value = data;
  }
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 父選擇器選項＝★首項合成「頂層」選項（id=0——spec US2 場景 2 之 parentId=0 提交入口、頂層豁免父驗證）＋治理域全樹；permissive 選取、後端防環／父存在性／常量父鏈守門為權威
const parentTreeOptions = computed<Api.MenuAdmin.MenuTree[]>(() => [
  { id: 0, label: $t('page.manage.menu.form.parentRoot'), pId: 0 },
  ...menuTreeOptions.value
]);

function handleInitModel() {
  model.value = createDefaultModel();

  if (!props.rowData) return;

  if (props.operateType === 'addChild') {
    const { id } = props.rowData;

    Object.assign(model.value, { parentId: id });
  }

  if (props.operateType === 'edit') {
    const { component, ...rest } = props.rowData;

    const { layout, page } = getLayoutAndPage(component);
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 接真後 routePath 誠實 nullable（wire 契約）、null 收斂空字串再拆 pathParam；原行: const { path, param } = getPathParamFromRoutePath(rest.routePath);
    const { path, param } = getPathParamFromRoutePath(rest.routePath ?? '');

    Object.assign(model.value, rest, { layout, page, routePath: path, pathParam: param });
  }

  if (!model.value.query) {
    model.value.query = [];
  }
  if (!model.value.buttons) {
    model.value.buttons = [];
  }
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] menuMemo null 收斂空字串（wire null↔表單空字串、後端 blank_to_none 來回等價——沿 role drawer 先例語意）
  if (!model.value.menuMemo) {
    model.value.menuMemo = '';
  }
}

function closeDrawer() {
  visible.value = false;
}

function handleUpdateRoutePathByRouteName() {
  if (model.value.routeName) {
    model.value.routePath = getRoutePathByRouteName(model.value.routeName);
  } else {
    model.value.routePath = '';
  }
}

function handleUpdateI18nKeyByRouteName() {
  if (model.value.routeName) {
    model.value.i18nKey = `route.${model.value.routeName}` as App.I18n.I18nKey;
  } else {
    model.value.i18nKey = null;
  }
}

function handleCreateButton() {
  const buttonItem: Api.SystemManage.MenuButton = {
    code: '',
    desc: ''
  };

  return buttonItem;
}

function getSubmitParams() {
  const { layout, page, pathParam, ...params } = model.value;

  const component = transformLayoutAndPageToComponent(layout, page);
  const routePath = getRoutePathWithParam(model.value.routePath, pathParam);

  params.component = component;
  params.routePath = routePath;

  return params;
}

async function handleSubmit() {
  await validate();

  const params = getSubmitParams();

  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 提交接真（rev4: 同形 add/update 分流）：
  // ★update 逐欄顯式構造、絕不散開 params——routeName／menuType 出現即 2222 *Immutable（值不比對、
  // 契約 §4；且 edit 回填曾整包 Object.assign、model 帶有 id/protected/deleted 等唯讀欄，散開必洩）；
  // 拒因（十一鍵）toast 由共用攔截層轉譯 backend.biz.menu.*、此處只看 error 是否為真。
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: console.log('params: ', params);
  const { error } = isEdit.value
    ? await fetchUpdateMenu({
        id: menuId.value,
        menuName: params.menuName,
        parentId: params.parentId,
        routePath: params.routePath,
        component: params.component,
        status: params.status,
        hideInMenu: params.hideInMenu,
        keepAlive: params.keepAlive,
        multiTab: params.multiTab,
        constant: params.constant,
        order: params.order,
        icon: params.icon,
        iconType: params.iconType,
        i18nKey: params.i18nKey,
        href: params.href,
        activeMenu: params.activeMenu,
        fixedIndexInTab: params.fixedIndexInTab,
        query: params.query,
        buttons: params.buttons,
        menuMemo: params.menuMemo
      })
    : await fetchAddMenu(params);
  if (error) {
    return;
  }
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 父選擇器選項於開啟時重取（鏡像原 getRoleOptions 時點；rev4: 同時點形）；原行: getRoleOptions();
    getMenuTreeOptions();
  }
});

watch(
  () => model.value.routeName,
  () => {
    handleUpdateRoutePathByRouteName();
    handleUpdateI18nKeyByRouteName();
  }
);
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-800px">
    <NScrollbar class="h-480px pr-20px">
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.menuType')" path="menuType">
            <NRadioGroup v-model:value="model.menuType" :disabled="disabledMenuType">
              <NRadio v-for="item in menuTypeOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
            </NRadioGroup>
          </NFormItemGi>
          <!--
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud START] 父選擇器（FR-045：treeSelect 消費
            getMenuTree 治理域輕量樹；spec US2 場景 2＝新增 modal 亦有父選擇器、rev4 僅 edit 模式形不沿用）。
            permissive 選取、後端守門為權威；首項合成「頂層」選項＝parentId=0 提交入口（頂層豁免父驗證）。
          -->
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.parentId')" path="parentId">
            <NTreeSelect v-model:value="model.parentId" :options="parentTreeOptions" key-field="id" label-field="label" />
          </NFormItemGi>
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud END] -->
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.menuName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.menuName')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.routeName')" path="routeName">
            <!--
              編輯模式停用——routeName 建立後不可變（契約 §4 出現即拒；提交面已結構性不送此欄，此處把「改不動」誠實呈現、不留可打字卻無效的入口；rev4: 同形鎖欄）。
              ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
              [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: <NInput v-model:value="model.routeName" :placeholder="$t('page.manage.menu.form.routeName')" />
            -->
            <NInput
              v-model:value="model.routeName"
              :disabled="disabledMenuType"
              :placeholder="$t('page.manage.menu.form.routeName')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.routePath')" path="routePath">
            <NInput v-model:value="model.routePath" disabled :placeholder="$t('page.manage.menu.form.routePath')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.pathParam')" path="pathParam">
            <NInput v-model:value="model.pathParam" :placeholder="$t('page.manage.menu.form.pathParam')" />
          </NFormItemGi>
          <NFormItemGi v-if="showLayout" span="24 m:12" :label="$t('page.manage.menu.layout')" path="layout">
            <NSelect
              v-model:value="model.layout"
              :options="layoutOptions"
              :placeholder="$t('page.manage.menu.form.layout')"
            />
          </NFormItemGi>
          <NFormItemGi v-if="showPage" span="24 m:12" :label="$t('page.manage.menu.page')" path="page">
            <NSelect
              v-model:value="model.page"
              :options="pageOptions"
              :placeholder="$t('page.manage.menu.form.page')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.i18nKey')" path="i18nKey">
            <NInput v-model:value="model.i18nKey" :placeholder="$t('page.manage.menu.form.i18nKey')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.order')" path="order">
            <NInputNumber v-model:value="model.order" class="w-full" :placeholder="$t('page.manage.menu.form.order')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.iconTypeTitle')" path="iconType">
            <NRadioGroup v-model:value="model.iconType">
              <NRadio
                v-for="item in menuIconTypeOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.icon')" path="icon">
            <template v-if="model.iconType === '1'">
              <NInput v-model:value="model.icon" :placeholder="$t('page.manage.menu.form.icon')" class="flex-1">
                <template #suffix>
                  <SvgIcon v-if="model.icon" :icon="model.icon" class="text-icon" />
                </template>
              </NInput>
            </template>
            <template v-if="model.iconType === '2'">
              <NSelect
                v-model:value="model.icon"
                :placeholder="$t('page.manage.menu.form.localIcon')"
                :options="localIconOptions"
              />
            </template>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.menuStatus')" path="status">
            <NRadioGroup v-model:value="model.status">
              <NRadio
                v-for="item in enableStatusOptions"
                :key="item.value"
                :value="item.value"
                :label="$t(item.label)"
              />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.keepAlive')" path="keepAlive">
            <NRadioGroup v-model:value="model.keepAlive">
              <NRadio :value="true" :label="$t('common.yesOrNo.yes')" />
              <NRadio :value="false" :label="$t('common.yesOrNo.no')" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.constant')" path="constant">
            <NRadioGroup v-model:value="model.constant">
              <NRadio :value="true" :label="$t('common.yesOrNo.yes')" />
              <NRadio :value="false" :label="$t('common.yesOrNo.no')" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.href')" path="href">
            <NInput v-model:value="model.href" :placeholder="$t('page.manage.menu.form.href')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.hideInMenu')" path="hideInMenu">
            <NRadioGroup v-model:value="model.hideInMenu">
              <NRadio :value="true" :label="$t('common.yesOrNo.yes')" />
              <NRadio :value="false" :label="$t('common.yesOrNo.no')" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="model.hideInMenu"
            span="24 m:12"
            :label="$t('page.manage.menu.activeMenu')"
            path="activeMenu"
          >
            <NSelect
              v-model:value="model.activeMenu"
              :options="pageOptions"
              clearable
              :placeholder="$t('page.manage.menu.form.activeMenu')"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.multiTab')" path="multiTab">
            <NRadioGroup v-model:value="model.multiTab">
              <NRadio :value="true" :label="$t('common.yesOrNo.yes')" />
              <NRadio :value="false" :label="$t('common.yesOrNo.no')" />
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.fixedIndexInTab')" path="fixedIndexInTab">
            <NInputNumber
              v-model:value="model.fixedIndexInTab"
              class="w-full"
              clearable
              :placeholder="$t('page.manage.menu.form.fixedIndexInTab')"
            />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.manage.menu.query')">
            <NDynamicInput
              v-model:value="model.query"
              preset="pair"
              :key-placeholder="$t('page.manage.menu.form.queryKey')"
              :value-placeholder="$t('page.manage.menu.form.queryValue')"
            >
              <template #action="{ index, create, remove }">
                <NSpace class="ml-12px">
                  <NButton size="medium" @click="() => create(index)">
                    <icon-ic-round-plus class="text-icon" />
                  </NButton>
                  <NButton size="medium" @click="() => remove(index)">
                    <icon-ic-round-remove class="text-icon" />
                  </NButton>
                </NSpace>
              </template>
            </NDynamicInput>
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.manage.menu.button')">
            <NDynamicInput v-model:value="model.buttons" :on-create="handleCreateButton">
              <template #default="{ value }">
                <div class="flex-y-center flex-1 gap-12px">
                  <NInput
                    v-model:value="value.code"
                    :placeholder="$t('page.manage.menu.form.buttonCode')"
                    class="flex-1"
                  />
                  <NInput
                    v-model:value="value.desc"
                    :placeholder="$t('page.manage.menu.form.buttonDesc')"
                    class="flex-1"
                  />
                </div>
              </template>
              <template #action="{ index, create, remove }">
                <NSpace class="ml-12px">
                  <NButton size="medium" @click="() => create(index)">
                    <icon-ic-round-plus class="text-icon" />
                  </NButton>
                  <NButton size="medium" @click="() => remove(index)">
                    <icon-ic-round-remove class="text-icon" />
                  </NButton>
                </NSpace>
              </template>
            </NDynamicInput>
          </NFormItemGi>
          <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] memo textarea（FR-043；placeholder 逐字註明僅管理員可見；值的顯示端一律純文字插值） -->
          <NFormItemGi span="24" :label="$t('page.manage.menu.menuMemo')" path="menuMemo">
            <NInput v-model:value="model.menuMemo" type="textarea" :placeholder="$t('page.manage.menu.form.menuMemo')" />
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NScrollbar>
    <template #footer>
      <NSpace justify="end" :size="16">
        <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
