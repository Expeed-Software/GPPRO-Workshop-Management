import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/auth';

const API_BASE = '/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  useAuthStore.getState().updateLastActivity();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/auth/sign-in?reason=session_expired';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { total?: number; page?: number };
}

async function request<T>(
  method: string,
  url: string,
  data?: any,
  params?: any
): Promise<ApiResponse<T>> {
  const response: AxiosResponse<ApiResponse<T>> = await apiClient.request({
    method,
    url,
    data,
    params,
  });
  return response.data;
}

export const api = {
  get: <T>(url: string, config?: { params?: any }) => request<T>('GET', url, undefined, config?.params),
  post: <T>(url: string, data?: any) => request<T>('POST', url, data),
  patch: <T>(url: string, data?: any) => request<T>('PATCH', url, data),
  put: <T>(url: string, data?: any) => request<T>('PUT', url, data),
  delete: <T>(url: string) => request<T>('DELETE', url),
};

// Normalizes any paginated list response into { data: [], meta: { total, page } }
// Handles three backend shapes:
//   { success, data: [...] }                 — direct array
//   { success, data: { recordset: [], total } } — repo paged helper
//   { success, data: { data: [], total } }    — users-management repo
// Normalizes a single-record response into { data: record }
// So form pages can do data?.data to get the record
export const normSingle = (r: any) => {
  const p = r.data;
  const record = Array.isArray(p) ? p[0]
    : Array.isArray(p?.recordset) ? p.recordset[0]
    : p;
  return { data: record };
};

export const normList = (r: any) => {
  const p = r.data;
  const arr: any[] = Array.isArray(p) ? p
    : Array.isArray(p?.recordset) ? p.recordset
    : Array.isArray(p?.data) ? p.data
    : [];
  return { data: arr, meta: { total: p?.total ?? arr.length, page: p?.page ?? 1, limit: p?.limit ?? 50 } };
};

export { apiClient };
export default apiClient;
