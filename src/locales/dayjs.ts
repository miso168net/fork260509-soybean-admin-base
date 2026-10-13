import { locale } from 'dayjs';
import 'dayjs/locale/zh-cn';
// [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：載入日期庫繁中語系（dayjs 內建、零新依賴）
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';
import { localStg } from '@/utils/storage';

/**
 * Set dayjs locale
 *
 * @param lang
 */
// [rev6-inline BASE-WEB-I18N-WIRING(iii) 007-user-password-admin] 未選過語言之預設改繁中；原行: export function setDayjsLocale(lang: App.I18n.LangType = 'zh-CN') {
export function setDayjsLocale(lang: App.I18n.LangType = 'zh-TW') {
  const localMap = {
    'zh-CN': 'zh-cn',
    // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：繁中對映日期庫 `zh-tw` 語系（插在兩項之間、免改末項補逗號）
    'zh-TW': 'zh-tw',
    'en-US': 'en'
  } satisfies Record<App.I18n.LangType, string>;

  // [rev6-inline BASE-WEB-I18N-WIRING(iii) 007-user-password-admin] 退路與預設參數同改繁中；原行: const l = lang || localStg.get('lang') || 'zh-CN';
  const l = lang || localStg.get('lang') || 'zh-TW';

  locale(localMap[l]);
}
