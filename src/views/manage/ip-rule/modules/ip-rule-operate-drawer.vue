<!-- [rev6-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則新增／編輯抽屜（新增檔；上游基線無此路徑）——排序值／網段／規則類型／備註四欄，編輯模式另顯審計四項唯讀 -->
<script setup lang="ts">
// 骨架同 `views/manage/role/modules/role-operate-drawer.vue`（NDrawer＋useNaiveForm＋add／edit 分流）；出處＝rev5:src/views/manage/ip-rule/modules/ip-rule-operate-drawer.vue。
// 送出成功只 emit `submitted` 讓清單刷新；失敗提示由 `service/request` 的 onError 鏈出 toast、此處不加工。
// 備註以值的形式進出 NInput（v-model）、審計四項以文字插值顯示——本檔沒有任何原始 HTML 注入寫法。
import { computed, ref, watch } from 'vue';
import { fetchAddIpRule, fetchUpdateIpRule } from '@/service/api/rev6-ip-rule';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'IpRuleOperateDrawer'
});

interface Props {
  /** add＝新增／edit＝編輯 */
  operateType: NaiveUI.TableOperateType;
  /** 編輯模式下被點選的那一列 */
  rowData?: Api.IpRule.IpRuleRecord | null;
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

type Model = {
  wbipCidr: string;
  wbipType: Api.IpRule.RuleType;
  wbipMemo: string;
  order: number | null;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    wbipCidr: '',
    // 預設 deny：手滑直接送出時，多一條阻擋遠比多開一道放行口安全
    wbipType: 'deny',
    wbipMemo: '',
    order: null
  };
}

/**
 * 網段欄前端只擋「空」與「含空白」。格式的權威是後端的解析與正規化（IPv4／IPv6 皆收）；
 * 前端另寫一套嚴格正則，遲早會把後端收得下的合法字面（IPv6 壓縮形、`/128`）擋在門外。
 */
function isCidrLike(value: string): boolean {
  return value.length > 0 && !/\s/.test(value);
}

type RuleKey = Extract<keyof Model, 'wbipCidr' | 'wbipType'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  wbipCidr: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule, value: string) =>
      isCidrLike(value || '') ? true : new Error($t('page.manage.ipRule.form.cidr'))
  },
  wbipType: defaultRequiredRule
};

/** 審計四項的 null 降級，與清單同一顆破折號 */
function displayNullable(value: string | null | undefined) {
  return value ?? $t('page.manage.ipRule.empty');
}

// 包 computed＝切換語系時選項標籤跟著變
const ruleTypeOptions = computed<CommonType.Option<Api.IpRule.RuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const { wbipCidr, wbipType, wbipMemo, order } = props.rowData;
    // 備註的 null 以空字串進輸入框；空字串送回去後端仍落 null，來回不漂移
    model.value = { wbipCidr, wbipType, wbipMemo: wbipMemo ?? '', order };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // 編輯為四欄全量提交
  if (props.operateType === 'add') {
    const { error } = await fetchAddIpRule({ ...model.value });
    if (error) {
      return;
    }
  } else {
    const id = props.rowData?.id;
    if (id === undefined) {
      return;
    }
    const { error } = await fetchUpdateIpRule({ id, ...model.value });
    if (error) {
      return;
    }
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
  <NDrawer v-model:show="visible" display-directive="show" :width="380">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <!--
          排序值的 precision／min／max 不是裝飾：後端該欄是 32 位元整數，而寫端 DTO 的欄位預設只救「欄缺席」。
          小數或越界整數會讓整個 body 反序列化失敗、被收斂成全預設值，使用者拿到的是「規則類型」那一支拒絕提示——
          指向一個他明明填對的欄位。故在唯一指得出欄名的這一格先把值域夾住；上下界即 i32 值域本身、不另立業務下限。
        -->
        <NFormItem :label="$t('page.manage.ipRule.order')" path="order">
          <NInputNumber
            v-model:value="model.order"
            clearable
            class="w-full"
            :precision="0"
            :min="-2147483648"
            :max="2147483647"
            :placeholder="$t('page.manage.ipRule.form.order')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.ipRule.wbipCidr')" path="wbipCidr">
          <NInput v-model:value="model.wbipCidr" :placeholder="$t('page.manage.ipRule.form.cidr')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.ipRule.wbipType')" path="wbipType">
          <NSelect
            v-model:value="model.wbipType"
            :options="ruleTypeOptions"
            :placeholder="$t('page.manage.ipRule.form.type')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.ipRule.wbipMemo')" path="wbipMemo">
          <NInput v-model:value="model.wbipMemo" type="textarea" :placeholder="$t('page.manage.ipRule.form.memo')" />
        </NFormItem>
        <!-- 審計四項只在編輯模式出現（新增時記錄尚不存在）；無 path＝不進表單 model -->
        <template v-if="operateType === 'edit'">
          <NFormItem :label="$t('page.manage.ipRule.createdAt')">
            <span>{{ displayNullable(rowData?.createdAt) }}</span>
          </NFormItem>
          <NFormItem :label="$t('page.manage.ipRule.createdBy')">
            <span>{{ displayNullable(rowData?.createdBy) }}</span>
          </NFormItem>
          <NFormItem :label="$t('page.manage.ipRule.updatedAt')">
            <span>{{ displayNullable(rowData?.updatedAt) }}</span>
          </NFormItem>
          <NFormItem :label="$t('page.manage.ipRule.updatedBy')">
            <span>{{ displayNullable(rowData?.updatedBy) }}</span>
          </NFormItem>
        </template>
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
