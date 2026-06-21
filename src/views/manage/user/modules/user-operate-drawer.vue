<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
// [rev3-inline 014-auth-token-session MW(a)] sessionPolicyOptions 引入（per-user session 策略下拉）
import { enableStatusOptions, sessionPolicyOptions, userGenderOptions } from '@/constants/business';
import { fetchGetAllRoles } from '@/service/api';
// [rev3-inline 009-user-management MW(a)] 寫端 wrapper 直接路徑 import（非 barrel）
import { fetchAddUser, fetchUpdateUser } from '@/service/api/rev3-system-manage';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
// [rev3-inline 014-auth-token-session MW(a)] translateOptions（i18n-key → label）供 sessionPolicy NSelect
import { translateOptions } from '@/utils/common';
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

// [rev3-inline 014-auth-token-session MW(a)] Model 經 intersection 加 sessionPolicy（User frozen 無此欄）
type Model = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
> & { sessionPolicy: Api.SystemManage.SessionPolicy };

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
    // [rev3-inline 014-auth-token-session MW(a)] create 端預設 inherit（C3：override 走編輯；後端 default 亦 inherit）
    sessionPolicy: 'inherit'
  };
}

type RuleKey = Extract<keyof Model, 'userName' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  status: defaultRequiredRule
};

/** the enabled role options */
const roleOptions = ref<CommonType.Option<string>[]>([]);

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    const options = data.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));

    // [rev3-inline 009-user-management MW(a)] 移除原 mock workaround 區塊（真 getAllRoles，chip 顯真 code）
    roleOptions.value = options;
  }
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
    // [rev3-inline 014-auth-token-session MW(a)] rowData 視為 rev3 honest list-item（rust wire 確 emit sessionPolicy）；
    //   frozen User 型無此欄 → 顯式讀＋fallback inherit（避免 Object.assign 後型上看不到 sessionPolicy）
    model.value.sessionPolicy =
      (props.rowData as Api.SystemManage.UserListItemRev3).sessionPolicy ?? 'inherit';
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // [rev3-inline 009-user-management MW(a)] 原 stub：window.$message?.success($t('common.updateSuccess'));closeDrawer();emit('submitted');
  // 分支 add/edit 真發 request；id 轉字串在 wrapper 內處理（updateUser）
  const { error } =
    props.operateType === 'add'
      ? await fetchAddUser(model.value)
      : await fetchUpdateUser({ ...model.value, id: props.rowData!.id });

  if (!error) {
    window.$message?.success($t(props.operateType === 'add' ? 'common.addSuccess' : 'common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getRoleOptions();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.user.userName')" path="userName">
          <NInput v-model:value="model.userName" :placeholder="$t('page.manage.user.form.userName')" />
        </NFormItem>
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
        <!-- [rev3-inline 014-auth-token-session MW(a)+] per-user session 策略下拉（inherit/on/off；非 required、預設 inherit） -->
        <NFormItem :label="$t('page.manage.user.sessionPolicyLabel')" path="sessionPolicy">
          <NSelect
            v-model:value="model.sessionPolicy"
            :options="translateOptions(sessionPolicyOptions)"
            :placeholder="$t('page.manage.user.form.sessionPolicy')"
          />
        </NFormItem>
        <!-- [rev3-inline 014-auth-token-session MW(a)+] END -->
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
