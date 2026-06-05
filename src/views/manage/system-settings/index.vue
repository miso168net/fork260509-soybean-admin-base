<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchGetSystemSettings, fetchUpdateSystemSetting } from '@/service/api';
import { $t } from '@/locales';

const SINGLE_SESSION_KEY = 'single_session_default';

const singleSessionDefault = ref(false);
const description = ref<string | null>(null);
const loading = ref(false);

async function loadSettings() {
  const { data, error } = await fetchGetSystemSettings();
  if (error || !data) {
    return;
  }
  const row = data.find(item => item.settingKey === SINGLE_SESSION_KEY);
  if (row) {
    singleSessionDefault.value = row.settingValue === 'on';
    description.value = row.description;
  }
}

async function handleToggleSingleSession(checked: boolean) {
  loading.value = true;
  const { error } = await fetchUpdateSystemSetting({
    key: SINGLE_SESSION_KEY,
    value: checked ? 'on' : 'off'
  });
  loading.value = false;

  if (error) {
    // request layer already surfaced the error toast; revert the optimistic switch
    singleSessionDefault.value = !checked;
    return;
  }

  singleSessionDefault.value = checked;
  window.$message?.success($t('page.manage.systemSettings.updateSuccess'));
}

onMounted(loadSettings);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard :title="$t('page.manage.systemSettings.title')" :bordered="false" size="small" class="card-wrapper">
      <NFlex align="center" justify="space-between" class="flex-wrap gap-12px">
        <div class="flex-col gap-4px">
          <span class="text-16px font-medium">{{ $t('page.manage.systemSettings.singleSessionDefault') }}</span>
          <span class="text-13px text-#999">
            {{ description || $t('page.manage.systemSettings.singleSessionDefaultTip') }}
          </span>
        </div>
        <NSwitch
          :value="singleSessionDefault"
          :loading="loading"
          @update:value="handleToggleSingleSession"
        />
      </NFlex>
    </NCard>
  </div>
</template>

<style scoped></style>
