import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui';
// [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：另起一行匯入元件庫繁中語系與日期語系（上一行既有匯入不改）
import { dateZhTW, zhTW } from 'naive-ui';
import type { NDateLocale, NLocale } from 'naive-ui';

export const naiveLocales: Record<App.I18n.LangType, NLocale> = {
  'zh-CN': zhCN,
  // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：註冊元件庫繁中語系（插在兩項之間、免改末項補逗號）
  'zh-TW': zhTW,
  'en-US': enUS
};

export const naiveDateLocales: Record<App.I18n.LangType, NDateLocale> = {
  'zh-CN': dateZhCN,
  // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：註冊元件庫繁中日期語系（插在兩項之間、免改末項補逗號）
  'zh-TW': dateZhTW,
  'en-US': dateEnUS
};
