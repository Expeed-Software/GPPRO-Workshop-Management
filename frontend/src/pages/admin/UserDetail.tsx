import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import styles from './UserDetail.module.css';

export const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const isAdmin = hasAnyRole(['Administrator']);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(Number(id)),
  });

  const user: any = (data?.data as any) || null;

  const { data: logData } = useQuery({
    queryKey: ['user-log', id],
    queryFn: () => usersApi.getUserLog({ userId: Number(id), page: 1, pageSize: 5 }),
    enabled: !!id,
  });
  const recentLog: any[] = (logData?.data as any) || [];

  const resetPwdMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(Number(id)),
    onSuccess: () => { setActionSuccess('Password reset link sent.'); setActionError(''); },
    onError: (err: any) => setActionError(err?.response?.data?.error?.message || 'Failed to reset password.'),
  });

  const lockMutation = useMutation({
    mutationFn: () => usersApi.setStatus(Number(id), 'locked'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', id] }); setActionSuccess('User locked.'); setActionError(''); },
    onError: (err: any) => setActionError(err?.response?.data?.error?.message || 'Failed to lock user.'),
  });

  const unlockMutation = useMutation({
    mutationFn: () => usersApi.setStatus(Number(id), 'active'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', id] }); setActionSuccess('User unlocked.'); setActionError(''); },
    onError: (err: any) => setActionError(err?.response?.data?.error?.message || 'Failed to unlock user.'),
  });

  if (isLoading) return <div className={styles.loading}>Loading user profile...</div>;
  if (error || !user) return <div className={styles.errorState} role="alert">User not found.</div>;

  return (
    <div data-testid="user-detail-page" className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/admin/users" className={styles.breadcrumbLink}>Users</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{user.name}</span>
      </div>

      {actionSuccess && <div className={styles.successBanner} role="status">{actionSuccess}</div>}
      {actionError && <div className={styles.errorBanner} role="alert">{actionError}</div>}

      <div className={styles.profileCard}>
        <div className={styles.avatarLg}>{user.name?.charAt(0).toUpperCase() || 'U'}</div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName} data-testid="user-detail-name">{user.name}</h1>
          <p className={styles.profileEmail}>{user.email}</p>
          <div className={styles.profileMeta}>
            <span className={styles.statusBadge}
              style={{ background: user.status === 'active' ? '#2eae6c18' : '#95959418', color: user.status === 'active' ? '#2eae6c' : '#959ac7' }}>
              {user.status}
            </span>
            {(user.roles || []).map((r: string) => (
              <span key={r} className={styles.roleBadge}>{r}</span>
            ))}
          </div>
        </div>
        {isAdmin && (
          <div className={styles.profileActions}>
            <Link to={`/admin/users/${id}/edit`}>
              <Button variant="secondary" data-testid="user-detail-edit-button">Edit User</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => resetPwdMutation.mutate()}
              loading={resetPwdMutation.isPending}
              data-testid="user-detail-reset-pwd-button"
            >
              Reset Password
            </Button>
            {user.status === 'locked' ? (
              <Button
                variant="ghost"
                onClick={() => unlockMutation.mutate()}
                loading={unlockMutation.isPending}
                data-testid="user-detail-unlock-button"
              >
                Unlock
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => lockMutation.mutate()}
                loading={lockMutation.isPending}
                data-testid="user-detail-lock-button"
              >
                Lock Account
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Account Details</h2>
          <div className={styles.fieldList}>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>User ID</span>
              <span className={styles.fieldValue}>#{user.id}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Username</span>
              <span className={styles.fieldValue}>{user.username || '—'}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Phone</span>
              <span className={styles.fieldValue}>{(user as any).phone || '—'}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Last Login</span>
              <span className={styles.fieldValue}>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Created At</span>
              <span className={styles.fieldValue}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Failed Logins</span>
              <span className={styles.fieldValue}>{user.failedLoginAttempts ?? 0}</span>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          {recentLog.length === 0 ? (
            <div className={styles.emptyLog}>No recent activity.</div>
          ) : (
            <div className={styles.logList}>
              {recentLog.map((entry: any) => (
                <div key={entry.id} className={styles.logEntry}>
                  <code className={styles.logAction}>{entry.action}</code>
                  <span className={styles.logTime}>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <Link to={`/admin/userlog`} className={styles.viewAllLink}>View full log →</Link>
        </div>
      </div>
    </div>
  );
};
