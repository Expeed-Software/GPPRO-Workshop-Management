import { api, normList } from './client';

export const labourIssueApi = {
  list:   (params?: any) => api.get('/labour-issue', { params }).then(normList),
  getOne: (id: string)   => api.get(`/labour-issue/${id}`).then((r: any) => r.data),
  create: (data: any)    => api.post('/labour-issue', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/labour-issue/${id}`, data).then((r: any) => r.data),
  delete: (id: string)   => api.delete(`/labour-issue/${id}`).then((r: any) => r.data),
};
