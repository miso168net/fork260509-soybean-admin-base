// [rev3-inline 013-xff-real-ip-forensics ★ U4] ip_confidence 七態下拉 option（三分頁共用 NSelect）
// value=wire literal（對齊 rust serde 七字串）、label=$t confidenceTag.<value>（隨語系切換 reactive）
import { $t } from '@/locales';

/** ip_confidence 七態 NSelect options（value 七 literal、label 走 i18n confidenceTag） */
export const confidenceOptions: { label: () => string; value: Api.SystemManage.IpConfidence }[] = [
  { label: () => $t('page.manage.audit.confidenceTag.cdn_verified'), value: 'cdn_verified' },
  { label: () => $t('page.manage.audit.confidenceTag.cdn_anchored'), value: 'cdn_anchored' },
  { label: () => $t('page.manage.audit.confidenceTag.proxy_clean'), value: 'proxy_clean' },
  { label: () => $t('page.manage.audit.confidenceTag.proxy_soft'), value: 'proxy_soft' },
  { label: () => $t('page.manage.audit.confidenceTag.direct'), value: 'direct' },
  { label: () => $t('page.manage.audit.confidenceTag.cdn_mismatch'), value: 'cdn_mismatch' },
  { label: () => $t('page.manage.audit.confidenceTag.fallback'), value: 'fallback' }
];
