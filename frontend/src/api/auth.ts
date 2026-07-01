import { api } from './client';
import { AuthUser } from '../stores/auth';

export interface SignInResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  signIn: (identifier: string, password: string) =>
    api.post<SignInResponse>('/auth/sign-in', { identifier, password }),

  signOut: (refreshToken: string) =>
    api.post('/auth/sign-out', { refreshToken }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),

  passwordReset: (email: string) =>
    api.post('/auth/password-reset', { email }),

  passwordResetConfirm: (token: string, newPassword: string) =>
    api.post('/auth/password-reset/confirm', { token, newPassword }),

  lockAccount: (userId: number) =>
    api.post('/auth/lock-account', { userId }),

  unlockAccount: (userId: number) =>
    api.post('/auth/unlock-account', { userId }),

  mfaSend: (userId: number, method: string) =>
    api.post('/auth/mfa/send', { userId, method }),

  mfaVerify: (userId: number, code: string) =>
    api.post('/auth/mfa/verify', { userId, code }),

  getUserLog: (params?: {
    userId?: number;
    fromDate?: string;
    toDate?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.userId) qs.set('userId', String(params.userId));
    if (params?.fromDate) qs.set('fromDate', params.fromDate);
    if (params?.toDate) qs.set('toDate', params.toDate);
    if (params?.type) qs.set('type', params.type);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return api.get(`/userlog?${qs.toString()}`);
  },
};
