import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function AuditSupport() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', account: '', user: '', status: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['audit-support', filters],
    queryFn: () => bankingApi.auditLogs(filters),
    enabled: false,
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => bankingApi.resolveAuditLog({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audit-support'] }),
  });

  return (
    <div data-testid="auditsupport-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Audit Support</h1></div>
      <div className={s.card}>
        <div className={s.alert} style={{ marginBottom: '1rem' }}>Supervisor / Administrator access required (BR-135)</div>
        <div className={s.filterBar}>
          <input type="date" data-testid="auditfilter-date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} placeholder="From" />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Account" data-testid="auditfilter-account" value={filters.account} onChange={(e) => setFilters((p) => ({ ...p, account: e.target.value }))} />
          <input placeholder="User" data-testid="auditfilter-user" value={filters.user} onChange={(e) => setFilters((p) => ({ ...p, user: e.target.value }))} />
          <select data-testid="auditfilter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="auditfilter-apply-btn" onClick={() => refetch()}>Apply</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No audit log entries found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>Date</th><th>Action</th><th>User</th><th>Account</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`auditfilter-table-row-${i}`}>
                    <td>{r.date ?? r.createdAt}</td><td>{r.action}</td><td>{r.user ?? r.userId}</td><td>{r.account}</td>
                    <td><span className={`${s.badge} ${r.status === 'Resolved' ? s.badgeGreen : s.badgeYellow}`}>{r.status}</span></td>
                    <td>{r.status !== 'Resolved' && <button className={`${s.btn} ${s.btnSuccess}`} style={{ fontSize: '0.75rem' }} onClick={() => resolveMut.mutate(r.id)}>Resolve</button>}</td>
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
