import { computed } from 'vue';
import { useCountDown, useLoading } from '@sa/hooks';
import { REG_PHONE } from '@/constants/reg';
// [rev5-inline BASE-WEB-AUTH-WIRING(c)+ 003-auth-session] 送碼 stub wrapper import（直接路徑、
// 避 barrel stale-export——沿 rev5-auth.ts 檔頭自陳）：下一行為純新增。
import { fetchSendCaptcha } from '@/service/api/rev5-auth';
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
    // [rev5-inline BASE-WEB-AUTH-WIRING(c)] 改打 /auth/sendCaptcha 誠實 stub、移除 500ms 假延遲與假成功 toast（rev4: 同形接線；★hook 對外簽名不變——憲法 §III.2 (c) 收窄）；原行: await new Promise(resolve => {
    // [rev5-inline BASE-WEB-AUTH-WIRING(c)] 原行: setTimeout(resolve, 500);
    // [rev5-inline BASE-WEB-AUTH-WIRING(c)] 原行: window.$message?.success?.($t('page.login.codeLogin.sendCodeSuccess'));
    const { error } = await fetchSendCaptcha(phone);

    // [rev5-inline BASE-WEB-AUTH-WIRING(c)+ 003-auth-session] 成功才啟動倒數（守門圈界；下三行含
    // 閉合為新增）：stub 恆回 2222（error 非空）→ 不啟動——倒數是「已送碼、防重送」的 UI 承諾，
    // 送碼被拒仍倒數＝另一種假成功；錯誤 toast 由攔截器經 backend.biz.auth.notSupported i18n
    // 轉譯自動顯示、此處不重複顯錯（rev4: 同拍板）。
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
