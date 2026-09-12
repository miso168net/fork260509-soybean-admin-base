<script setup lang="ts">
import { computed } from 'vue';
import type { VNode } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useSvgIcon } from '@/hooks/common/icon';
// [rev6-inline BASE-WEB-LOGOUT-UX-WIRING+ 003-auth-session] 登出前撤銷接線 import：下二行為純新增（localStg 取 refresh 憑證、fetchLogout 走 WRAPPER 直接路徑）；既有 $t import 行逐字未動、故只圈界不記原行
import { localStg } from '@/utils/storage';
import { fetchLogout } from '@/service/api/rev6-auth';
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
    // [rev6-inline BASE-WEB-LOGOUT-UX-WIRING(i) 003-auth-session] 改 async——登出前 best-effort 通知後端撤銷；原行: onPositiveClick: () => {
    onPositiveClick: async () => {
      // 帶 refresh 憑證打 /auth/logout（端點冪等恆 0000、不必看結果）。fetchLogout 走 createFlatRequest：
      // 逾時與網路錯都回 `{ data, error }`、從不 reject——「失敗不得阻斷本地清理」的保證住在那道不拋契約
      // （論證見 rev6-auth.ts 之 LOGOUT_TIMEOUT_MS doc），不在下面這道 catch。catch 的真實射程＝任何非預期
      // 例外（如 localStorage 被瀏覽器擋下而拋），令它同樣不阻斷下一行的本地清理（憲法 §III.2 LOGOUT-UX(i)）。
      try {
        await fetchLogout(localStg.get('refreshToken') || '');
      } catch {
        /* 非預期例外一律吞——本地清理必須照跑 */
      }
      // [rev6-inline BASE-WEB-LOGOUT-UX-WIRING+ 003-auth-session] 下一行＝基線既有行、逐字與位置皆未動（新增的是本註解）；不記修改型錨＝不預先授權它離開本檔
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
