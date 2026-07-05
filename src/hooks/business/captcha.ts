import { computed } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_PHONE } from '@/constants/reg';
import { fetchSendCaptcha } from '@/service/api/rev4-auth-stub';
import { $t } from '@/locales';

export function useCaptcha() {
  const { loading, startLoading, endLoading } = useLoading();
  const { count, start, stop, isCounting } = useCountDown(10);

  const label = computed(() => {
    let text = $t('page.login.codeLogin.getCode');

    const countingLabel = $t('page.login.codeLogin.reGetCode', { time: count.value });

    if (loading.value) {
      text = '';
    }

    if (isCounting.value) {
      text = countingLabel;
    }

    return text;
  });

  function isPhoneValid(phone: string) {
    if (phone.trim() === '') {
      window.$message?.error?.($t('form.phone.required'));

      return false;
    }

    if (!REG_PHONE.test(phone)) {
      window.$message?.error?.($t('form.phone.invalid'));

      return false;
    }

    return true;
  }

  async function getCaptcha(phone: string) {
    const valid = isPhoneValid(phone);

    if (!valid || loading.value) {
      return;
    }

    startLoading();

    // request
    // [rev4-inline ★AUTH-WIRING(c) 005-auth-login] 原行: await new Promise(resolve => {
    // [rev4-inline ★AUTH-WIRING(c) 005-auth-login] 原行: setTimeout(resolve, 500);
    // [rev4-inline ★AUTH-WIRING(c) 005-auth-login] 原行: window.$message?.success?.($t('page.login.codeLogin.sendCodeSuccess'));
    const { error } = await fetchSendCaptcha({ phone });

    // ★成功才啟動倒數；stub 恆回 2222（error 非空）→ 不啟動、toast 由攔截器 onError 自動顯示。
    if (!error) {
      start();
    }

    endLoading();
  }

  return {
    label,
    start,
    stop,
    isCounting,
    loading,
    getCaptcha
  };
}
