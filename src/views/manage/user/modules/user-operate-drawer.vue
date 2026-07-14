<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';
import { fetchGetAllRoles } from '@/service/api';
// [rev4-inline MODAL-WIRING(a) 011-user-admin] add/update/sessionPolicy 接線 WRAPPER＋004 政策讀端（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchAddUser, fetchUpdateUser, fetchUpdateUserSessionPolicy } from '@/service/api/rev4-user-admin';
import { fetchGetSystemSettings } from '@/service/api/rev4-system-settings';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.User | null;
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
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.user.addUser'),
    edit: $t('page.manage.user.editUser')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
// [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: >;
// add 模式密碼欄＋edit 模式會話策略欄（憲法 §III.2(a) 釐清句：payload 必要欄之輸入載體）
> & {
  password: string;
  sessionPolicy: Api.SystemManage.UserSessionPolicy;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    userName: '',
    userGender: null,
    nickName: '',
    userPhone: '',
    userEmail: '',
    userRoles: [],
    status: null,
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] add 密碼空值起手；sessionPolicy 預設 inherit 僅 add 模式落地——edit 於 handleInitModel 以列現值覆蓋（FR-034 不以預設值渲染）
    password: '',
    sessionPolicy: 'inherit'
  };
}

// [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: type RuleKey = Extract<keyof Model, 'userName' | 'status'>;
type RuleKey = Extract<keyof Model, 'userName' | 'status' | 'password'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  status: defaultRequiredRule,
  // [rev4-inline MODAL-WIRING(a) 011-user-admin] 密碼 required（欄僅 add 模式渲染、edit 隱欄不觸驗；政策細則為後端權威驗證）
  password: defaultRequiredRule
};

// [rev4-inline MODAL-WIRING(a) 011-user-admin START] edit 模式 sessionPolicy 現值＋選項＋add 密碼政策 hint（憲法 §III.2(a) 釐清句授權）
// 列 wire 恆含 sessionPolicy（後端 UserRecord 恆序列化）＝讀現值唯一真源；凍結 User 為 type alias
// 不可 augment→以 UserWithSessionPolicy 交叉型讀取（FR-034 MUST NOT 以預設值渲染致 diff 誤判）。
const currentSessionPolicy = computed<Api.SystemManage.UserSessionPolicy>(() => {
  const row = props.rowData as Api.SystemManage.UserWithSessionPolicy | null | undefined;
  return row?.sessionPolicy ?? 'inherit';
});

const sessionPolicyOptions = computed<CommonType.Option<Api.SystemManage.UserSessionPolicy>[]>(() => [
  { label: $t('page.manage.user.sessionPolicyOption.inherit'), value: 'inherit' },
  { label: $t('page.manage.user.sessionPolicyOption.single'), value: 'single' },
  { label: $t('page.manage.user.sessionPolicyOption.multi'), value: 'multi' }
]);

const passwordPolicyHint = ref('');

