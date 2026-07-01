import api from './axios';

const toArr = (d: any): any[] => Array.isArray(d) ? d : (d?.recordset ?? []);

// Items API
export const itemsApi = {
  list: (params?: any) => api.get('/items', { params }).then((r: any) => toArr(r.data)),
  help: (params?: any) => api.get('/items/help', { params }).then((r: any) => toArr(r.data)),
  categories: () => api.get('/items/categories').then((r: any) => toArr(r.data?.recordset ?? r.data)),
  getByCode: (itemCode: string) => api.get(`/items/${itemCode}`).then((r: any) => r.data),
  create: (data: any) => api.post('/items', data).then((r: any) => r.data),
  update: (itemCode: string, data: any) => api.patch(`/items/${itemCode}`, data).then((r: any) => r.data),
  delete: (itemCode: string) => api.delete(`/items/${itemCode}`).then((r: any) => r.data),
  bulkImport: (data: any) => api.post('/items/bulk-import', data).then((r: any) => r.data),
  bulkExport: (params?: any) => api.get('/items/export', { params }).then((r: any) => r.data),
  auditLogs: (itemCode: string, params?: any) => api.get(`/items/${itemCode}/audit`, { params }).then((r: any) => r.data),
  linkInventory: (itemCode: string, inventoryId: string) => api.post(`/items/${itemCode}/link-inventory`, { inventoryId }).then((r: any) => r.data),
  doList: (itemCode: string, params?: any) => api.get(`/items/${itemCode}/do-list`, { params }).then((r: any) => toArr(r.data)),
  doSummary: (itemCode: string, params?: any) => api.get(`/items/${itemCode}/do-summary`, { params }).then((r: any) => toArr(r.data)),
  pendingDOList: (itemCode: string, params?: any) => api.get(`/items/${itemCode}/pending-do`, { params }).then((r: any) => toArr(r.data)),
  purchaseListImport: (params?: any) => api.get('/items/purchase/import', { params }).then((r: any) => toArr(r.data)),
  purchaseListLocal: (params?: any) => api.get('/items/purchase/local', { params }).then((r: any) => toArr(r.data)),
  purchaseReturnList: (params?: any) => api.get('/items/purchase/returns', { params }).then((r: any) => toArr(r.data)),
  purchaseReturnSumm: (params?: any) => api.get('/items/purchase/returns/summary', { params }).then((r: any) => toArr(r.data)),
  purchaseSummImport: (params?: any) => api.get('/items/purchase/summary/import', { params }).then((r: any) => toArr(r.data)),
  purchaseSummLocal: (params?: any) => api.get('/items/purchase/summary/local', { params }).then((r: any) => toArr(r.data)),
};

// Stock API
export const stockApi = {
  in: (data: any) => api.post('/stock/in', data).then((r: any) => r.data),
  out: (data: any) => api.post('/stock/out', data).then((r: any) => r.data),
  manualAdjust: (data: any) => api.post('/stock/manual-adjust', data).then((r: any) => r.data),
  physicalAdjust: (data: any) => api.post('/stock/physical-adjust', data).then((r: any) => r.data),
  qty: (itemCode: string) => api.get(`/stock/qty/${itemCode}`).then((r: any) => r.data),
  display: (params?: any) => api.get('/stock/display', { params }).then((r: any) => toArr(r.data)),
  inList: (params?: any) => api.get('/stock/in-list', { params }).then((r: any) => toArr(r.data)),
  outList: (params?: any) => api.get('/stock/out-list', { params }).then((r: any) => toArr(r.data)),
  reorderStatus: (params?: any) => api.get('/stock/reorder-status', { params }).then((r: any) => toArr(r.data)),
  movementReport: (params?: any) => api.get('/stock/movement-report', { params }).then((r: any) => toArr(r.data)),
  ledger: (params?: any) => api.get('/stock/ledger', { params }).then((r: any) => toArr(r.data)),
  agingReport: (params?: any) => api.get('/stock/aging-report', { params }).then((r: any) => toArr(r.data)),
  valuation: (params?: any) => api.get('/stock/valuation', { params }).then((r: any) => toArr(r.data)),
  valuationSummary: (params?: any) => api.get('/stock/valuation-summary', { params }).then((r: any) => toArr(r.data)),
  statement: (params?: any) => api.get('/stock/statement', { params }).then((r: any) => toArr(r.data)),
  statement1: (params?: any) => api.get('/stock/statement1', { params }).then((r: any) => toArr(r.data)),
  statementFromItemFile: (params?: any) => api.get('/stock/statement-from-item-file', { params }).then((r: any) => toArr(r.data)),
  statementDD: (params?: any) => api.get('/stock/statement-dd', { params }).then((r: any) => toArr(r.data)),
  auditLogs: (params?: any) => api.get('/audit/stock', { params }).then((r: any) => toArr(r.data)),
};
