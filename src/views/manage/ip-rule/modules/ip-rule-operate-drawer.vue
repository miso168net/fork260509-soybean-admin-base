<script setup lang="ts">
// [rev4 net-new 013-ip-rule-admin] IP 規則新增／編輯抽屜（T016；user-operate-drawer 範式：NDrawer＋useNaiveForm＋operateType add/edit 分流＋rules）；
// 四欄＝wbipCidr（NInput required＋isCidrLike 寬鬆驗證）／wbipType（NSelect required、★預設 deny）
// 　　／wbipMemo（NInput textarea nullable；空字串提交＝後端落 None、契約 §3）
// 　　／order（NInputNumber nullable clearable；★label 與 placeholder 一律「排序值」語彙、零優先序暗示＝島 F F1 any-match）；
// ★寫成功後端自動 reload＋PUBLISH（FR-007）——本抽屜零追加生效呼叫、僅 emit submitted 讓清單刷新；
// 拒因（invalidCidr／invalidRuleType／conflict／selfLock／notFound）一律共用攔截層 onError toast（E2）、頁內零拒因專屬 UI；
// ＋U10（2026-07-16 user 拍板）：表單欄序改「排序值→網段→規則類型→備註」（純 form-item 重排、驗證與 model 零改動）；
// 　編輯模式於備註後、送出鈕前顯示審計四項唯讀（建立時間／建立者／更新時間／更新者；純文字、絕不進 form model、
// 　label 復用清單欄名 i18n 鍵、null 照清單慣例降級「—」）；新增模式整段隱藏（記錄尚未存在）；
// example 基線無此檔、零原行。
import { computed, ref, watch } from 'vue';
// WRAPPER fetcher（★直接路徑、不經 barrel、避 vite stale-export）
import { fetchAddIpRule, fetchUpdateIpRule } from '@/service/api/rev4-ip-rule';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'IpRuleOperateDrawer'
});

interface Props {
  /** 操作類型（add=新增／edit=編輯） */
  operateType: NaiveUI.TableOperateType;
  /** 編輯中的列資料 */
  rowData?: Api.SystemManage.IpRuleRecord | null;
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
  wbipType: Api.SystemManage.IpRuleType;
  wbipMemo: string;
  order: number | null;
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    wbipCidr: '',
    // ★類型預設 deny（tasks T016 拍板）
    wbipType: 'deny',
    wbipMemo: '',
    order: null
  };
}

// ★isCidrLike 寬鬆驗證（T016）：僅擋「空值」與「含空白」——IPv6 字面與 /128 等一律放行；
// 格式權威兜底＝後端 normalize_cidr（非法字面回 2222 invalidCidr、經攔截層 toast）——前端絕不自建嚴格 CIDR 正則拒合法輸入。
function isCidrLike(value: string): boolean {
  return value.length > 0 && !/\s/.test(value);
}

type RuleKey = Extract<keyof Model, 'wbipCidr' | 'wbipType'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  wbipCidr: {
    required: true,
    trigger: ['input', 'blur'],
    validator: (_rule, value: string) => (isCidrLike(value || '') ? true : new Error($t('page.manage.ipRule.form.cidr')))
  },
  wbipType: defaultRequiredRule
};

// 審計四項 null 降級（U10；照 index.vue renderNullable 語意：值缺→「—」＝page.manage.ipRule.empty）
function displayNullable(value: string | null | undefined) {
  return value ?? $t('page.manage.ipRule.empty');
}

// 類型二值選項（標籤走既有 ruleTypeMap i18n；computed 使語系切換即時生效——照 ip-rule-search 先例）
const ruleTypeOptions = computed<CommonType.Option<Api.SystemManage.IpRuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const { wbipCidr, wbipType, wbipMemo, order } = props.rowData;
    // memo null→空字串進 NInput（提交空字串後端落 None、契約 §3——來回等價、零漂移）
    model.value = { wbipCidr, wbipType, wbipMemo: wbipMemo ?? '', order };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // add/edit 分流（T016）：edit 帶 id 全量提交（四欄皆可改、契約 §3）；
  // error 即 return——拒因由共用攔截層 onError toast、此處零加工（E2）
  if (props.operateType === 'add') {
    const { error } = await fetchAddIpRule({
      wbipCidr: model.value.wbipCidr,
      wbipType: model.value.wbipType,
      wbipMemo: model.value.wbipMemo,
      order: model.value.order
    });
    if (error) {
      return;
    }
  } else {
    const rowId = props.rowData?.id;
    if (rowId === undefined) {
      return;
    }
    const { error } = await fetchUpdateIpRule({
      id: rowId,
      wbipCidr: model.value.wbipCidr,
      wbipType: model.value.wbipType,
      wbipMemo: model.value.wbipMemo,
      order: model.value.order
    });
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
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <!-- ★order＝「排序值」純顯示排序語意（島 F F1 any-match、零優先序暗示）；U10 欄序：排序值居首（user 拍板 2026-07-16） -->
        <NFormItem :label="$t('page.manage.ipRule.order')" path="order">
          <NInputNumber
            v-model:value="model.order"
            clearable
            class="w-full"
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
        <!-- U10 審計四項唯讀（僅編輯模式；user 拍板 2026-07-16）：純文字顯示、無 path 不進 form model、
             零 input 元件；資料源＝傳入列資料 rowData；null 照清單慣例降級「—」；新增模式整段隱藏（記錄尚未存在） -->
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
