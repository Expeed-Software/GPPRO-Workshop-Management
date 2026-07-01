import { api, normList } from './client';

export const purchaseOrdersApi = {
  list: (params?: any) => api.get('/purchase/orders', { params }).then(normList),
  createLocal: (data: any) => api.post('/purchase/orders', data).then((r: any) => r.data),
  createForeign: (data: any) => api.post('/purchase/orders/foreign', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/purchase/orders/${id}`, data).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/purchase/orders/${id}`).then((r: any) => r.data),
  approve: (id: string, approvalNote: string) => api.post(`/purchase/orders/${id}/approve`, { approvalNote }).then((r: any) => r.data),
  bulkImport: (data: any) => api.post('/purchase/orders/bulk-import', data).then((r: any) => r.data),
  bulkExport: (params?: any) => api.get('/purchase/orders/export', { params }).then((r: any) => r.data),
  pendingDOs: (params?: any) => api.get('/purchase/pending-delivery-orders', { params }).then(normList),
  reports: (params?: any) => api.get('/purchase/reports/orders', { params }).then(normList),
};

export const purchaseDOApi = {
  create: (data: any) => api.post('/purchase/do', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/purchase/do/${id}`, data).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/purchase/do/${id}`).then((r: any) => r.data),
  bulkReceipt: (data: any) => api.post('/purchase/do/bulk-receipt', data).then((r: any) => r.data),
  itemRegister: (params?: any) => api.get('/purchase/do/item-register', { params }).then((r: any) => r.data),
  itemSummary: (params?: any) => api.get('/purchase/do/item-summary', { params }).then((r: any) => r.data),
  pendingReport: (params?: any) => api.get('/purchase/reports/pending', { params }).then((r: any) => r.data),
  do01pdoReport: (params?: any) => api.get('/purchase/do-item-register', { params }).then((r: any) => r.data),
};

export const purchaseReportsApi = {
  lpoAnalysis: (params?: any) => api.get('/purchase/lpo-analysis', { params }).then((r: any) => r.data),
  lpoDetails: (params?: any) => api.get('/purchase/lpo-details-report', { params }).then((r: any) => r.data),
  regAccount: (params?: any) => api.get('/purchase/register/account', { params }).then((r: any) => r.data),
  regImported: (params?: any) => api.get('/purchase/register/imported', { params }).then((r: any) => r.data),
  regLocal: (params?: any) => api.get('/purchase/register/local', { params }).then((r: any) => r.data),
  regSuppLocal: (params?: any) => api.get('/purchase/register/supplier-local', { params }).then((r: any) => r.data),
  returns: (params?: any) => api.get('/purchase/returns', { params }).then((r: any) => r.data),
  importBills: (params?: any) => api.get('/purchase/import-bills', { params }).then((r: any) => r.data),
  localBills: (params?: any) => api.get('/purchase/local-bills', { params }).then((r: any) => r.data),
  billwisePending: (params?: any) => api.get('/suppliers/billwise-pending', { params }).then((r: any) => r.data),
  billwisePendingBoth: (params?: any) => api.get('/suppliers/billwise-pending/both', { params }).then((r: any) => r.data),
  billwisePendingForeign: (params?: any) => api.get('/suppliers/billwise-pending/foreign', { params }).then((r: any) => r.data),
  billwisePendingLocal: (params?: any) => api.get('/suppliers/billwise-pending/local', { params }).then((r: any) => r.data),
  billwisePendingForeignOld: (params?: any) => api.get('/suppliers/billwise-pending-old', { params }).then((r: any) => r.data),
  itemReports: (params?: any) => api.get('/purchase/item-reports', { params }).then((r: any) => r.data),
  prodRequests: (params?: any) => api.get('/products/requests', { params }).then((r: any) => r.data),
};
