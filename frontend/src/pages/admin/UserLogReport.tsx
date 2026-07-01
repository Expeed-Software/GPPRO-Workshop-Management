import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import styles from '../admin/UserList.module.css';

export const UserLogReport: React.FC = () => {
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', type: '', page: 1 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['userlog', filters],
    queryFn: () => usersApi.getUserLog(filters),
  });

  const logs = (data?.data as any) || [];
  const total = data?.meta?.total || 0;

  return (
    <div data-testid="user-log-report-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Log Report</h1>
          <p className={styles.subtitle}>Authentication and activity audit trail</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          type="date"
          className={styles.filterSelect}
          data-testid="user-log-from-date"
          value={filters.fromDate}
          onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value, page: 1 }))}
          placeholder="From date"
        />
        <input
          type="date"
          className={styles.filterSelect}
          data-testid="user-log-to-date"
          value={filters.toDate}
          onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value, page: 1 }))}
          placeholder="To date"
        />
        <select
          className={styles.filterSelect}
          data-testid="user-log-type-filter"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))}
        >
          <option value="">All Actions</option>
          <option value="sign-in">Sign In</option>
          <option value="sign-in-failure">Sign In Failure</option>
          <option value="sign-out">Sign Out</option>
          <option value="password-changed">Password Changed</option>
          <option value="account-locked">Account Locked</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>
            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
          </div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load user log.</div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>No log entries found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry: any) => (
                <tr key={entry.id} className={styles.row}>
                  <td>{entry.userName || `User #${entry.userId}`}</td>
                  <td><code style={{ fontSize: 11, background: '#f0f2ff', padding: '2px 6px', borderRadius: 4 }}>{entry.action}</code></td>
                  <td>
                    <span className={styles.statusBadge}
                      style={{ background: entry.status === 'success' ? '#2eae6c18' : '#d23b4118', color: entry.status === 'success' ? '#2eae6c' : '#d23b41' }}>
                      {entry.status}
                    </span>
                  </td>
                  <td className={styles.dimCell}>{entry.ip || '—'}</td>
                  <td className={styles.dimCell}>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className={styles.dimCell}>{entry.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total} total entries</span>
      </div>
    </div>
  );
};
