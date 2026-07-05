import { locale } from 'dayjs';
import 'dayjs/locale/zh-cn';
// [rev4-inline I18N-WIRING(iv) 004-system-settings] dayjs zh-tw locale（ADR 0028）
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import { localStg } from '@/utils/storage';

/**
 * Set dayjs locale
 *
 * @param lang
 */
export function setDayjsLocale(lang: App.I18n.LangType = 'zh-CN') {
  const localMap = {
    'zh-CN': 'zh-cn',
    'en-US': 'en',
    // [rev4-inline I18N-WIRING(iv) 004-system-settings] zh-TW → dayjs zh-tw
    'zh-TW': 'zh-tw'
  } satisfies Record<App.I18n.LangType, string>;

  const l = lang || localStg.get('lang') || 'zh-CN';

  locale(localMap[l]);
}
