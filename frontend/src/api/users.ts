import { api, normList } from './client';

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
  roles: string[];
  status: string;
  failedLoginAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  mustChangePassword?: boolean;
  mfaEnabled?: boolean;
  expiresAt?: string;
}

export interface UserLogEntry {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  timestamp: string;
  ip?: string;
  status: string;
  remarks?: string;
}

export interface EmployeeRecord {
  id: number;
  staffId: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  section?: string;
  role?: string;
  status: string;
}

export const usersApi = {
  list: (params?: { name?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.name) qs.set('name', params.name);
    if (params?.role) qs.set('role', params.role);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return api.get<UserRecord[]>(`/users?${qs.toString()}`).then(normList);
  },

  getById: (id: number) => api.get<UserRecord>(`/users/${id}`),

  create: (data: {
    name: string; email: string; phone?: string; roles: string[];
    password: string; status?: string; expiresAt?: string;
  }) => api.post<{ id: number }>('/users', data),

  update: (id: number, data: Partial<UserRecord>) => api.patch(`/users/${id}`, data),

  setStatus: (id: number, status: string) => api.patch(`/users/${id}/status`, { status }),

  bulkSetStatus: (userIds: number[], status: string) => api.patch('/users/bulk-status', { userIds, status }),

  resetPassword: (id: number, payload: { newPassword?: string } = {}) =>
    Object.keys(payload).length
      ? api.patch(`/users/${id}/password`, payload)
      : api.post(`/users/${id}/reset-password`),

  updateSelf: (data: { name?: string; phone?: string }) => api.patch('/users/me', data),

  assignRoles: (userId: number, roles: string[]) => api.patch('/users/roles', { userId, roles }),

  bulkImport: (rows: any[]) => api.post('/users/import', { rows }),

  export: (format = 'csv') => `/users/export?format=${format}`,

  getRights: (params?: { role?: string }) => api.get('/users/rights', { params }),

  assignPermissions: (data: any) => api.post('/users/rights', data),

  getUserLog: (params?: { userId?: number; fromDate?: string; toDate?: string; type?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.userId) qs.set('userId', String(params.userId));
    if (params?.fromDate) qs.set('fromDate', params.fromDate);
    if (params?.toDate) qs.set('toDate', params.toDate);
    if (params?.type) qs.set('type', params.type);
    if (params?.page) qs.set('page', String(params.page));
    return api.get<UserLogEntry[]>(`/userlog?${qs.toString()}`).then(normList);
  },

  listEmployees: (params?: { dept?: string; role?: string; status?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.dept) qs.set('dept', params.dept);
    if (params?.role) qs.set('role', params.role);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    return api.get<EmployeeRecord[]>(`/employees?${qs.toString()}`).then(normList);
  },

  getEmployeeById: (id: number) => api.get<EmployeeRecord>(`/employees/${id}`),
};
