import zhCN from './langs/zh-cn';
import enUS from './langs/en-us';
// [rev4-inline I18N-WIRING(iv) 004-system-settings] zh-TW 全字典 locale（ADR 0028）
import zhTW from './langs/zh-tw';

const locales: Record<App.I18n.LangType, App.I18n.Schema> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  // [rev4-inline I18N-WIRING(iv) 004-system-settings] zh-TW 註冊入 locale map
  'zh-TW': zhTW
};

export default locales;
