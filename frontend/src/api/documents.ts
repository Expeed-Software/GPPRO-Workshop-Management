import { api } from './client';

export const attachmentsApi = {
  list: (params?: any) => api.get('/attachments', { params }).then((r: any) => r.data),
  upload: (data: any) => api.post('/attachments', data).then((r: any) => r.data),
  edit: (id: number, data: any) => api.patch(`/attachments/${id}`, data).then((r: any) => r.data),
  delete: (id: number, confirmed = true) => api.delete(`/attachments/${id}`).then((r: any) => r.data),
  bulkUpload: (files: any[]) => api.post('/attachments/bulk', { files }).then((r: any) => r.data),
  bulkDelete: (ids: number[], confirmed = true) => api.delete('/attachments/bulk').then((r: any) => r.data),
  auditLogs: (params?: any) => api.get('/audit/documents', { params }).then((r: any) => r.data),
};

export const documentsApi = {
  list: (params?: any) => api.get('/documents', { params }).then((r: any) => r.data),
  menuData: () => api.get('/documents/menu').then((r: any) => r.data),
  create: (data: any) => api.post('/documents', data).then((r: any) => r.data),
  edit: (id: number, data: any) => api.patch(`/documents/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/documents/${id}`).then((r: any) => r.data),
  setStatus: (id: number, status: string) => api.patch(`/documents/${id}/status`, { status }).then((r: any) => r.data),
  link: (id: number, entityId: number, entityType: string) => api.post(`/documents/${id}/link`, { entityId, entityType }).then((r: any) => r.data),
  listHeads: (params?: any) => api.get('/documents/heads', { params }).then((r: any) => r.data),
  createHead: (data: any) => api.post('/documents/heads', data).then((r: any) => r.data),
  editHead: (id: number, data: any) => api.patch(`/documents/heads/${id}`, data).then((r: any) => r.data),
};

export const remarksApi = {
  list: (params?: any) => api.get('/remarks', { params }).then((r: any) => r.data),
  add: (data: any) => api.post('/remarks', data).then((r: any) => r.data),
  edit: (id: number, remark: string) => api.patch(`/remarks/${id}`, { remark }).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/remarks/${id}`).then((r: any) => r.data),
  history: (transactionId: number) => api.get('/remarks/history', { params: { transactionId } }).then((r: any) => r.data),
  report: (params?: any) => api.get('/remarks/report', { params }).then((r: any) => r.data),
};
