import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '../stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const SESSION_TIMEOUT_MS =
  parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '30', 10) * 60 * 1000;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, hasAnyRole, clearAuth, lastActivity, updateLastActivity } =
    useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const checkIdle = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        clearAuth();
        window.location.href = '/auth/sign-in?reason=session_expired';
      }
    };

    const interval = setInterval(checkIdle, 30_000);

    const resetActivity = () => updateLastActivity();
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
    };
  }, [lastActivity, clearAuth, updateLastActivity]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
