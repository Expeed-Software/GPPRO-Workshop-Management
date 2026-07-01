import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockAuditLog() {
  const [filters, setFilters] = useState({ itemCode: '', action: '', dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-audit', filters],
    queryFn: () => stockApi.auditLogs(filters),
  });

  return (
    <div data-testid="stockaudit-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Audit Log</h1></div>
      <div className={s.card}>
        <div className={s.reorderAlert} style={{ marginBottom: '1rem' }}>Supervisor or Administrator access required (BR-77)</div>
        <div className={s.filterBar}>
          <input placeholder="Item Code" data-testid="stockaudit-itemcode" value={filters.itemCode} onChange={(e) => setFilters((p) => ({ ...p, itemCode: e.target.value }))} />
          <select value={filters.action} onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}>
            <option value="">All Actions</option>
            <option value="stock-in">Stock In</option>
            <option value="stock-out">Stock Out</option>
            <option value="manual-adjust">Manual Adjust</option>
            <option value="physical-adjust">Physical Adjust</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No audit records.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockaudit-table">
              <thead><tr><th>Date</th><th>Item Code</th><th>Action</th><th>User</th><th>Before</th><th>After</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.createdAt ?? r.date}</td>
                    <td>{r.entityId}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>{r.action}</span></td>
                    <td>{r.userId}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>{r.before ?? '—'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>{r.after ?? '—'}</td>
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
