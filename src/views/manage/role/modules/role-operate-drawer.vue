<script setup lang="ts">
import { computed, ref, watch } from 'vue';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 編輯回填改逐欄取值（見 handleInitModel）、本檔不再深拷貝整列；原行: import { jsonClone } from '@sa/utils';
import { useBoolean } from '@sa/hooks';
import { enableStatusOptions } from '@/constants/business';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 新增／編輯送出改打角色管理 wrapper（直接路徑、不經 barrel）
import { fetchAddRole, fetchUpdateRole } from '@/service/api/rev6-role-admin';
// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
import { $t } from '@/locales';
import MenuAuthModal from './menu-auth-modal.vue';
import ButtonAuthModal from './button-auth-modal.vue';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 列型改角色管理清單的 wire 列型（清單頁傳入的即此型）；原行: rowData?: Api.SystemManage.Role | null;
  rowData?: Api.RoleAdmin.RoleRecord | null;
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
const { bool: menuAuthVisible, setTrue: openMenuAuthModal } = useBoolean();
const { bool: buttonAuthVisible, setTrue: openButtonAuthModal } = useBoolean();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 表單模型改自持、多一個備註欄；描述與備註在表單內一律以字串承載（沒填＝空字串，送出後由後端落 NULL）；原行: type Model = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;
type Model = {
  roleName: string;
  roleCode: string;
  roleDesc: string;
  roleMemo: string;
  status: Api.Common.EnableStatus | null;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    roleName: '',
    roleCode: '',
    roleDesc: '',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註欄起始值
    roleMemo: '',
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
    status: null
  };
}

// [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 備註同描述為選填、不入必填規則；原行: type RuleKey = Exclude<keyof Model, 'roleDesc'>;
type RuleKey = Exclude<keyof Model, 'roleDesc' | 'roleMemo'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  roleName: defaultRequiredRule,
  roleCode: defaultRequiredRule,
  status: defaultRequiredRule
};

const roleId = computed(() => props.rowData?.id || -1);

const isEdit = computed(() => props.operateType === 'edit');

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 逐欄回填、不整列併入：清單列另帶首頁、審計欄等表單不管的欄；描述與備註的 null 轉空字串進輸入框；原行: Object.assign(model.value, jsonClone(props.rowData));
    const { roleName, roleCode, roleDesc, roleMemo, status } = props.rowData;
    model.value = { roleName, roleCode, roleDesc: roleDesc ?? '', roleMemo: roleMemo ?? '', status };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 送出接真：兩支請求皆逐欄列出、不展開表單物件；
  // 更新請求不帶角色代碼（代碼建立後不可變，請求一出現該欄即被拒）。狀態已過必填規則、`?? undefined` 只為收窄型別。
  // 拒因提示由共用攔截層轉譯、本頁只看成敗
  const { error } = isEdit.value
    ? await fetchUpdateRole({
        id: roleId.value,
        roleName: model.value.roleName,
        roleDesc: model.value.roleDesc,
        roleMemo: model.value.roleMemo,
        status: model.value.status ?? undefined
      })
    : await fetchAddRole({
        roleCode: model.value.roleCode,
        roleName: model.value.roleName,
        roleDesc: model.value.roleDesc,
        roleMemo: model.value.roleMemo,
        status: model.value.status ?? undefined
      });
  if (error) {
    return;
  }
  // [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END]
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.role.roleName')" path="roleName">
          <NInput v-model:value="model.roleName" :placeholder="$t('page.manage.role.form.roleName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleCode')" path="roleCode">
          <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 編輯態鎖定代碼欄：代碼建立後不可變、更新請求也不帶此欄，鎖住免得可打字卻不生效；原行: <NInput v-model:value="model.roleCode" :placeholder="$t('page.manage.role.form.roleCode')" /> -->
          <NInput
            v-model:value="model.roleCode"
            :disabled="isEdit"
            :placeholder="$t('page.manage.role.form.roleCode')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleDesc')" path="roleDesc">
          <NInput v-model:value="model.roleDesc" :placeholder="$t('page.manage.role.form.roleDesc')" />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud START] 備註輸入：多行文字框、提示語註明僅管理員可見 -->
        <NFormItem :label="$t('page.manage.role.roleMemo')" path="roleMemo">
          <NInput v-model:value="model.roleMemo" type="textarea" :placeholder="$t('page.manage.role.form.roleMemo')" />
        </NFormItem>
        <!-- [rev6-inline BASE-WEB-MANAGE-PAGE-WIRING(ii)+ 005-role-menu-crud END] -->
      </NForm>
      <NSpace v-if="isEdit">
        <NButton @click="openMenuAuthModal">{{ $t('page.manage.role.menuAuth') }}</NButton>
        <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="roleId" />
        <NButton @click="openButtonAuthModal">{{ $t('page.manage.role.buttonAuth') }}</NButton>
        <ButtonAuthModal v-model:visible="buttonAuthVisible" :role-id="roleId" />
      </NSpace>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
