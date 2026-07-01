import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import s from './Accounts.module.css';

export default function AccountModificationLog() {
  const [filters, setFilters] = useState({ account: '', action: '', dateFrom: '', dateTo: '', user: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['account-mod-log', filters],
    queryFn: () => accountsApi.modLog(filters),
  });

  return (
    <div data-testid="accountmodlog-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Account Modification Log</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="accountmodlog-print-btn" onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="accountmodlog-export-btn">Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Account" data-testid="accountmodlog-filter-account" value={filters.account} onChange={(e) => setFilters((p) => ({ ...p, account: e.target.value }))} />
          <input placeholder="Action" data-testid="accountmodlog-filter-action" value={filters.action} onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))} />
          <input placeholder="User" value={filters.user} onChange={(e) => setFilters((p) => ({ ...p, user: e.target.value }))} />
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No modification log entries.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="accountmodlog-table">
              <thead><tr><th>Date</th><th>Account</th><th>Action</th><th>User</th><th>Before</th><th>After</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`accountmodlog-row-${i}`}>
                    <td>{r.LogDate}</td><td>{r.HEAD}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>{r.Action}</span></td>
                    <td>{r.ChangedBy}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>{r.OldValue ?? '—'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>{r.NewValue ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
