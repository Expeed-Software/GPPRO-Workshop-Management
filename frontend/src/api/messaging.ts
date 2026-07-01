import api from './axios';
import { api as apiClient, normList } from './client';

export const mailApi = {
  count: () => api.get('/mail/count').then((r: any) => r.data),
  list: (p?: any) => apiClient.get('/mail', { params: p }).then(normList),
  send: (d: any) => api.post('/mail', d).then((r: any) => r.data),
  markRead: (id: string, d: any) => api.patch(`/mail/${id}/read`, d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/mail/${id}`).then((r: any) => r.data),
  sendReport: (d: any) => api.post('/mail/reports', d).then((r: any) => r.data),
  sentReports: (p?: any) => api.get('/mail/reports/sent', { params: p }).then((r: any) => r.data),
};

export const declareApi = {
  list: (p?: any) => api.get('/declare', { params: p }).then((r: any) => r.data),
  create: (d: any) => api.post('/declare', d).then((r: any) => r.data),
  update: (id: string, d: any) => api.patch(`/declare/${id}`, d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/declare/${id}`).then((r: any) => r.data),
};

export const utilApi = {
  numToWords: (p: any) => api.get('/util/numto-words', { params: p }).then((r: any) => r.data),
  runFunction: (name: string, d?: any) => api.post(`/utility/functions/${name}`, d).then((r: any) => r.data),
};

export const dmsApi = {
  list: (p?: any) => api.get('/dms/attachments', { params: p }).then((r: any) => r.data),
  upload: (d: any) => api.post('/dms/attachments', d).then((r: any) => r.data),
  update: (id: string, d: any) => api.patch(`/dms/attachments/${id}`, d).then((r: any) => r.data),
  delete: (id: string) => api.delete(`/dms/attachments/${id}`).then((r: any) => r.data),
  help: (p?: any) => api.get('/documents/help', { params: p }).then((r: any) => r.data),
};

export const companyInfoApi = {
  get: () => api.get('/companyinfo').then((r: any) => r.data),
  update: (d: any) => api.patch('/companyinfo', d).then((r: any) => r.data),
};
