import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi, itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockDisplay() {
  const [filters, setFilters] = useState({ category: '', search: '' });

  const { data: catData = [] } = useQuery({ queryKey: ['item-categories'], queryFn: () => itemsApi.categories() });
  const categories: any[] = catData as any[];

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-display', filters],
    queryFn: () => stockApi.display(filters),
  });

  return (
    <div data-testid="stockdisplay-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Display</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search item..." data-testid="stockdisplay-search" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.CatID} value={c.CatID}>{c.CatID}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Refresh</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No stock data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockdisplay-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Unit</th><th>Category</th><th>Available Qty</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => {
                  const qty = r.qty ?? r.StockQty ?? r.availableQty ?? 0;
                  const below = Number(qty) < Number(r.ReOrder ?? r.reorderQty ?? 0);
                  return (
                    <tr key={i}>
                      <td>{r.ItemCode ?? r.itemCode}</td><td>{r.Description ?? r.description ?? '—'}</td><td>{r.Denom ?? r.unit}</td><td>{r.CatID ?? r.category ?? '—'}</td>
                      <td>{qty}</td><td>{r.ReOrder ?? r.reorderQty ?? 0}</td>
                      <td><span className={`${s.badge} ${below ? s.badgeRed : s.badgeGreen}`}>{below ? 'Low' : 'OK'}</span></td>
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
