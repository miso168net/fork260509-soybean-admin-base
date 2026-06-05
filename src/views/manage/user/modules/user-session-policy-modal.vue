<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchUpdateUserSessionPolicy } from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'UserSessionPolicyModal'
});

interface Props {
  /** the target user id */
  userId: string;
  /** the user's current per-account session policy */
  currentPolicy: string;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  required: true
});

const submitting = ref(false);

const selectedPolicy = ref<Api.SystemManage.SessionPolicy>('inherit');

const policyOptions = computed(() =>
  (['inherit', 'on', 'off'] as Api.SystemManage.SessionPolicy[]).map(value => ({
    label: $t(`page.manage.user.sessionPolicyMap.${value}`),
    value
  }))
);

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  submitting.value = true;

  const { error } = await fetchUpdateUserSessionPolicy({
    userId: props.userId,
    policy: selectedPolicy.value
  });

  submitting.value = false;

  if (!error) {
    emit('submitted');
    closeModal();
    window.$message?.success($t('page.manage.user.setSessionPolicySuccess'));
  }
}

// re-hydrate the local selection from the prop on open — reset-on-open contract is explicit here (mirrors MenuAuthModal)
watch(visible, val => {
  if (val) {
    selectedPolicy.value = (props.currentPolicy as Api.SystemManage.SessionPolicy) ?? 'inherit';
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="$t('page.manage.user.setSessionPolicy')"
    class="w-400px"
  >
    <NSelect v-model:value="selectedPolicy" :options="policyOptions" />
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
