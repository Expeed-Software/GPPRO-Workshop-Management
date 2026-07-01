import api from './axios';

const toArr = (d: any): any[] => Array.isArray(d) ? d : (d?.recordset ?? []);

export const bankingApi = {
  bankBook: (params?: any) => api.get('/banking/book-details', { params }).then((r: any) => toArr(r.data)),
  cbpBook: (params?: any) => api.get('/reports/banking/cbp-book', { params }).then((r: any) => toArr(r.data)),
  reconDetails: (params?: any) => api.get('/banking/reconcile', { params }).then((r: any) => toArr(r.data)),
  saveRecon: (data: any) => api.post('/banking/reconcile', data).then((r: any) => r.data),
  importStatement: (data: any) => api.post('/banking/reconciliation/import', data).then((r: any) => r.data),
  saveReconById: (reconId: string, data: any) => api.patch(`/banking/reconciliation/${reconId}/save`, data).then((r: any) => r.data),
  reconAttachments: (reconId: string) => api.get(`/banking/reconciliation/${reconId}/attachments`).then((r: any) => r.data),
  uploadAttachment: (reconId: string, data: any) => api.post(`/banking/reconciliation/${reconId}/attachments`, data).then((r: any) => r.data),
  deleteAttachment: (id: string) => api.delete(`/banking/attachments/${id}`).then((r: any) => r.data),
  bankAccountsForRecon: () => api.get('/banking/accounts/recon-list').then((r: any) => toArr(r.data)),
  reconLog: (params?: any) => api.get('/banking/recon-log', { params }).then((r: any) => r.data),
  pendingBillsLetter: (params?: any) => api.get('/reports/pending-bills-letter', { params }).then((r: any) => r.data),
  auditLogs: (params?: any) => api.get('/finance/audit/logs', { params }).then((r: any) => r.data),
  resolveAuditLog: (data: any) => api.post('/finance/audit/logs/resolve', data).then((r: any) => r.data),
  missingSerials: (params?: any) => api.get('/finance/audit/missing-serials', { params }).then((r: any) => r.data),
  patchSerial: (id: string, serial: string) => api.patch(`/finance/audit/missing-serials/${id}`, { serial }).then((r: any) => r.data),
  pdcVouchers: (params?: any) => api.get('/vouchers/pdc', { params }).then((r: any) => toArr(r.data)),
  insertVoucher: (data: any) => api.post('/vouchers', data).then((r: any) => r.data),
  updateVoucher: (vsrl: string, data: any) => api.patch(`/vouchers/${vsrl}`, data).then((r: any) => r.data),
  deleteVoucher: (vsrl: string) => api.delete(`/vouchers/${vsrl}`).then((r: any) => r.data),
};
