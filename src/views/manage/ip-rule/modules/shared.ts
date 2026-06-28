// [rev3-inline 022-ip-access-control MODAL-WIRING] IP 規則頁共用：下拉選項（raw i18n-key、用 translateOptions 取譯）+ 前端 CIDR 基本格式驗證
// translateOptions 在使用點呼叫（label＝i18n key、locale reactive），沿 constants/business enableStatusOptions 範式。

/** 規則類型下拉（白名單放行 / 黑名單阻擋）；對齊 rust rule_type∈{allow,deny} */
export const ruleTypeOptions: CommonType.Option<Api.SystemManage.IpRuleType, App.I18n.I18nKey>[] = [
  { value: 'allow', label: 'page.manage.ipRule.ruleTypeMap.allow' },
  { value: 'deny', label: 'page.manage.ipRule.ruleTypeMap.deny' }
];

/** 手動解鎖維度下拉（帳號 / 來源 IP）；對齊 rust UnlockReq.dimension∈{user,ip} */
export const unlockDimensionOptions: CommonType.Option<Api.SystemManage.IpRuleUnlockDimension, App.I18n.I18nKey>[] = [
  { value: 'user', label: 'page.manage.ipRule.unlock.dimensionMap.user' },
  { value: 'ip', label: 'page.manage.ipRule.unlock.dimensionMap.ip' }
];

/**
 * 前端 CIDR 基本格式驗證（體驗層、寬鬆）：接受 IPv4/IPv6 的 bare IP（後端視 /32、/128）與帶 prefix 的網段。
 * ★ 後端 `normalize_cidr`（IpNetwork::from_str）為权威兜底（畸形→2222 biz.ipRule.invalidCidr）；此處僅即時擋明顯錯字。
 */
export function isCidrLike(value: string): boolean {
  const v = value.trim();
  if (!v) {
    return false;
  }

  const slash = v.indexOf('/');
  const addr = slash === -1 ? v : v.slice(0, slash);
  const isV6 = addr.includes(':');

  if (slash !== -1) {
    const prefix = v.slice(slash + 1);
    if (!/^\d+$/.test(prefix)) {
      return false;
    }
    const p = Number(prefix);
    if (isV6 ? p > 128 : p > 32) {
      return false;
    }
  }

  if (isV6) {
    return /^[0-9a-fA-F:]+$/.test(addr);
  }

  // IPv4：四段、每段 0-255
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(addr)) {
    return false;
  }
  return addr.split('.').every(octet => Number(octet) <= 255);
}
