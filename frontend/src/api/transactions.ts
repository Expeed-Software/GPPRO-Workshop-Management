import api from './axios';

const toArr = (d: any): any[] => Array.isArray(d) ? d : (d?.recordset ?? []);

export const paymentsApi = {
  list: (p?: any) => api.get('/payments', { params: p }).then((r: any) => toArr(r.data)),
  report: (p?: any) => api.get('/payments/report', { params: p }).then((r: any) => toArr(r.data)),
  create: (d: any) => api.post('/payments', d).then((r: any) => r.data),
  update: (id: string, d: any) => api.patch(`/payments/${id}`, d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/payments/${id}`).then((r: any) => r.data),
  finalize: (d: any) => api.post('/payments/finalize', d).then((r: any) => r.data),
  approve: (d: any) => api.post('/payments/approve', d).then((r: any) => r.data),
  reject: (d: any) => api.post('/payments/reject', { ...d, action: 'reject' }).then((r: any) => r.data),
};

export const receiptsApi = {
  list: (p?: any) => api.get('/receipts', { params: p }).then((r: any) => toArr(r.data)),
  report: (p?: any) => api.get('/receipts/report', { params: p }).then((r: any) => toArr(r.data)),
  create: (d: any) => api.post('/receipts', d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/receipts/${id}`).then((r: any) => r.data),
  approve: (d: any) => api.post('/receipts/approve', d).then((r: any) => r.data),
  reject: (d: any) => api.post('/receipts/reject', { ...d, action: 'reject' }).then((r: any) => r.data),
  backup: (p?: any) => api.get('/receipts/backup', { params: p }).then((r: any) => toArr(r.data)),
  backupReport: (p?: any) => api.get('/receipts/backup-report', { params: p }).then((r: any) => toArr(r.data)),
  restoreBackup: (d: any) => api.post('/receipts/backup/restore', d).then((r: any) => r.data),
  autoList: (p?: any) => api.get('/receipts/auto', { params: p }).then((r: any) => toArr(r.data)),
  autoSave: (d: any) => api.post('/receipts/auto', d).then((r: any) => r.data),
};

export const pettyCashApi = {
  list: (p?: any) => api.get('/petty-cash', { params: p }).then((r: any) => toArr(r.data)),
  create: (d: any) => api.post('/petty-cash', d).then((r: any) => r.data),
  update: (id: string, d: any) => api.patch(`/petty-cash/${id}`, d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/petty-cash/${id}`).then((r: any) => r.data),
  approve: (d: any) => api.post('/petty-cash/approve', d).then((r: any) => r.data),
};

export const vouchersExtApi = {
  list: (p?: any) => api.get('/vouchers', { params: p }).then((r: any) => toArr(r.data)),
  listNew: (p?: any) => api.get('/vouchers/new', { params: p }).then((r: any) => toArr(r.data)),
  listPdc: (p?: any) => api.get('/vouchers/pdc', { params: p }).then((r: any) => toArr(r.data)),
  summary: (p?: any) => api.get('/vouchers/summary', { params: p }).then((r: any) => toArr(r.data)),
  summaryPdc: (p?: any) => api.get('/vouchers/summary-pdc', { params: p }).then((r: any) => toArr(r.data)),
  details: (vsrl: string, p?: any) => api.get(`/vouchers/${vsrl}/details`, { params: p }).then((r: any) => r.data),
  accountVouchers: (code: string, p?: any) => api.get(`/accounts/${code}/vouchers`, { params: p }).then((r: any) => r.data),
  create: (d: any) => api.post('/vouchers', d).then((r: any) => r.data),
  bulk: (d: any) => api.post('/vouchers/batch', d).then((r: any) => r.data),
  approve: (d: any) => api.post('/vouchers/approve', d).then((r: any) => r.data),
  reject: (d: any) => api.post('/vouchers/approve', { ...d, action: 'reject' }).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/vouchers/${id}`).then((r: any) => r.data),
  pdcIssue: (d: any) => api.post('/vouchers/pdc-issue', d).then((r: any) => r.data),
  pdcReceipt: (d: any) => api.post('/vouchers/pdc-receipt', d).then((r: any) => r.data),
};
