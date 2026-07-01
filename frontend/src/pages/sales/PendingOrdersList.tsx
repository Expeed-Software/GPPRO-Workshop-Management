import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import { customersApi } from '../../api/customers';
import s from './Sales.module.css';

export default function PendingOrdersList() {
  const [filters, setFilters] = useState({ customer: '', dateFrom: '', dateTo: '' });

  const { data: _custRes } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => customersApi.list({ limit: 500 }) });
  const customers: any[] = (_custRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['pending-orders', filters],
    queryFn: () => salesOrdersApi.pending(filters),
  });
  const orders: any[] = (_res as any)?.data ?? [];

  return (
    <div data-testid="pendingorders-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Pending Orders</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="pendingorders-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))}>
            <option value="">All Customers</option>
            {customers.map((c: any) => <option key={c.ID ?? c.id} value={String(c.ID ?? c.id)}>{c.Name ?? c.CustName ?? c.name}</option>)}
          </select>
          <input type="date" data-testid="pendingorders-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="pendingorders-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : (orders as any[]).length === 0 ? (
          <div className={s.empty}>No pending orders.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="pendingorders-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Order Date</th><th>Status</th><th>Expected Delivery</th><th>Amount</th><th>Print</th></tr>
              </thead>
              <tbody>
                {(orders as any[]).map((o: any) => (
                  <tr key={o.ID ?? o.id} data-testid={`pendingorders-row-${o.ID ?? o.id}`}>
                    <td>{o.Ordr ?? o.orderNo ?? o.ID}</td>
                    <td>{o.CustomerName ?? o.customer ?? o.CustId}</td>
                    <td>{o.Ordt ?? o.orderDate}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{o.StatusDescription ?? o.status ?? 'Pending'}</span></td>
                    <td>{o.expectedDelivery ?? '—'}</td>
                    <td>{(o.Nett ?? o.Total ?? o.total)?.toFixed(2) ?? '—'}</td>
                    <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => window.print()}>Print</button></td>
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
