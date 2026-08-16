<script setup lang="ts">
// [rev5-inline MANAGE-IP-RULE-VIEW+ 004-ip-trust-anchor] IP 規則新增／編輯抽屜（新增檔；基線 example 無此路徑、零原行）。
// 四欄＝排序值（NInputNumber，可空可清、★整數且夾 i32 值域——理由見模板該欄註解）／網段（NInput，必填）
// ／規則類型（NSelect，必填、★預設 deny）
// ／備註（NInput textarea，可空；空字串送出後端 `normalize_memo` 落 None，來回等價）。
// 形照本 repo `views/manage/role/modules/role-operate-drawer.vue`（NDrawer＋useNaiveForm＋add/edit 分流）。
// ★寫成功後端自行重載判定面＋發門鈴 ⇒ 本抽屜零追加「生效」呼叫，只 emit submitted 讓清單刷新。
// ★拒因一律交共用攔截層 toast（invalidCidr／invalidRuleType／conflict／selfLock／notFound），此處零加工。
// ★備註為自由文字：編輯模式回填走 v-model 進 NInput（值，非標記），顯示端一律純文字插值（FR-038）。
// rev4: 高度參照 rev4 之 ip-rule-operate-drawer.vue（欄序、寬鬆網段驗證、編輯模式審計四項唯讀）；
// rev5 差異＝型別取 `Api.IpRule.*` 獨立命名空間。
import { computed, ref, watch } from 'vue';
// WRAPPER fetcher：★直接路徑、不經 barrel
import { fetchAddIpRule, fetchUpdateIpRule } from '@/service/api/rev5-ip-rule';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'IpRuleOperateDrawer'
});

interface Props {
  /** 操作類型（add＝新增／edit＝編輯） */
  operateType: NaiveUI.TableOperateType;
  /** 編輯中的列資料 */
  rowData?: Api.IpRule.RuleRecord | null;
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
    // ★類型預設 deny：新增規則的常見意圖是阻擋；預設 allow 則手滑送出會直接開一道放行口
    wbipType: 'deny',
    wbipMemo: '',
    order: null
  };
}

/**
 * 網段欄的**寬鬆**前端驗證：只擋「空」與「含空白」。
 *
 * ★刻意不在前端自建嚴格 CIDR 正則：格式權威是後端 `normalize_cidr`（IPv4／IPv6 皆吃、非法字面回
 * `2222 biz.ipRule.invalidCidr`）。前端若自寫一套，遲早會把後端接受的合法字面（例如 IPv6 壓縮形、
 * `/128`）擋在門外，而那種誤擋沒有任何錯誤訊息能解釋。
 */
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

/** 審計四項的 null 降級（與清單同語意：值缺 → 破折號） */
function displayNullable(value: string | null | undefined) {
  return value ?? $t('page.manage.ipRule.empty');
}

const ruleTypeOptions = computed<CommonType.Option<Api.IpRule.RuleType>[]>(() => [
  { label: $t('page.manage.ipRule.ruleTypeMap.allow'), value: 'allow' },
  { label: $t('page.manage.ipRule.ruleTypeMap.deny'), value: 'deny' }
]);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    const { wbipCidr, wbipType, wbipMemo, order } = props.rowData;
    // memo 的 null 以空字串進 NInput（送出時空字串在後端落回 None，來回無漂移）
    model.value = { wbipCidr, wbipType, wbipMemo: wbipMemo ?? '', order };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  // edit 走全量提交（四欄皆可改）；error 即 return——拒因 toast 由共用攔截層負責
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
  <NDrawer v-model:show="visible" display-directive="show" :width="380">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <!-- ★排序值＝純顯示語意，不參與判定（島 F F1 any-match） -->
        <!--
          ★`precision`／`min`／`max` 三者是**必要**、不是美化：後端 `IpRuleAddReq.order` 型為
          `Option<i32>`，而該 DTO 的 `#[serde(default)]` 是**容器級**——只救「欄缺席」，不救
          「欄在但型別對不上」。小數（`1.5`）或 i32 越界（`3000000000`）會被 serde 判成
          `JsonDataError`，整個請求隨即被 `json_or_default` 收斂成 `IpRuleAddReq::default()`，
          `wbipType` 變空字串、撞上 add 端第一道守門 `validate_wbip_type` ⇒ 使用者收到的是
          **指向錯誤欄位**的「規則類型不正確」（類型明明選對了），且該訊息無從解釋。實測：
          `order:1.5` 與 `order:3000000000` 皆回 `2222 biz.ipRule.invalidRuleType`。
          於是在**能指名欄位的唯一一層**（本欄）夾住值域，讓非法值在送出前就停在這一格。
          上下界取 i32 值域本身、不另立業務下限：`order` 欄在 schema 為 nullable `integer`
          且無 CHECK，收窄成「非負」會是新的業務約束＝拍板級，不在本刀射程。
          rev4: 同欄亦無 precision（`ip-rule-operate-drawer.vue`），但誤導訊息這一段源自 rev5
          自有的 `json_or_default` 收斂設計，藍本相同不代表結論相同。
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
        <!-- 編輯模式才顯示的審計四項：純文字唯讀、無 path 不進 form model；新增模式整段隱藏（記錄尚未存在） -->
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
