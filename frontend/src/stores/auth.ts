import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Administrator' | 'Supervisor' | 'Standard User';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  mustChangePassword?: boolean;
  mfaEnabled?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  lastActivity: number;

  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  updateLastActivity: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      lastActivity: Date.now(),

      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true, lastActivity: Date.now() }),

      clearAuth: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) ?? false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some((r) => user?.roles?.includes(r)) ?? false;
      },
    }),
    {
      name: 'ibosuite-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
