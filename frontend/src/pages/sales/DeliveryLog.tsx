import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../../api/sales';
import { customersApi } from '../../api/customers';
import s from './Sales.module.css';

export default function DeliveryLog() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', customer: '', deliveredBy: '' });

  const { data: _custRes } = useQuery({ queryKey: ['customers-dropdown'], queryFn: () => customersApi.list({ limit: 500 }) });
  const customers: any[] = (_custRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['delivery-log', filters],
    queryFn: () => deliveryApi.log(filters),
  });
  const logs: any[] = (_res as any)?.data ?? [];

  return (
    <div data-testid="deliverylog-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Delivery Log</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid="deliverylog-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="deliverylog-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <select data-testid="deliverylog-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))}>
            <option value="">All Customers</option>
            {customers.map((c: any) => <option key={c.ID ?? c.id} value={String(c.ID ?? c.id)}>{c.Name ?? c.CustName ?? c.name}</option>)}
          </select>
          <input placeholder="Delivered By" data-testid="deliverylog-filter-deliveredby" value={filters.deliveredBy} onChange={(e) => setFilters((p) => ({ ...p, deliveredBy: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : (logs as any[]).length === 0 ? (
          <div className={s.empty}>No delivery log entries found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="deliverylog-table">
              <thead>
                <tr><th>Note #</th><th>Order #</th><th>Customer</th><th>Delivered By</th><th>Delivery Date</th><th>Recipient</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {(logs as any[]).map((log: any, i: number) => (
                  <tr key={log.ID ?? log.id ?? i} data-testid={`deliverylog-row-${log.ID ?? log.id}`}>
                    <td>{log.DONo ?? log.ID}</td>
                    <td>{log.Ordr ?? log.orderId}</td>
                    <td>{log.CustomerName ?? log.customer}</td>
                    <td>{log.User ?? log.deliveredBy}</td>
                    <td>{log.DODt ?? log.deliveryDate}</td>
                    <td>{log.Remarks ?? log.recipientName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${log.ID ?? log.id}/print`)}>Print</button>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${log.ID ?? log.id}/export`)}>Export</button>
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
