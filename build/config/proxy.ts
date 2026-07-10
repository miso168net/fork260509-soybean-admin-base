import type { ProxyOptions } from 'vite';
import { bgRed, bgYellow, green, lightBlue } from 'kolorist';
import { consola } from 'consola';
import { createServiceConfig } from '../../src/utils/service';

/**
 * Set http proxy
 *
 * @param env - The current env
 * @param enable - If enable http proxy
 */
export function createViteProxy(env: Env.ImportMeta, enable: boolean) {
  const isEnableHttpProxy = enable && env.VITE_HTTP_PROXY === 'Y';

  if (!isEnableHttpProxy) return undefined;

  const isEnableProxyLog = env.VITE_PROXY_LOG === 'Y';

  const { baseURL, proxyPattern, other } = createServiceConfig(env);

  // [rev4-inline ★BASE-WEB-DEVPROXY-WIRING(ii) 008-ip-gate] 原行: const proxy: Record<string, ProxyOptions> = createProxyItem({ baseURL, proxyPattern }, isEnableProxyLog);
  // dev proxy target 改讀 env key VITE_PROXY_TARGET（直指 rust-api、消除雙穿 front-nginx；B-079/ADR 0042）
  const proxy: Record<string, ProxyOptions> = createProxyItem({ baseURL, proxyPattern }, isEnableProxyLog, env.VITE_PROXY_TARGET);

  other.forEach(item => {
    Object.assign(proxy, createProxyItem(item, isEnableProxyLog));
  });

  return proxy;
}

// [rev4-inline ★BASE-WEB-DEVPROXY-WIRING(ii) 008-ip-gate] 原行: function createProxyItem(item: App.Service.ServiceConfigItem, enableLog: boolean) {
function createProxyItem(item: App.Service.ServiceConfigItem, enableLog: boolean, target?: string) {
  const proxy: Record<string, ProxyOptions> = {};

  proxy[item.proxyPattern] = {
    // [rev4-inline ★BASE-WEB-DEVPROXY-WIRING(ii) 008-ip-gate] 原行: target: item.baseURL,
    // 預設 proxy 用 VITE_PROXY_TARGET；other（upstream demo 示範服務）無傳入、保留 item.baseURL 語意
    target: target ?? item.baseURL,
    changeOrigin: true,
    configure: (_proxy, options) => {
      _proxy.on('proxyReq', (_proxyReq, req, _res) => {
        if (!enableLog) return;

        const requestUrl = `${lightBlue('[proxy url]')}: ${bgYellow(` ${req.method} `)} ${green(`${item.proxyPattern}${req.url}`)}`;

        const proxyUrl = `${lightBlue('[real request url]')}: ${green(`${options.target}${req.url}`)}`;

        consola.log(`${requestUrl}\n${proxyUrl}`);
      });
      _proxy.on('error', (_err, req, _res) => {
        if (!enableLog) return;
        consola.log(bgRed(`Error: ${req.method} `), green(`${options.target}${req.url}`));
      });
    },
    rewrite: path => path.replace(new RegExp(`^${item.proxyPattern}`), '')
  };

  return proxy;
}
