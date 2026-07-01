import { api, normList } from './client';

export const estimationsApi = {
  list: (params?: any) => api.get('/estimations', { params }).then(normList),
  get: (jobCardNo: string) => api.get(`/estimations/${jobCardNo}`).then((r: any) => r.data),
  create: (data: any) => api.post('/estimations', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/estimations/${id}`, data).then((r: any) => r.data),
  submit: (id: string) => api.post(`/estimations/${id}/submit`).then((r: any) => r.data),
  approve: (id: string, action: string, comment: string, assignTo?: string) => api.post(`/estimations/${id}/approve`, { action, comment, assignTo }).then((r: any) => r.data),
  auditLog: (id: string) => api.get(`/estimations/${id}/audit`).then((r: any) => r.data),
};

export const jobsApi = {
  create: (data: any) => api.post('/jobs', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/jobs/${id}`, data).then((r: any) => r.data),
  assign: (id: string, staffId: string) => api.post(`/jobs/${id}/assign`, { staffId }).then((r: any) => r.data),
  setStatus: (id: string, status: string) => api.patch(`/jobs/${id}/status`, { status }).then((r: any) => r.data),
  setProgress: (id: string, progress: number, note: string) => api.patch(`/jobs/${id}/progress`, { progress, note }).then((r: any) => r.data),
  complete: (id: string, signature: string) => api.patch(`/jobs/${id}/complete`, { signature }).then((r: any) => r.data),
  workStatus: (params?: any) => api.get('/jobs/work-status', { params }).then(normList),
  running: (params?: any) => api.get('/jobs/running', { params }).then(normList),
  completed: (params?: any) => api.get('/jobs/completed', { params }).then(normList),
  partsNotAvailable: (params?: any) => api.get('/jobs/parts-not-available', { params }).then(normList),
  statusHistory: (jobId: string) => api.get('/jobs/status-history', { params: { jobId } }).then((r: any) => r.data),
  workStatusReport: (params?: any) => api.get('/jobs/work-status-report', { params }).then(normList),
  workStatusSummary: (params?: any) => api.get('/jobs/rpt-work-status-summary', { params }).then(normList),
  advisorwiseReport: (params?: any) => api.get('/jobs/status-advisorwise-report', { params }).then(normList),
  pendingJobCardHelp: (params?: any) => api.get('/jobs/pending-jobcard-help', { params }).then((r: any) => r.data),
  auditLogs: (jobId: string) => api.get('/audit/job', { params: { jobId } }).then((r: any) => r.data),
};

export const jobStatusMasterApi = {
  list: () => api.get('/job-status').then(normList),
  create: (data: any) => api.post('/job-status', data).then((r: any) => r.data),
  update: (id: string, data: any) => api.patch(`/job-status/${id}`, data).then((r: any) => r.data),
  help: () => api.get('/job-status-help').then((r: any) => r.data),
};
