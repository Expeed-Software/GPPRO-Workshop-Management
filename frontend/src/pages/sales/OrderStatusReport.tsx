import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

export default function OrderStatusReport() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '', customer: '', orderNo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['order-status-report', filters],
    queryFn: () => salesOrdersApi.statusReport(filters),
  });

  return (
    <div data-testid="orderstatusreport-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Order Status Report</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid="orderstatusreport-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="orderstatusreport-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <select data-testid="orderstatusreport-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option><option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
          </select>
          <input placeholder="Customer" data-testid="orderstatusreport-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))} />
          <input placeholder="Order #" data-testid="orderstatusreport-filter-orderno" value={filters.orderNo} onChange={(e) => setFilters((p) => ({ ...p, orderNo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="orderstatusreport-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Changed On</th><th>Changed By</th><th>Previous Status</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`orderstatusreport-row-${i}`}>
                    <td>{r.Ordr ?? r.id}</td><td>{r.CustomerName}</td><td>{r.StatusDescription}</td>
                    <td>{'—'}</td><td>{'—'}</td>
                    <td>{'—'}</td><td>{'—'}</td>
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
