import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import styles from './UserList.module.css';
import lStyles from './LegacyUserManagement.module.css';

export const LegacyUserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users-legacy', search, page],
    queryFn: () => usersApi.list({ search, page, pageSize: 20 }),
  });

  const users: any[] = (data?.data as any) || [];
  const total = (data?.meta as any)?.total || 0;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => usersApi.setStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-legacy'] });
      setConfirmId(null);
      setConfirmAction(null);
    },
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Operation failed.'),
  });

  const handleConfirm = () => {
    if (confirmId && confirmAction) {
      statusMutation.mutate({ id: confirmId, status: confirmAction === 'activate' ? 'active' : 'inactive' });
    }
  };

  return (
    <div data-testid="legacy-user-management-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Legacy User Management</h1>
          <p className={styles.subtitle}>Manage legacy and migrated user accounts</p>
        </div>
      </div>

      {error && <div className={styles.errorState} role="alert" style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, background: 'rgba(210,59,65,0.09)', border: '1px solid rgba(210,59,65,0.25)', fontSize: 'var(--text-sm-size)' }}>{error}</div>}

      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          style={{ flex: 1 }}
          placeholder="Search legacy users..."
          data-testid="legacy-user-search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {confirmId !== null && (
        <div className={lStyles.confirmOverlay} role="dialog" aria-modal="true">
          <div className={lStyles.confirmCard}>
            <p className={lStyles.confirmText}>
              Are you sure you want to <strong>{confirmAction}</strong> this user?
            </p>
            <div className={lStyles.confirmActions}>
              <Button variant="ghost" onClick={() => { setConfirmId(null); setConfirmAction(null); }}>Cancel</Button>
              <Button
                variant={confirmAction === 'deactivate' ? 'danger' : 'primary'}
                loading={statusMutation.isPending}
                onClick={handleConfirm}
                data-testid="legacy-confirm-action-button"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>
            {[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>No legacy users found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className={styles.row}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{u.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                      <div className={styles.userName}>{u.name}</div>
                      <div className={styles.userUsername}>{u.email}</div>
                    </div>
                  </td>
                  <td className={styles.dimCell}>{u.username}</td>
                  <td>
                    <div className={styles.roles}>
                      {(u.roles || []).map((r: string) => (
                        <span key={r} className={styles.roleBadge} style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={styles.statusBadge}
                      style={{ background: u.status === 'active' ? '#2eae6c18' : '#95959418', color: u.status === 'active' ? '#2eae6c' : '#959ac7' }}>
                      {u.status}
                    </span>
                  </td>
                  <td className={styles.dimCell}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    {u.status === 'active' ? (
                      <button className={styles.actionLink} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs-size)' }}
                        onClick={() => { setConfirmId(u.id); setConfirmAction('deactivate'); }}
                        data-testid={`deactivate-user-${u.id}`}
                      >Deactivate</button>
                    ) : (
                      <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs-size)' }}
                        onClick={() => { setConfirmId(u.id); setConfirmAction('activate'); }}
                        data-testid={`activate-user-${u.id}`}
                      >Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total} total users</span>
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span style={{ fontSize: 'var(--text-sm-size)' }}>Page {page}</span>
        <Button variant="ghost" disabled={users.length < 20} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
};
