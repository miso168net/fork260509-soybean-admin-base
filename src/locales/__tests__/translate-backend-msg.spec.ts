// [rev3-inline I18N(iii) ⚠️aa BASE-WEB-I18N-WIRING ★ START] translateBackendMsg 元件/單元測（003 US2、tasks.md T012(a)/(b)、SC-005/SC-006）
//
// 為何此形：translateBackendMsg 是 wiring-thin 純函式 ＝ `$t(('backend.' + msg))`（src/locales/index.ts）。
// 本測以「真實 vue-i18n 11.4.2 ＋ 真實 zh-cn/en-us langs backend 物件」重建同一翻譯邊界，
// 逐 locale 斷言「顯示文字＝該 key 之譯文」(SC-005) 與「未知 key graceful 回原始 backend.<key> 字串」(SC-006)。
// 走既有 devDep `tsx`（無新增 npm dep）；不引入 vitest/@vue/test-utils。
// 不直接 import src/locales/index.ts（其載入鏈 @/utils/storage → import.meta.env／localStorage 需瀏覽器/Vite 環境，
// 非 tsx 純 node 可解）；改以同一 createI18n 設定＋同一 langs 資料＋同一 'backend.' 前綴公式覆蓋等價行為。

import { createI18n } from 'vue-i18n';
import zhCN from '../langs/zh-cn';
import enUS from '../langs/en-us';

// 同 src/locales/index.ts 的 createI18n 設定（locale 預設 zh-CN、fallback en、legacy:false）；
// missing/fallback warn 關閉只為靜默 console，行為不變（未命中仍回原始 key）。
// messages 整體 cast 為 any：避免 vue-tsc 對龐大 App.I18n.Schema literal 做深度泛型推導（TS2589）。
const messages: any = { 'zh-CN': zhCN, 'en-US': enUS };
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
  legacy: false,
  missingWarn: false,
  fallbackWarn: false
});

const $t = i18n.global.t as (key: string) => string;

// 與 translateBackendMsg 等價公式（前端補 backend. 前綴 → vue-i18n $t）
function translateBackendMsg(msg: string): string {
  return $t('backend.' + msg);
}

let failures = 0;
function expectEq(label: string, got: unknown, want: unknown) {
  if (got === want) {
    console.log(`PASS  ${label} => ${JSON.stringify(got)}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${label} => got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}

// (a) 命中＝雙語各驗（SC-005）：13 固定碼抽樣於 zh-CN / en-US 回正確譯文
i18n.global.locale.value = 'zh-CN';
expectEq("zh-CN translateBackendMsg('common.success')", translateBackendMsg('common.success'), '请求成功');
expectEq("zh-CN translateBackendMsg('auth.login.failed')", translateBackendMsg('auth.login.failed'), '用户名或密码错误');
expectEq("zh-CN translateBackendMsg('auth.token.expired')", translateBackendMsg('auth.token.expired'), '登录已过期');
expectEq("zh-CN translateBackendMsg('system.forbidden')", translateBackendMsg('system.forbidden'), '权限不足');

i18n.global.locale.value = 'en-US';
expectEq("en-US translateBackendMsg('common.success')", translateBackendMsg('common.success'), 'Success');
expectEq(
  "en-US translateBackendMsg('auth.login.failed')",
  translateBackendMsg('auth.login.failed'),
  'Incorrect username or password'
);
expectEq("en-US translateBackendMsg('auth.token.expired')", translateBackendMsg('auth.token.expired'), 'Login expired');
expectEq("en-US translateBackendMsg('system.forbidden')", translateBackendMsg('system.forbidden'), 'Permission denied');

// (b) fallback（SC-006）：未知 key graceful → 回原始 'backend.<key>' 字串（非空白、非崩潰、非通用替代）
i18n.global.locale.value = 'zh-CN';
expectEq(
  "zh-CN fallback translateBackendMsg('biz.unknown.x')",
  translateBackendMsg('biz.unknown.x'),
  'backend.biz.unknown.x'
);
i18n.global.locale.value = 'en-US';
expectEq(
  "en-US fallback translateBackendMsg('biz.unknown.x')",
  translateBackendMsg('biz.unknown.x'),
  'backend.biz.unknown.x'
);

if (failures > 0) {
  console.error(`\ntranslate-backend-msg: ${failures} assertion(s) FAILED`);
  process.exit(1);
}
console.log('\ntranslate-backend-msg: all assertions passed');
// [rev3-inline I18N(iii) ⚠️aa END]
