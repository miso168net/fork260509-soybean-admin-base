import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils/storage';
import messages from './locale';

const i18n = createI18n({
  locale: localStg.get('lang') || 'zh-CN',
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
}

export const $t = i18n.global.t as App.I18n.$T;

// [rev3-inline I18N(iii) ⚠️aa BASE-WEB-I18N-WIRING ★ START] 唯一翻譯邊界：前端補 backend. 前綴（前綴歸屬 (c)）；未命中→vue-i18n 原生回原始 key（003 US2、i18n-key-convention §2/§5）
export function translateBackendMsg(msg: string): string {
  return $t(('backend.' + msg) as App.I18n.I18nKey);
}
// [rev3-inline I18N(iii) ⚠️aa END]

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;

  document?.querySelector('html')?.setAttribute('lang', locale);
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}
