<script setup lang="tsx">
import { computed, ref, shallowRef, watch } from 'vue';
import type { SelectOption } from 'naive-ui';
import { enableStatusOptions, menuIconTypeOptions, menuTypeOptions } from '@/constants/business';
import { fetchAddMenu, fetchGetAllRoles, fetchGetMenuTree, fetchUpdateMenu } from '@/service/api';
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
  rowData?: Api.SystemManage.Menu | null;
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

// re-parent(R2):受管選單(protected,後端 data-driven)父固定不可改、僅自訂選單可搬。
// 034 D10:改吃 wire 回傳的 protected 旗標(後端 casbin_rule + sys_menu data-driven),
// 取代原硬編碼 SEED_MENU_ROUTE_NAMES 清單,後端新增種子無須同步前端。
const disabledParentId = computed(
  () => props.operateType === 'edit' && props.rowData?.protected === true
);

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

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    const options = data.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));

    roleOptions.value = [...options];
  }
}

/** the menu tree options for re-parent select(R2) */
const menuTreeOptions = shallowRef<Api.SystemManage.MenuTree[]>([]);

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
    const { path, param } = getPathParamFromRoutePath(rest.routePath);

    Object.assign(model.value, rest, { layout, page, routePath: path, pathParam: param });
  }

  // 025-I1:wire 的 id/parentId 是 string type-lie(§I.3,read DTO 把 parent_id 序列化為字串
  // "0"/"5"),但本元件後續一律以 number 為準 —— NTreeSelect 選項 key(MenuTree.id:number)、
  // 預設值(parentId:0)、submit 的 de_parent_id(吸收 number/string/null)。載入後正規化為
  // number,否則頂層葉選單編輯時 `"0" === 0` 為 false → effectiveLayout='' → 吃掉 component 的
  // layout 前綴(如種子 home 的 layout.base$view.home),同時 NTreeSelect 預選態(M1)會落空。
  model.value.parentId = Number(model.value.parentId);

  if (!model.value.query) {
    model.value.query = [];
  }
  if (!model.value.buttons) {
    model.value.buttons = [];
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

  // 025 re-parent:component 的 layout 前綴僅適用「頂層」或「目錄(menuType=1)」;
  // 若把葉選單(menuType=2)搬成 nested,須丟棄殘留的 layout 前綴,避免汙染 component(雙層 layout)。
  const effectiveLayout = model.value.parentId === 0 || model.value.menuType === '1' ? layout : '';
  const component = transformLayoutAndPageToComponent(effectiveLayout, page);
  const routePath = getRoutePathWithParam(model.value.routePath, pathParam);

  params.component = component;
  params.routePath = routePath;

  return params;
}

async function handleSubmit() {
  await validate();

  const params = getSubmitParams();

  const { error } =
    props.operateType === 'edit'
      ? await fetchUpdateMenu({ ...params, id: props.rowData!.id })
      : await fetchAddMenu(params);

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleOptions();
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
          <NFormItemGi
            v-if="operateType === 'edit'"
            span="24 m:12"
            :label="$t('page.manage.menu.parentId')"
            path="parentId"
          >
            <NTreeSelect
              :value="model.parentId"
              :options="menuTreeOptions"
              key-field="id"
              label-field="label"
              children-field="children"
              clearable
              :disabled="disabledParentId"
              :placeholder="$t('page.manage.menu.form.parentId')"
              @update:value="(val) => (model.parentId = val ?? 0)"
            />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.menuName')" path="menuName">
            <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.menu.form.menuName')" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.manage.menu.routeName')" path="routeName">
            <NInput v-model:value="model.routeName" :placeholder="$t('page.manage.menu.form.routeName')" />
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
