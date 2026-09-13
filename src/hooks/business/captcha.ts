import { computed } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_PHONE } from '@/constants/reg';
import { $t } from '@/locales';
// [rev6-inline BASE-WEB-AUTH-WIRING(c)+ 003-auth-session] 下一行為純新增：送碼 stub wrapper 以直接路徑 import（避 barrel 於 vite HMR 殘留舊 export、沿 rev6-auth.ts 檔頭自陳）。
import { fetchSendCaptchaStub } from '@/service/api/rev6-auth';

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
    // [rev6-inline BASE-WEB-AUTH-WIRING(c) 003-auth-session] 送碼改走 sendCaptcha stub wrapper（後端恆 2222）、拿掉 upstream 的 500ms 假等待與假成功提示；hook 簽名與回傳物照舊（§III.2 (c) 範圍內）；原行: await new Promise(resolve => {
    // [rev6-inline BASE-WEB-AUTH-WIRING(c) 003-auth-session] 原行: setTimeout(resolve, 500);
    // [rev6-inline BASE-WEB-AUTH-WIRING(c) 003-auth-session] 原行: window.$message?.success?.($t('page.login.codeLogin.sendCodeSuccess'));
    const { error } = await fetchSendCaptchaStub(phone);

    // [rev6-inline BASE-WEB-AUTH-WIRING(c)+ 003-auth-session START] 倒數只在送碼真的成功後才啟動：stub 現階段恆回 2222（error 有值）→ 不倒數。
    // 倒數在 UI 上代表「碼已送出、暫時別重送」，被拒仍倒數等於換個形式的假成功；拒因 toast 由攔截器經 backend.* 轉譯自動顯示，這裡不再疊一層。
    if (!error) {
      start();
    }
    // [rev6-inline BASE-WEB-AUTH-WIRING(c)+ 003-auth-session END]

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
