import zhCN from './langs/zh-cn';
// [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：匯入繁中訊息字典（`zh-tw.ts`＝以 `App.I18n.Schema` 標型之全樹）
import zhTW from './langs/zh-tw';
import enUS from './langs/en-us';

const locales: Record<App.I18n.LangType, App.I18n.Schema> = {
  'zh-CN': zhCN,
  // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：註冊繁中訊息字典（插在兩項之間、免改末項補逗號）
  'zh-TW': zhTW,
  'en-US': enUS
};

export default locales;
