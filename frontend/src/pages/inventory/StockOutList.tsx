import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockOutList() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', itemCode: '', referenceNo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-out-list', filters],
    queryFn: () => stockApi.outList(filters),
  });

  return (
    <div data-testid="stockoutlist-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Out List</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code" data-testid="stockoutlist-itemcode" value={filters.itemCode} onChange={(e) => setFilters((p) => ({ ...p, itemCode: e.target.value }))} />
          <input type="date" data-testid="stockoutlist-datefrom" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Reference No" value={filters.referenceNo} onChange={(e) => setFilters((p) => ({ ...p, referenceNo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No stock out records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockoutlist-table">
              <thead><tr><th>Date</th><th>Stock No</th><th>Reference</th><th>Total</th><th>Remarks</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={r.ID ?? i}><td>{r.StockDt ?? r.date}</td><td>{r.StockNo ?? r.itemCode}</td><td>{r.Ref ?? r.referenceNo}</td><td>{r.Total ?? r.qty}</td><td>{r.Remarks ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
