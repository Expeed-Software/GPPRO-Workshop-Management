import { api, normList, normSingle } from './client';

export const customersApi = {
  list: (params?: any) => api.get('/customers', { params }).then(normList),
  overview: (params?: any) => api.get('/customers/overview', { params }).then(normList),
  getById: (id: number) => api.get(`/customers/${id}`).then(normSingle),
  create: (data: any) => api.post('/customers', data).then((r: any) => r.data),
  update: (id: number, data: any) => api.patch(`/customers/${id}`, data).then((r: any) => r.data),
  setStatus: (id: number, status: string, reason?: string) => api.patch(`/customers/${id}/status`, { status, reason }).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`).then((r: any) => r.data),
  merge: (masterId: number, duplicateIds: number[], fieldMap: any) => api.post('/customers/merge', { masterId, duplicateIds, fieldMap }).then((r: any) => r.data),
  import: (rows: any[]) => api.post('/customers/import', { rows }).then((r: any) => r.data),
  export: (params?: any) => api.get('/customers/export', { params }),
  agewiseSummary: (params?: any) => api.get('/customers/agewise-summary', { params }).then(normList),
};

export const suppliersApi = {
  list: (params?: any) => api.get('/suppliers', { params }).then(normList),
  getById: (id: number) => api.get(`/suppliers/${id}`).then(normSingle),
  create: (data: any) => api.post('/suppliers', data).then((r: any) => r.data),
  update: (id: number, data: any) => api.patch(`/suppliers/${id}`, data).then((r: any) => r.data),
  setStatus: (id: number, status: string, reason?: string) => api.patch(`/suppliers/${id}/status`, { status, reason }).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/suppliers/${id}`).then((r: any) => r.data),
  merge: (masterId: number, duplicateIds: number[], fieldMap: any) => api.post('/suppliers/merge', { masterId, duplicateIds, fieldMap }).then((r: any) => r.data),
  import: (rows: any[]) => api.post('/suppliers/import', { rows }).then((r: any) => r.data),
  export: (params?: any) => api.get('/suppliers/export', { params }),
  agewiseSummary: (params?: any) => api.get('/suppliers/agewise-summary', { params }).then(normList),
};

export const contactsApi = {
  list: (params?: any) => api.get('/contacts', { params }).then(normList),
  getById: (id: number) => api.get(`/contacts/${id}`).then(normSingle),
  create: (data: any) => api.post('/contacts', data).then((r: any) => r.data),
  update: (id: number, data: any) => api.patch(`/contacts/${id}`, data).then((r: any) => r.data),
  delete: (id: number) => api.delete(`/contacts/${id}`).then((r: any) => r.data),
  checkDuplicate: (fields: any) => api.post('/contacts/check-duplicate', fields).then((r: any) => r.data),
  merge: (masterId: number, duplicateIds: number[], fieldMap: any) => api.post('/contacts/merge', { masterId, duplicateIds, fieldMap }).then((r: any) => r.data),
  import: (rows: any[]) => api.post('/contacts/import', { rows }).then((r: any) => r.data),
  export: (params?: any) => api.get('/contacts/export', { params }),
};

export const vehiclesApi = {
  list: (params?: any) => api.get('/vehicles', { params }).then(normList),
  search: (params?: any) => api.get('/vehicles/search', { params }).then(normList),
  getById: (vehId: number) => api.get(`/vehicles/${vehId}`).then(normSingle),
  create: (data: any) => api.post('/vehicles', data).then((r: any) => r.data),
  update: (vehId: number, data: any) => api.patch(`/vehicles/${vehId}`, data).then((r: any) => r.data),
  delete: (vehId: number) => api.delete(`/vehicles/${vehId}`).then((r: any) => r.data),
  merge: (masterId: number, duplicateIds: number[], fieldMap: any) => api.post('/vehicles/merge', { masterId, duplicateIds, fieldMap }).then((r: any) => r.data),
};
