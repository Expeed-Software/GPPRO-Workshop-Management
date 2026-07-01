import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

export default function PendingOrderRegister() {
  const [filters, setFilters] = useState({ pendingSince: '', customer: '', minAmount: '' });

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['pending-register', filters],
    queryFn: () => salesOrdersApi.pendingRegister(filters),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  const sorted = [...(rows as any[])].sort((a, b) => (b.Ordt ?? 0) - (a.Ordt ?? 0));

  return (
    <div data-testid="pendingregister-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Pending Order Register Report</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Pending Since</label>
            <input type="date" data-testid="pendingregister-filter-since" value={filters.pendingSince} onChange={(e) => setFilters((p) => ({ ...p, pendingSince: e.target.value }))} />
          </div>
          <input placeholder="Customer" data-testid="pendingregister-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))} />
          <input type="number" placeholder="Min Amount" data-testid="pendingregister-filter-minamount" value={filters.minAmount} onChange={(e) => setFilters((p) => ({ ...p, minAmount: e.target.value }))} style={{ width: 120 }} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : sorted.length === 0 ? (
          <div className={s.empty}>No pending orders.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="pendingregister-table">
              <thead>
                <tr><th>Order #</th><th>Date</th><th>Customer</th><th>Age (Days)</th><th>Status</th><th>Total</th></tr>
              </thead>
              <tbody>
                {sorted.map((r: any, i: number) => (
                  <tr key={i} data-testid={`pendingregister-row-${i}`}>
                    <td>{r.Ordr ?? r.id}</td>
                    <td>{r.Ordt}</td>
                    <td>{r.CustomerName}</td>
                    <td>
                      <span className={`${s.badge} ${s.badgeBlue}`}>
                        {'—'}
                      </span>
                    </td>
                    <td>{r.StatusDescription}</td>
                    <td>{(r.Nett ?? r.Total)?.toFixed(2) ?? '—'}</td>
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
