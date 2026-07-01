import api from './axios';

const toArr = (d: any): any[] => Array.isArray(d) ? d : (d?.recordset ?? []);
const g = (url: string) => (p?: any) => api.get(url, { params: p }).then((r: any) => toArr(r.data));
const po = (url: string) => (d?: any) => api.post(url, d).then((r: any) => r.data);
const pa = (url: string) => (d?: any) => api.patch(url, d).then((r: any) => r.data);

export const adminApi = {
  accountModLog: g('/audit/account-modification-log'),
  exportAccountModLog: g('/audit/account-modification-log/export'),
  changeLog: g('/audit/change-log'),
  exportChangeLog: g('/audit/change-log/export'),
  duplicateRemovalLog: g('/audit/duplicate-removal'),
  addDuplicateNote: po('/audit/duplicate-removal/annotate'),
  exportDuplicateRemovalLog: g('/audit/duplicate-removal/export'),
  restoreDuplicate: pa('/audit/duplicate-removal/restore'),
  userActionLog: g('/audit/user-action'),
  annotateUserAction: po('/audit/user-action/annotate'),
  exportUserActionLog: g('/audit/user-action/export'),
  dashboardSummary: () => api.get('/admin/dashboard-summary').then((r: any) => { const p = r.data; const rec = Array.isArray(p?.recordset) ? p.recordset[0] : Array.isArray(p?.data) ? p.data[0] : (p && typeof p === 'object' && !Array.isArray(p) ? p : {}); return rec ?? {}; }),
  notifications: g('/admin/notifications'),
  updateNotification: (id: string, d: any) => api.patch(`/admin/notifications/${id}/status`, d).then((r: any) => r.data),
  settings: g('/settings'),
  updateSettings: pa('/settings'),
  userLogReport: g('/userlog'),
  exportUserLogReport: g('/userlog/export'),
  auditSupport: g('/audit/support'),
  exportAuditSupport: g('/audit/support/export'),
};
