<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
// [rev3-inline 022-ip-access-control MW] IP 規則寫端 wrapper 直接路徑 import（非 barrel）
import { fetchAddIpRule, fetchUpdateIpRule } from '@/service/api/rev3-system-manage';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';
import { isCidrLike, ruleTypeOptions } from './shared';

// [rev3-inline 022-ip-access-control MODAL-WIRING] IP 規則新增/編輯（沿 menu-operate-modal NModal 範式）
defineOptions({
  name: 'IpRuleOperateModal'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.IpRuleListItem | null;
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
    add: $t('page.manage.ipRule.addIpRule'),
    edit: $t('page.manage.ipRule.editIpRule')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.IpRuleUpsertModel, 'cidr' | 'ruleType' | 'order' | 'description'>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    cidr: '',
    ruleType: 'deny',
    order: null,
    description: null
  };
}

type RuleKey = Extract<keyof Model, 'cidr' | 'ruleType'>;

// cidr：required + 前端基本格式（後端 invalidCidr 兜底）；ruleType：required
const rules = computed<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>>(() => ({
  cidr: [
    defaultRequiredRule,
    {
      validator: (_rule, value: string) => {
        // required 規則另管空值；此處只在有值時驗格式
        if (!value) {
          return true;
        }
        return isCidrLike(value) ? true : new Error($t('page.manage.ipRule.form.cidrInvalid'));
      },
      trigger: ['input', 'blur']
    }
  ],
  ruleType: defaultRequiredRule
}));

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const { cidr, ruleType, order, description } = props.rowData;
    Object.assign(model.value, jsonClone({ cidr, ruleType, order, description }));
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // add/edit 真發 request；edit 帶 row.id（number），id→String 轉字串在 wrapper 內處理
  const { error } =
    props.operateType === 'add'
      ? await fetchAddIpRule(model.value)
      : await fetchUpdateIpRule({ ...model.value, id: props.rowData!.id });

  if (!error) {
    window.$message?.success($t(props.operateType === 'add' ? 'common.addSuccess' : 'common.updateSuccess'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-600px">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="120">
      <NFormItem :label="$t('page.manage.ipRule.cidr')" path="cidr">
        <NInput v-model:value="model.cidr" :placeholder="$t('page.manage.ipRule.form.cidr')" />
      </NFormItem>
      <NFormItem :label="$t('page.manage.ipRule.ruleType')" path="ruleType">
        <NSelect
          v-model:value="model.ruleType"
          :options="translateOptions(ruleTypeOptions)"
          :placeholder="$t('page.manage.ipRule.form.ruleType')"
        />
      </NFormItem>
      <NFormItem :label="$t('page.manage.ipRule.order')" path="order">
        <NInputNumber v-model:value="model.order" class="w-full" clearable :placeholder="$t('page.manage.ipRule.form.order')" />
      </NFormItem>
      <NFormItem :label="$t('page.manage.ipRule.description')" path="description">
        <NInput
          v-model:value="model.description"
          type="textarea"
          :placeholder="$t('page.manage.ipRule.form.description')"
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace :size="16" justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
