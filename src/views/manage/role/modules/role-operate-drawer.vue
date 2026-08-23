<script setup lang="ts">
import { computed, ref, watch } from 'vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 編輯回填改逐欄顯式構造（見 handleInitModel）、jsonClone 隨之無消費者；原行: import { jsonClone } from '@sa/utils';
import { useBoolean } from '@sa/hooks';
import { enableStatusOptions } from '@/constants/business';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 新增／編輯提交接真 rev5 wrapper（直接路徑、不經 barrel——沿 rev5-ip-rule 先例）
import { fetchAddRole, fetchUpdateRole } from '@/service/api/rev5-role-admin';
import { $t } from '@/locales';
import MenuAuthModal from './menu-auth-modal.vue';
import ButtonAuthModal from './button-auth-modal.vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 端點維授權 modal（rev5 新增型新檔）掛載——
// 同檔雙用途：上方 (ii) 之 CRUD 接真標記一字不動、本用途只加純新增行（憲法 §III.2 (iii) 列）
import EndpointAuthModal from './endpoint-auth-modal.vue';
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 型別切 rev5 獨立命名空間（接真 wire 形）；原行: rowData?: Api.SystemManage.Role | null;
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
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 第三顆 modal 顯隱（鏡像上兩行形）
const { bool: endpointAuthVisible, setTrue: openEndpointAuthModal } = useBoolean();
// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END]

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.role.addRole'),
    edit: $t('page.manage.role.editRole')
  };
  return titles[props.operateType];
});

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 表單模型改自持（demo 型 Pick 不敷：補 roleMemo 欄〔FR-043〕；nullable 欄以空字串承載「沒填」、後端 blank_to_none 來回等價）；原行: type Model = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;
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
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] memo 欄（FR-043）
    roleMemo: '',
    status: null
  };
}

// [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] roleMemo 同 roleDesc 屬選填、不入必填規則集；原行: type RuleKey = Exclude<keyof Model, 'roleDesc'>;
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
    // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 逐欄顯式回填、不整包拷貝：RoleRecord 另帶 roleHome／審計欄等，Object.assign 整包進 model 再散出去會把 roleCode 一併送進 updateRole——rev5 契約「出現即拒」（rev4 等值放行不帶回）；null 欄以空字串進 NInput（送出時後端落回 None、來回無漂移）；原行: Object.assign(model.value, jsonClone(props.rowData));
    const { roleName, roleCode, roleDesc, roleMemo, status } = props.rowData;
    model.value = { roleName, roleCode, roleDesc: roleDesc ?? '', roleMemo: roleMemo ?? '', status };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 提交接真（rev4: 同形 add/update 分流）：
  // ★update 逐欄顯式構造、絕不散開 model——roleCode 出現即 2222 codeImmutable（值不比對、契約 §4）；
  // 拒因（九鍵）toast 由共用攔截層轉譯 backend.biz.role.*、此處只看 error 是否為真。
  const { error } = isEdit.value
    ? await fetchUpdateRole({
        id: roleId.value,
        roleName: model.value.roleName,
        roleDesc: model.value.roleDesc,
        roleMemo: model.value.roleMemo,
        status: model.value.status
      })
    : await fetchAddRole({
        roleCode: model.value.roleCode,
        roleName: model.value.roleName,
        roleDesc: model.value.roleDesc,
        roleMemo: model.value.roleMemo,
        status: model.value.status
      });
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
          <!--
            編輯模式停用——roleCode 建立後不可變（契約 §4 出現即拒；提交面已結構性不送此欄，此處把「改不動」誠實呈現、不留可打字卻無效的入口）。
            ★本註解刻意排成 multiline 形：singleline 形下 eslint（vue/html-comment-content-newline）的 fix 會把註解閉合符併回行尾、令行尾錨定的「原行」擷取值失真（fork-delta-lint 當場紅）；
            [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] 原行: <NInput v-model:value="model.roleCode" :placeholder="$t('page.manage.role.form.roleCode')" />
          -->
          <NInput v-model:value="model.roleCode" :disabled="isEdit" :placeholder="$t('page.manage.role.form.roleCode')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.role.roleDesc')" path="roleDesc">
          <NInput v-model:value="model.roleDesc" :placeholder="$t('page.manage.role.form.roleDesc')" />
        </NFormItem>
        <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(ii) 005-role-menu-crud] memo textarea（FR-043；placeholder 逐字註明僅管理員可見；值的顯示端一律純文字插值） -->
        <NFormItem :label="$t('page.manage.role.roleMemo')" path="roleMemo">
          <NInput v-model:value="model.roleMemo" type="textarea" :placeholder="$t('page.manage.role.form.roleMemo')" />
        </NFormItem>
      </NForm>
      <NSpace v-if="isEdit">
        <NButton @click="openMenuAuthModal">{{ $t('page.manage.role.menuAuth') }}</NButton>
        <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="roleId" />
        <NButton @click="openButtonAuthModal">{{ $t('page.manage.role.buttonAuth') }}</NButton>
        <ButtonAuthModal v-model:visible="buttonAuthVisible" :role-id="roleId" />
        <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance START] 端點維授權觸發鈕＋掛載（鏡像上兩顆；三鈕零 hasAuth gating、門在頁級＝FR-040） -->
        <NButton @click="openEndpointAuthModal">{{ $t('page.manage.role.endpointAuth') }}</NButton>
        <EndpointAuthModal v-model:visible="endpointAuthVisible" :role-id="roleId" />
        <!-- [rev5-inline BASE-WEB-MANAGE-PAGE-WIRING(iii)+ 006-authz-governance END] -->
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
