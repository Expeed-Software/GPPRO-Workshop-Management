import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import { customersApi } from '../../api/customers';
import { useAuthStore } from '../../store/authStore';
import s from './Sales.module.css';

export default function SalesOrderList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ status: '', customer: '', dateFrom: '', dateTo: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const { data: _custRes } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => customersApi.list({ limit: 500 }) });
  const customers: any[] = (_custRes as any)?.data ?? [];

  const { data: _ordersRes, isLoading, refetch } = useQuery({
    queryKey: ['sales-orders', filters],
    queryFn: () => salesOrdersApi.list(filters),
  });
  const orders: any[] = (_ordersRes as any)?.data ?? [];

  const bulkMut = useMutation({
    mutationFn: () => salesOrdersApi.bulkStatus(selected, bulkStatus),
    onSuccess: () => { setSelected([]); setBulkStatus(''); qc.invalidateQueries({ queryKey: ['sales-orders'] }); },
  });

  const getBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'delivered') return s.badgeGreen;
    if (st === 'confirmed' || st === 'in progress') return s.badgeBlue;
    if (st === 'pending' || st === 'draft') return s.badgeYellow;
    if (st === 'cancelled' || st === 'void') return s.badgeRed;
    return s.badgeGray;
  };

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll = () => setSelected((orders as any[]).map((o: any) => String(o.ID ?? o.id)));

  return (
    <div data-testid="salesorderlist-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Sales Orders</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} data-testid="salesorderlist-new-btn" onClick={() => navigate('/sales/orders/entry')}>+ New Order</button>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="salesorderlist-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select data-testid="salesorderlist-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))}>
            <option value="">All Customers</option>
            {customers.map((c: any) => <option key={c.ID ?? c.id} value={String(c.ID ?? c.id)}>{c.Name ?? c.CustName ?? c.name}</option>)}
          </select>
          <input type="date" data-testid="salesorderlist-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="salesorderlist-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isSupervisorOrAdmin && selected.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{selected.length} selected</span>
            <select data-testid="salesorderlist-bulk-status-select" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option value="">Set Status…</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="salesorderlist-bulk-apply-btn" onClick={() => bulkMut.mutate()} disabled={!bulkStatus || bulkMut.isPending}>Apply</button>
          </div>
        )}

        {isLoading ? (
          <div data-testid="salesorderlist-skeleton" className={s.skeleton} style={{ height: '150px' }} />
        ) : (orders as any[]).length === 0 ? (
          <div className={s.empty}>No sales orders found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="salesorderlist-table">
              <thead>
                <tr>
                  {isSupervisorOrAdmin && <th><input type="checkbox" className={s.checkbox} onChange={selectAll} /></th>}
                  <th>Order #</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(orders as any[]).map((order: any) => {
                  const orderId = order.ID ?? order.id;
                  const orderStatus = order.StatusDescription ?? order.status ?? '';
                  return (
                  <tr key={orderId} data-testid={`salesorderlist-row-${orderId}`}>
                    {isSupervisorOrAdmin && (
                      <td><input type="checkbox" className={s.checkbox} checked={selected.includes(String(orderId))} onChange={() => toggleSelect(String(orderId))} /></td>
                    )}
                    <td>{order.Ordr ?? order.orderNo ?? orderId}</td>
                    <td>{order.CustomerName ?? order.customer ?? order.customerId}</td>
                    <td>{order.Ordt ?? order.orderDate}</td>
                    <td><span className={`${s.badge} ${getBadge(orderStatus)}`}>{orderStatus}</span></td>
                    <td>{(order.Nett ?? order.Total ?? order.total)?.toFixed(2) ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => navigate(`/sales/orders/${orderId}`)}>View</button>
                        {orderStatus !== 'Delivered' && (
                          <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => navigate(`/sales/orders/${orderId}/edit`)}>Edit</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
