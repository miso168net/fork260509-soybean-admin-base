<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 改打選單管理 wrapper（直接路徑、不經 barrel）：父選擇器的樹、新增、更新；upstream 在此取角色清單卻無任何欄位消費，不帶入；原行: import { fetchGetAllRoles } from '@/service/api';
import { fetchAddMenu, fetchGetMenuTree, fetchUpdateMenu } from '@/service/api/rev6-menu-admin';
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
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 列型改選單管理清單的 wire 列型（清單頁傳入的即此型）；原行: rowData?: Api.SystemManage.Menu | null;
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
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註欄：表單內一律以字串承載（沒填＝空字串，送出後由後端落 NULL）
  menuMemo: string;
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註欄起始值（插在物件非末項之間：塊內零移除行、拔標記即被 fork-delta-lint 報為未圈界新增）
    menuMemo: '',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] upstream 的角色選項整段移除（模板無任何消費處），換成父選擇器的選項源＝治理域輕量樹；被移除的碼行逐行記錄如下
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const roleOptions = ref<CommonType.Option<string>[]>([]);
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: async function getRoleOptions() {
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const { error, data } = await fetchGetAllRoles();
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: const options = data.map(item => ({
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: label: item.roleName,
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: value: item.roleCode
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: }));
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: roleOptions.value = [...options];
// 選項以 upstream 同形樹型 `Api.SystemManage.MenuTree` 承載（wire 形相同）：它是型別別名、可隱式滿足 naive-ui 樹選項型要求的
// 字串索引簽章；wrapper 回傳的 `Api.MenuAdmin.MenuTreeRecord` 是 interface、直接交給 NTreeSelect 會被型檢拒收
const menuTreeOptions = ref<Api.SystemManage.MenuTree[]>([]);

async function getMenuTreeOptions() {
  const { error, data } = await fetchGetMenuTree();

  if (!error) {
    menuTreeOptions.value = data;
  }
}

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
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] wire 的路由路徑可為 null，拆路徑參數前先收斂成空字串；原行: const { path, param } = getPathParamFromRoutePath(rest.routePath);
    const { path, param } = getPathParamFromRoutePath(rest.routePath ?? '');

    Object.assign(model.value, rest, { layout, page, routePath: path, pathParam: param });
  }

  if (!model.value.query) {
    model.value.query = [];
  }
  if (!model.value.buttons) {
    model.value.buttons = [];
  }
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 編輯回填時備註的 null（沒填）轉空字串進輸入框，與表單模型的字串型一致
  if (!model.value.menuMemo) {
    model.value.menuMemo = '';
  }
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
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

  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 送出接真。更新逐欄列出、絕不展開表單物件：路由名與選單型別建立後不可變、請求一出現即被拒（不比對值），而編輯回填把整列併入了表單模型、一展開就夾帶；新增展開表單模型（新增態模型只有預設欄與父 id）。狀態 `?? undefined` 只為收窄型別；拒因提示由共用攔截層轉譯、本頁只看成敗；原行: console.log('params: ', params);
  const { error } =
    props.operateType === 'edit'
      ? await fetchUpdateMenu({
          id: props.rowData?.id ?? -1,
          menuName: params.menuName,
          parentId: params.parentId,
          routePath: params.routePath,
          component: params.component,
          status: params.status ?? undefined,
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
      : await fetchAddMenu({ ...params, status: params.status ?? undefined });
  if (error) {
    return;
  }
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 父選擇器選項＝首項合成的「頂層」節點（id 0＝頂層：新增與更新皆以 parentId 0 表頂層）＋治理域全樹（源＝上方 `menuTreeOptions`）
// 任一節點皆可選、前端不擋環——父存在性、防環、常量父鏈一律由後端守門判定。
// 塊位刻意不緊貼 `getMenuTreeOptions`：那裡與上方角色選項替換段之間只隔 `}` 與空行，fork-delta-lint 會把本塊併入替換段、拔標記不紅
const parentTreeOptions = computed<Api.SystemManage.MenuTree[]>(() => [
  { id: 0, label: $t('page.manage.menu.form.parentRoot'), pId: 0 },
  ...menuTreeOptions.value
]);
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 開啟時改取父選擇器的樹（沿用原角色選項的取數時點）；原行: getRoleOptions();
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
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 父選擇器：新增、新增子項、編輯三種模式都顯示；選項首項為合成的「頂層」節點 -->
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.parentId')" path="parentId">
            <NTreeSelect
              v-model:value="model.parentId"
              :options="parentTreeOptions"
              key-field="id"
              label-field="label"
            />
          </NFormItemGi>
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END] -->
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.menuName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.menuName')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.routeName')" path="routeName">
            <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 編輯態鎖定路由名（與上方選單型別同一個編輯態條件）：路由名建立後不可變、更新請求也不帶此欄，鎖住免得可打字卻不生效；原行: <NInput v-model:value="model.routeName" :placeholder="$t('page.manage.menu.form.routeName')" /> -->
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
            <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 排序欄限整數：後端為 i32、小數會令整包請求收斂為空（更新假成功零變更、新增誤報拒因）；原行: <NInputNumber v-model:value="model.order" class="w-full" :placeholder="$t('page.manage.menu.form.order')" /> -->
            <NInputNumber
              v-model:value="model.order"
              class="w-full"
              :precision="0"
              :placeholder="$t('page.manage.menu.form.order')"
            />
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
            <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 頁籤固定序號限整數（理由同排序欄）；原行: clearable -->
            <NInputNumber
              v-model:value="model.fixedIndexInTab"
              class="w-full"
              clearable :precision="0"
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
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註輸入：多行文字框、提示語註明僅管理員可見 -->
          <NFormItemGi span="24" :label="$t('page.manage.menu.menuMemo')" path="menuMemo">
            <NInput
              v-model:value="model.menuMemo"
              type="textarea"
              :placeholder="$t('page.manage.menu.form.menuMemo')"
            />
          </NFormItemGi>
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END] -->
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