/** best-effort 取 004 密碼政策 7 鍵組動態 hint——任何失敗（權限/網路/缺鍵）靜默降級零 hint；權威驗證在後端（FR-026） */
async function getPasswordPolicyHint() {
  try {
    const { error, data } = await fetchGetSystemSettings();
    if (error || !data) {
      return;
    }
    const kv = new Map(data.map(item => [item.settingKey, item.settingValue]));
    const parts: string[] = [];
    const minLength = kv.get('password_min_length');
    if (minLength) {
      parts.push(`${$t('page.manage.systemSettings.items.passwordMinLength')} ${minLength}`);
    }
    const maxLength = kv.get('password_max_length');
    if (maxLength) {
      parts.push(`${$t('page.manage.systemSettings.items.passwordMaxLength')} ${maxLength}`);
    }
    if (kv.get('password_require_digit') === 'on') {
      parts.push($t('page.manage.systemSettings.items.passwordRequireDigit'));
    }
    if (kv.get('password_require_lowercase') === 'on') {
      parts.push($t('page.manage.systemSettings.items.passwordRequireLowercase'));
    }
    if (kv.get('password_require_uppercase') === 'on') {
      parts.push($t('page.manage.systemSettings.items.passwordRequireUppercase'));
    }
    if (kv.get('password_require_special') === 'on') {
      parts.push($t('page.manage.systemSettings.items.passwordRequireSpecial'));
    }
    if (kv.get('password_forbid_username') === 'on') {
      parts.push($t('page.manage.systemSettings.items.passwordForbidUsername'));
    }
    passwordPolicyHint.value = parts.join($t('backend.common.listSeparator'));
  } catch {
    passwordPolicyHint.value = '';
  }
}
// [rev4-inline MODAL-WIRING(a) 011-user-admin END]

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    const options = data.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));

    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 清 mock 補償碼——角色候選走真 fetchGetAllRoles（009 已真通、role code 齊備）：
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: const userRoleOptions = model.value.userRoles.map(item => ({
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: label: item,
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: value: item
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: }));
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: roleOptions.value = [...userRoleOptions, ...options];
    roleOptions.value = options;
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] sessionPolicy 以列現值渲染（rowData 型別為凍結 User、runtime wire 恆含——經 currentSessionPolicy 顯式收斂、防欄位缺席時 assign 靜默漏拷）
    model.value.sessionPolicy = currentSessionPolicy.value;
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // [rev4-inline MODAL-WIRING(a) 011-user-admin START] submit 接真 API：add→fetchAddUser（含密碼）／edit→fetchUpdateUser
  // ＋sessionPolicy 與現值 diff 才觸發獨立 updateUserSessionPolicy（與 updateUser 提交解耦；FR-034/035）。
  // 拒因（userNameInvalid/passwordPolicy〔明細攔截層渲染〕/userNameExists/roleNotFound/守門鍵…）由共用攔截層 onError toast。
  const { status } = model.value;
  if (!status) {
    // status required rule 已擋——此處僅型別收窄
    return;
  }
  if (props.operateType === 'add') {
    const { error } = await fetchAddUser({
      userName: model.value.userName,
      password: model.value.password,
      status,
      userGender: model.value.userGender,
      nickName: model.value.nickName,
      userPhone: model.value.userPhone,
      userEmail: model.value.userEmail,
      userRoles: model.value.userRoles
    });
    if (error) {
      return;
    }
  } else {
    const rowId = props.rowData?.id;
    if (rowId === undefined) {
      return;
    }
    // 全量提交（soybean 慣例）：userName 收但不可變（後端比對現值、FR-006）；diff 全等 no-op 由後端以值 vs 現值判（FR-007）
    const { error } = await fetchUpdateUser({
      id: rowId,
      userName: model.value.userName,
      status,
      userGender: model.value.userGender,
      nickName: model.value.nickName,
      userPhone: model.value.userPhone,
      userEmail: model.value.userEmail,
      userRoles: model.value.userRoles
    });
    if (error) {
      return;
    }
    if (model.value.sessionPolicy !== currentSessionPolicy.value) {
      const { error: policyError } = await fetchUpdateUserSessionPolicy({
        id: rowId,
        sessionPolicy: model.value.sessionPolicy
      });
      if (policyError) {
        return;
      }
    }
  }
  // [rev4-inline MODAL-WIRING(a) 011-user-admin END]
  window.$message?.success($t('common.updateSuccess'));
  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleOptions();
    // [rev4-inline MODAL-WIRING(a) 011-user-admin] add 模式取密碼政策動態 hint（best-effort、不 await——失敗靜默降級零 hint）
    if (props.operateType === 'add') {
      getPasswordPolicyHint();
    }
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.userName')" path="userName">
          <!-- [rev4-inline MODAL-WIRING(a) 011-user-admin] 原行: <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
            edit 模式鎖帳號名欄（FR-006 前端半、B-025 雙保險——後端 userNameImmutable 為權威）
          -->
          <NInput
            v-model:value="model.userName"
            :disabled="operateType === 'edit'"
            :placeholder="$t('page.manage.user.form.userName')"
          />
        </NFormItem>
        <!-- [rev4-inline MODAL-WIRING(a) 011-user-admin START] add 模式密碼欄＋004 政策動態 hint（best-effort、失敗靜默零 hint；憲法 §III.2(a) 釐清句授權） -->
        <NFormItem v-if="operateType === 'add'" :label="$t('page.manage.user.password')" path="password">
          <div class="w-full flex-col gap-4px">
            <NInput
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              :placeholder="$t('page.manage.user.form.password')"
            />
            <span v-if="passwordPolicyHint" class="text-12px text-#999">{{ passwordPolicyHint }}</span>
          </div>
        </NFormItem>
        <!-- [rev4-inline MODAL-WIRING(a) 011-user-admin END] -->
        <NFormItem :label="$t('page.manage.user.userGender')" path="userGender">
          <NRadioGroup v-model:value="model.userGender">
            <NRadio v-for="item in userGenderOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.nickName')" path="nickName">
          <NInput v-model:value="model.nickName" :placeholder="$t('page.manage.user.form.nickName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userPhone')" path="userPhone">
          <NInput v-model:value="model.userPhone" :placeholder="$t('page.manage.user.form.userPhone')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userEmail')" path="email">
          <NInput v-model:value="model.userEmail" :placeholder="$t('page.manage.user.form.userEmail')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.user.userRole')" path="roles">
          <NSelect
            v-model:value="model.userRoles"
            multiple
            :options="roleOptions"
            :placeholder="$t('page.manage.user.form.userRole')"
          />
        </NFormItem>
        <!-- [rev4-inline MODAL-WIRING(a) 011-user-admin START] edit 模式會話策略 select（以列現值渲染、與現值 diff 才觸發獨立 updateUserSessionPolicy；FR-034/035） -->
        <NFormItem v-if="operateType === 'edit'" :label="$t('page.manage.user.sessionPolicy')" path="sessionPolicy">
          <NSelect
            v-model:value="model.sessionPolicy"
            :options="sessionPolicyOptions"
            :placeholder="$t('page.manage.user.form.sessionPolicy')"
          />
        </NFormItem>
        <!-- [rev4-inline MODAL-WIRING(a) 011-user-admin END] -->
      </NForm>
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
