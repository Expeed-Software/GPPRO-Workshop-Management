import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../../api/sales';
import { useAuthStore } from '../../store/authStore';
import s from './Sales.module.css';

export default function DeliveryNoteReport() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', customer: '', orderNo: '' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['delivery-note-report', filters],
    queryFn: () => deliveryApi.report(filters),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  return (
    <div data-testid="deliverynotereport-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Delivery Note Report</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid="deliverynotereport-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" data-testid="deliverynotereport-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Customer" data-testid="deliverynotereport-filter-customer" value={filters.customer} onChange={(e) => setFilters((p) => ({ ...p, customer: e.target.value }))} />
          <input placeholder="Order #" data-testid="deliverynotereport-filter-orderno" value={filters.orderNo} onChange={(e) => setFilters((p) => ({ ...p, orderNo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="deliverynotereport-table">
              <thead>
                <tr><th>Note #</th><th>Order #</th><th>Customer</th><th>Delivery Date</th><th>Delivered By</th><th>Products</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <React.Fragment key={i}>
                    <tr data-testid={`deliverynotereport-row-${i}`}>
                      <td>{r.ID ?? r.noteId}</td><td>{r.Ordr ?? r.orderId}</td><td>{r.CustomerName ?? r.customer}</td>
                      <td>{r.DODt ?? r.deliveryDate}</td><td>{r.User ?? r.deliveredBy}</td>
                      <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => setExpanded(expanded === String(i) ? null : String(i))}>
                        {expanded === String(i) ? 'Hide' : 'View Products'}
                      </button></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${r.ID ?? r.id}/print`)}>Print</button>
                          <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${r.ID ?? r.id}/export`)}>Export</button>
                          {isSupervisorOrAdmin && <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${r.ID ?? r.id}/audit`)}>Audit</button>}
                        </div>
                      </td>
                    </tr>
                    {expanded === String(i) && (
                      <tr>
                        <td colSpan={7} style={{ background: '#f9fafb', padding: '1rem' }}>
                          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                            <tbody>
                              {[
                                ['LPO / Ref', r.Lpo],
                                ['Total', r.Total?.toFixed(2)],
                                ['Net', r.Nett?.toFixed(2)],
                                ['Remarks', r.Remarks],
                                ['Company Code', r.Ccode],
                                ['Year', r.yr],
                              ].map(([label, val]) => val != null && val !== '' && (
                                <tr key={label as string}>
                                  <td style={{ padding: '0.25rem 0.5rem', color: '#6b7280', width: '140px' }}>{label}</td>
                                  <td style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}>{val}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
