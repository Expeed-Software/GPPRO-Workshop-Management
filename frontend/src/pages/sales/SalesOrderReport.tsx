import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

export default function SalesOrderReport() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', customer: '', status: '', orderNo: '' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['sales-order-report', filters],
    queryFn: () => salesOrdersApi.report(filters),
  });

  return (
    <div data-testid="salesorderreport-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Sales Order Report</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid="salesorderreport-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="salesorderreport-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Customer" data-testid="salesorderreport-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))} />
          <select data-testid="salesorderreport-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option><option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
          </select>
          <input placeholder="Order #" data-testid="salesorderreport-filter-orderno" value={filters.orderNo} onChange={(e) => setFilters((p) => ({ ...p, orderNo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="salesorderreport-table">
              <thead>
                <tr><th>Order #</th><th>Date</th><th>Customer</th><th>Status</th><th>Total</th><th>Created By</th><th>Last Edited</th><th></th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <React.Fragment key={i}>
                    <tr data-testid={`salesorderreport-row-${i}`}>
                      <td>{r.Ordr ?? r.id}</td><td>{r.Ordt}</td><td>{r.CustomerName}</td><td>{r.StatusDescription}</td>
                      <td>{(r.Nett ?? r.Total)?.toFixed(2) ?? '—'}</td><td>{r.CreatedBy ?? '—'}</td>
                      <td>{r.EditedBy ? `${r.EditedBy} (${r.EditedDt ?? ''})` : '—'}</td>
                      <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => setExpanded(expanded === String(i) ? null : String(i))}>
                        {expanded === String(i) ? 'Collapse' : 'Details'}
                      </button></td>
                    </tr>
                    {expanded === String(i) && (
                      <tr>
                        <td colSpan={8} style={{ background: '#f9fafb', padding: '1rem' }}>
                          <strong>Items:</strong>
                          <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{JSON.stringify(r.items || [], null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
