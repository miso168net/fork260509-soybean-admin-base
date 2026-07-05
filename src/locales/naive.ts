// [rev4-inline I18N-WIRING(iv) 004-system-settings] 原行: import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui';
import { dateEnUS, dateZhCN, dateZhTW, enUS, zhCN, zhTW } from 'naive-ui';
import type { NDateLocale, NLocale } from 'naive-ui';

export const naiveLocales: Record<App.I18n.LangType, NLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  // [rev4-inline I18N-WIRING(iv) 004-system-settings] zh-TW naive locale
  'zh-TW': zhTW
};

export const naiveDateLocales: Record<App.I18n.LangType, NDateLocale> = {
  'zh-CN': dateZhCN,
  'en-US': dateEnUS,
  // [rev4-inline I18N-WIRING(iv) 004-system-settings] zh-TW naive date locale
  'zh-TW': dateZhTW
};
