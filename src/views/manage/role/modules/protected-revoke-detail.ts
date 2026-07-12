// BASE-WEB net-new (009-role-admin)：protectedRevoke 拒因明細呼叫端渲染（MODAL-WIRING (a) 呼叫端邏輯、
// R4 第 2 層、ADR 0050）。三 auth-modal（menu／button／endpoint）共用、避免三處重複。
// 讀業務錯誤信封 data.blocked[] → dialog 結構化列出被擋撤銷目標＋維度；與共用層 onError 泛化 toast 並存。
// ★我方新檔、零原行（example 基線無此檔、fork-delta-lint 對新檔豁免手標）。
import { h } from 'vue';
import { $t } from '@/locales';

/**
 * protectedRevoke（2222 `biz.role.protectedRevoke`）明細渲染。
 *
 * 僅當信封 msg＝`biz.role.protectedRevoke` 且 data.blocked 非空時彈 dialog 列出被擋目標；其餘錯誤路徑
 * （含無明細業務錯誤）零作用——維持共用層 onError 泛化 toast 既有行為（既有無明細錯誤路徑零改動）。
 *
 * @param envelope 業務錯誤信封（呼叫端傳 `error.response?.data`）
 */
export function showProtectedRevokeDetail(envelope?: App.Service.Response | null) {
  if (!envelope || envelope.msg !== 'biz.role.protectedRevoke') {
    return;
  }

  const blocked = (envelope.data as Api.SystemManage.ProtectedRevokeDetail | null)?.blocked;
  if (!blocked?.length) {
    return;
  }

  window.$dialog?.warning({
    title: $t('backend.biz.role.protectedRevoke'),
    content: () =>
      h(
        'div',
        { style: 'display:flex;flex-direction:column;gap:4px' },
        blocked.map(item => h('div', `${item.dimension}｜${item.target}`))
      ),
    positiveText: $t('common.confirm')
  });
}
