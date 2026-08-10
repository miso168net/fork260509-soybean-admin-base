<script setup lang="ts">
import { computed } from 'vue';
import type { VNode } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useSvgIcon } from '@/hooks/common/icon';
// [rev5-inline BASE-WEB-LOGOUT-UX-WIRING+ 003-auth-session] 登出前撤銷接線 import：下二行為純新增（localStg 讀 refresh 憑證＋fetchLogout WRAPPER），插於既有 $t import 之前——該基線行逐字未動，故走新增型圈界、不記修改型錨。
import { localStg } from '@/utils/storage';
import { fetchLogout } from '@/service/api/rev5-auth';
import { $t } from '@/locales';

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
const { routerPushByKey, toLogin } = useRouterPush();
const { SvgIconVNode } = useSvgIcon();

function loginOrRegister() {
  toLogin();
}

type DropdownKey = 'user-center' | 'logout';

type DropdownOption =
  | {
      key: DropdownKey;
      label: string;
      icon?: () => VNode;
    }
  | {
      type: 'divider';
      key: string;
    };

const options = computed(() => {
  const opts: DropdownOption[] = [
    {
      label: $t('common.userCenter'),
      key: 'user-center',
      icon: SvgIconVNode({ icon: 'ph:user-circle', fontSize: 18 })
    },
    {
      type: 'divider',
      key: 'divider'
    },
    {
      label: $t('common.logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'ph:sign-out', fontSize: 18 })
    }
  ];

  return opts;
});

function logout() {
  window.$dialog?.info({
    title: $t('common.tip'),
    content: $t('common.logoutConfirm'),
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
    // [rev5-inline BASE-WEB-LOGOUT-UX-WIRING(i)] 改 async——登出前 best-effort 通知後端撤銷（rev4: 同形接線）；原行: onPositiveClick: () => {
    onPositiveClick: async () => {
      // 帶 refresh 憑證呼 /auth/logout（端點冪等：垃圾／過期票亦 0000、毋須分辨結果）
      try {
        await fetchLogout(localStg.get('refreshToken') || '');
      } catch {
        // 後端 logout 失敗：吞掉——「失敗不得阻斷 resetStore()」（憲法 §III.2 用途 (i) 逐字要求）
      }
      // [rev5-inline BASE-WEB-LOGOUT-UX-WIRING+ 003-auth-session] 撤銷通知後續走本地清理：下一行為基線既有行、逐字與位置皆未動（本註解本身才是新增），故不記修改型錨——記了等於預先授權它從本檔消失，而它正是「失敗不得阻斷 resetStore()」的那一行。
      authStore.resetStore();
    }
  });
}

function handleDropdown(key: DropdownKey) {
  if (key === 'logout') {
    logout();
  } else {
    // If your other options are jumps from other routes, they will be directly supported here
    routerPushByKey(key);
  }
}
</script>

<template>
  <NButton v-if="!authStore.isLogin" quaternary @click="loginOrRegister">
    {{ $t('page.login.common.loginOrRegister') }}
  </NButton>
  <NDropdown v-else placement="bottom" trigger="click" :options="options" @select="handleDropdown">
    <div>
      <ButtonIcon>
        <SvgIcon icon="ph:user-circle" class="text-icon-large" />
        <span class="text-16px font-medium">{{ authStore.userInfo.userName }}</span>
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
