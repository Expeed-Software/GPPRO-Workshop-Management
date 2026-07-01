import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi, itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockReorderStatus() {
  const [filters, setFilters] = useState({ category: '', search: '' });

  const { data: catData = [] } = useQuery({ queryKey: ['item-categories'], queryFn: () => itemsApi.categories() });
  const categories: any[] = catData as any[];

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-reorder', filters],
    queryFn: () => stockApi.reorderStatus(filters),
  });

  const belowReorder = (rows as any[]).filter((r: any) => Number(r.StockQty ?? 0) < Number(r.ReOrder ?? 0));

  return (
    <div data-testid="stockreorder-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Reorder Status</h1></div>
      <div className={s.card}>
        {belowReorder.length > 0 && (
          <div className={s.reorderAlert} style={{ marginBottom: '1rem' }} data-testid="stockreorder-alert">{belowReorder.length} item(s) below reorder level (BR-75)</div>
        )}
        <div className={s.filterBar}>
          <input placeholder="Search item..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.CatID} value={c.CatID}>{c.CatID}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Refresh</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>All items are above reorder levels.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockreorder-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Available Qty</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => {
                  const below = Number(r.StockQty ?? 0) < Number(r.ReOrder ?? 0);
                  return (
                    <tr key={i}>
                      <td>{r.ItemCode}</td><td>{r.Description}</td><td>{r.StockQty}</td><td>{r.ReOrder}</td>
                      <td><span className={`${s.badge} ${below ? s.badgeRed : s.badgeGreen}`}>{below ? 'Reorder' : 'OK'}</span></td>
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
