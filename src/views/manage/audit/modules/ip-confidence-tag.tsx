// [rev3-inline 013-xff-real-ip-forensics ★] ip_confidence 七態 NTag 著色（三分頁共用）
// honest wire：null→顯 empty(—) 無 tag；七態文字走 i18n confidenceTag.<value>
import { NTag } from 'naive-ui';
import { $t } from '@/locales';

type TagType = 'success' | 'info' | 'warning' | 'error' | 'default';

// 七態著色（C2 拍板）：已驗證/代理乾淨→success；位置錨定/直連→info；代理軟降→warning；不符→error；退回→default(灰)
const confidenceTypeMap: Record<Api.SystemManage.IpConfidence, TagType> = {
  cdn_verified: 'success',
  proxy_clean: 'success',
  cdn_anchored: 'info',
  direct: 'info',
  proxy_soft: 'warning',
  cdn_mismatch: 'error',
  fallback: 'default'
};

/** 渲染 ip_confidence NTag；null→顯 empty(—) 無 tag */
export function renderConfidenceTag(value: Api.SystemManage.IpConfidence | null) {
  if (value === null || value === undefined) {
    return <span class="text-gray-400">{$t('page.manage.audit.empty')}</span>;
  }
  return <NTag type={confidenceTypeMap[value]}>{$t(`page.manage.audit.confidenceTag.${value}`)}</NTag>;
}
