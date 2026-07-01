export type UserRole = 'Administrator' | 'Supervisor' | 'Standard User';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  roles: UserRole[];
  status: 'active' | 'inactive' | 'locked';
  passwordHash: string;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  mustChangePassword?: boolean;
  mfaEnabled?: boolean;
  mfaSecret?: string;
}

export interface UserLog {
  id: number;
  userId: number;
  action: string;
  timestamp: Date;
  ip?: string;
  status: 'success' | 'failure';
  remarks?: string;
}

export interface AuthTokenPayload {
  sub: string;
  userId: number;
  roles: UserRole[];
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenRecord {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
}
