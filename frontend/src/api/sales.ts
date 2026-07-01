import { api, normList, normSingle } from './client';

export const salesOrdersApi = {
  list: (params?: any) => api.get('/sales/orders', { params }).then(normList),
  get: (id: string) => api.get(`/sales/orders/${id}`).then(normSingle),
  create: (data: any) => api.post('/sales/orders', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/sales/orders/${id}`, data).then((r: any) => r.data),
  changeStatus: (id: string, status: string, reason: string) => api.patch(`/sales/orders/${id}/status`, { status, reason }).then((r: any) => r.data),
  bulkStatus: (orderIds: string[], status: string) => api.patch('/sales/orders/bulk-status', { orderIds, status }).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/sales/orders/${id}`).then((r: any) => r.data),
  changeCustomer: (id: string, customerId: string, reason: string) => api.patch(`/sales/orders/${id}/customer`, { customerId, reason }).then((r: any) => r.data),
  auditTrail: (id: string) => api.get('/sales/orders/audit', { params: { orderId: id } }).then((r: any) => r.data),
  pending: (params?: any) => api.get('/sales/orders/pending', { params }).then(normList),
  pendingRegister: (params?: any) => api.get('/sales/orders/pending/register', { params }).then(normList),
  report: (params?: any) => api.get('/orders/sales-report', { params }).then((r: any) => r.data),
  statusReport: (params?: any) => api.get('/orders/status-report', { params }).then((r: any) => r.data),
  help: () => api.get('/sales/orders/help').then((r: any) => r.data),
};

export const deliveryApi = {
  listForOrder: (orderId: string) => api.get(`/sales/orders/${orderId}/delivery-notes`).then((r: any) => r.data),
  create: (orderId: string, data: any) => api.post(`/sales/orders/${orderId}/delivery-notes`, data).then((r: any) => r.data),
  update: (orderId: string, noteId: string, data: any) => api.patch(`/sales/orders/${orderId}/delivery-notes/${noteId}`, data).then((r: any) => r.data),
  delete: (orderId: string, noteId: string) => api.delete(`/sales/orders/${orderId}/delivery-notes/${noteId}`).then((r: any) => r.data),
  log: (params?: any) => api.get('/sales/delivery-log', { params }).then(normList),
  print: (noteId: string) => api.get(`/sales/delivery-notes/${noteId}/print`).then((r: any) => r.data),
  export: (noteId: string) => api.get(`/sales/delivery-notes/${noteId}/export`).then((r: any) => r.data),
  audit: (noteId: string) => api.get(`/sales/delivery-notes/${noteId}/audit`).then((r: any) => r.data),
  report: (params?: any) => api.get('/orders/delivery-notes', { params }).then(normList),
  link: (noteId: string, orderId: string) => api.post(`/sales/delivery-notes/${noteId}/link`, { orderId }).then((r: any) => r.data),
};
