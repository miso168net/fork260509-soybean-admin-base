import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils/storage';
import messages from './locale';

const i18n = createI18n({
  // [rev6-inline BASE-WEB-I18N-WIRING(iii) 007-user-password-admin] 未選過語言之預設改繁中（選過者照 lang 儲存值）；原行: locale: localStg.get('lang') || 'zh-CN',
  locale: localStg.get('lang') || 'zh-TW',
  fallbackLocale: 'en',
  messages,
  legacy: false
});

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n);
  // [rev6-inline BASE-WEB-I18N-WIRING(iii)+ 007-user-password-admin] 下一行為純新增：首開即以現行語言同步 `<html lang>`（`index.html` 為靜態 zh-CN、`setLocale` 只在切換時改寫）
  document?.querySelector('html')?.setAttribute('lang', i18n.global.locale.value);
}

export const $t = i18n.global.t as App.I18n.$T;

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;

  document?.querySelector('html')?.setAttribute('lang', locale);
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}
