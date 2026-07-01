import api from './axios';

const toArr = (d: any): any[] => Array.isArray(d) ? d : (d?.recordset ?? []);

export const accountsApi = {
  listHeads: (params?: any) => api.get('/accounts/heads', { params }).then((r: any) => toArr(r.data)),
  headTree: (params?: any) => api.get('/accounts/heads/tree', { params }).then((r: any) => toArr(r.data)),
  headTreeList: (params?: any) => api.get('/accounts/heads/tree-list', { params }).then((r: any) => toArr(r.data)),
  headHelp: (params?: any) => api.get('/accounts/heads/help', { params }).then((r: any) => toArr(r.data)),
  selectList: (params?: any) => api.get('/accounts/select', { params }).then((r: any) => toArr(r.data)),
  createHead: (data: any) => api.post('/accounts', data).then((r: any) => r.data),
  updateHead: (code: string, data: any) => api.patch(`/achead/${code}`, data).then((r: any) => r.data),
  deleteHead: (code: string) => api.delete(`/achead/${code}`).then((r: any) => r.data),
  bulkImport: (data: any) => api.post('/accounts/heads/import', data).then((r: any) => r.data),
  resort: (data: any) => api.post('/accounts/heads/resort', data).then((r: any) => r.data),
  createGroup: (data: any) => api.post('/acgrouphead', data).then((r: any) => r.data),
  editGroup: (id: string, data: any) => api.patch(`/accounts/groups/${id}`, data).then((r: any) => r.data),
  deleteGroup: (id: string) => api.delete(`/acgrouphead/${id}`).then((r: any) => r.data),
  subdetails: (code: string) => api.get(`/accounts/${code}/subdetails`).then((r: any) => r.data),
  modLog: (params?: any) => api.get('/audit/account-modification-log', { params }).then((r: any) => toArr(r.data)),
};

export const ledgerApi = {
  report: (params?: any) => api.get('/ledger/report', { params }).then((r: any) => toArr(r.data)),
  actualDateReport: (params?: any) => api.get('/ledger/actual-date-report', { params }).then((r: any) => toArr(r.data)),
  pdcReport: (params?: any) => api.get('/ledger/pdc-report', { params }).then((r: any) => toArr(r.data)),
  summaryReport: (params?: any) => api.get('/ledger/summary-report', { params }).then((r: any) => toArr(r.data)),
  summaryActual: (params?: any) => api.get('/ledger/summary-actual', { params }).then((r: any) => toArr(r.data)),
  shortReport: (params?: any) => api.get('/ledger/short-report', { params }).then((r: any) => toArr(r.data)),
  audit: (params?: any) => api.get('/ledger/audit/accounts', { params }).then((r: any) => toArr(r.data)),
  groupSummary: (params?: any) => api.get('/reports/group-ledger-summary', { params }).then((r: any) => toArr(r.data)),
};

export const vouchersApi = {
  list: (params?: any) => api.get('/vouchers', { params }).then((r: any) => toArr(r.data)),
  details: (vsrl: string) => api.get(`/vouchers/${vsrl}/details`).then((r: any) => r.data),
  dailyList: (params?: any) => api.get('/vouchers/daily-list', { params }).then((r: any) => toArr(r.data)),
  listReport: (params?: any) => api.get('/vouchers/list-report', { params }).then((r: any) => toArr(r.data)),
  detailsReport: (params?: any) => api.get('/vouchers/details-list-report', { params }).then((r: any) => toArr(r.data)),
  journalList: (params?: any) => api.get('/journalvoucher', { params }).then((r: any) => toArr(r.data)),
  createJournal: (data: any) => api.post('/journal-voucher-entry', data).then((r: any) => r.data),
  bulkJournal: (data: any) => api.post('/bulk/journal-vouchers', data).then((r: any) => r.data),
  bulkPDCReceipt: (data: any) => api.post('/bulk/pdc-receipt-transactions', data).then((r: any) => r.data),
  bulkPDC: (data: any) => api.post('/bulk/pdc-transactions', data).then((r: any) => r.data),
};

export const trialBalanceApi = {
  get: (params?: any) => api.get('/reports/trial-balance', { params }).then((r: any) => toArr(r.data)),
  summary: (params?: any) => api.get('/reports/trial-balance-summary', { params }).then((r: any) => toArr(r.data)),
  test: (params?: any) => api.get('/reports/trialbalance-test', { params }).then((r: any) => toArr(r.data)),
  test111: (params?: any) => api.get('/reports/trialbalance-test-111', { params }).then((r: any) => toArr(r.data)),
};
