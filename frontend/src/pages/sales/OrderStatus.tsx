import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import { customersApi } from '../../api/customers';
import s from './Sales.module.css';

export default function OrderStatus() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ orderNo: '', customer: '', status: '', dateFrom: '', dateTo: '' });

  const { data: _custRes } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => customersApi.list({ limit: 500 }) });
  const customers: any[] = (_custRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['order-status-list', filters],
    queryFn: () => salesOrdersApi.list(filters),
  });
  const orders: any[] = (_res as any)?.data ?? [];

  const getBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'delivered') return s.badgeGreen;
    if (st === 'confirmed' || st === 'in progress') return s.badgeBlue;
    if (st === 'pending' || st === 'draft') return s.badgeYellow;
    if (st === 'cancelled' || st === 'void') return s.badgeRed;
    return s.badgeGray;
  };

  return (
    <div data-testid="orderstatus-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Order Status</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Order #" data-testid="orderstatus-filter-orderno" value={filters.orderNo} onChange={(e) => setFilters((p) => ({ ...p, orderNo: e.target.value }))} />
          <select data-testid="orderstatus-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))}>
            <option value="">All Customers</option>
            {customers.map((c: any) => <option key={c.ID ?? c.id} value={String(c.ID ?? c.id)}>{c.Name ?? c.CustName ?? c.name}</option>)}
          </select>
          <select data-testid="orderstatus-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input type="date" data-testid="orderstatus-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="orderstatus-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (orders as any[]).length === 0 ? (
          <div className={s.empty}>No orders found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="orderstatus-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {(orders as any[]).map((o: any) => (
                  <tr key={o.ID ?? o.id} data-testid={`orderstatus-row-${o.ID ?? o.id}`}>
                    <td>{o.Ordr ?? o.orderNo ?? o.ID}</td>
                    <td>{o.CustomerName ?? o.customer ?? o.CustId}</td>
                    <td>{o.Ordt ?? o.orderDate}</td>
                    <td><span className={`${s.badge} ${getBadge(o.StatusDescription ?? o.status)}`}>{o.StatusDescription ?? o.status}</span></td>
                    <td>{(o.Nett ?? o.Total ?? o.total)?.toFixed(2) ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => navigate(`/sales/orders/${o.ID ?? o.id}`)}>View</button>
                        <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} data-testid={`orderstatus-update-${o.id}`} onClick={() => navigate(`/sales/orders/${o.ID ?? o.id}`)}>Update</button>
                      </div>
                    </td>
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
