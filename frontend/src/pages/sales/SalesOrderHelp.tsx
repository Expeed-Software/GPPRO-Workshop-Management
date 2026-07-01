import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

export default function SalesOrderHelp() {
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['order-help'], queryFn: () => salesOrdersApi.help() });

  const filtered = (orders as any[]).filter((o: any) =>
    !search || [o.id, o.orderNo, o.customer, o.status].some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div data-testid="sohelp-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Sales Order Help</h1>
      </div>

      <div className={s.card} data-testid="sohelp-faq-section">
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Reference</h2>
        {[
          ['How do I create an order?', 'Go to Sales Orders → New Order. Fill in Customer, Date, and at least one product line (BR-52).'],
          ['Can I edit a delivered order?', 'No. Orders in "Delivered" status are locked from editing (BR-57).'],
          ['How do I void an order?', 'Only Supervisors/Administrators can void orders. The order must not have an attached delivery note (BR-51).'],
          ['Who can change the status?', 'Status changes are restricted to Supervisors and Administrators (BR-53). A reason is required (BR-56).'],
        ].map(([q, a]) => (
          <details key={q} style={{ marginBottom: '0.75rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{q}</summary>
            <p style={{ marginTop: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>{a}</p>
          </details>
        ))}
      </div>

      <div className={s.card}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h2>
        <div className={s.filterBar}>
          <input placeholder="Search order #, customer, status…" data-testid="sohelp-search" value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 280 }} />
        </div>
        {isLoading ? (
          <div className={s.skeleton} style={{ height: '100px' }} />
        ) : filtered.length === 0 ? (
          <div className={s.empty}>No orders found.</div>
        ) : (
          <table className={s.table} data-testid="sohelp-orders-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.slice(0, 20).map((o: any, i: number) => (
                <tr key={o.id ?? i}><td>{o.orderNo ?? o.id}</td><td>{o.customer ?? o.customerId}</td><td>{o.status}</td>
                  <td><div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigator.clipboard?.writeText(String(o.id ?? ''))}>Copy #</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
