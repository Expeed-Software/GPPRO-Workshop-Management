import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi, itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockAgingReport() {
  const [filters, setFilters] = useState({ asOfDate: '', category: '' });

  const { data: catData = [] } = useQuery({ queryKey: ['item-categories'], queryFn: () => itemsApi.categories() });
  const categories: any[] = catData as any[];

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-aging', filters],
    queryFn: () => stockApi.agingReport(filters),
    enabled: false,
  });

  return (
    <div data-testid="stockaging-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Stock Aging Report</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
      </div>
      <div className={s.card}>
        <div className={s.reorderAlert} style={{ marginBottom: '1rem' }}>Administrator access required (BR-80)</div>
        <div className={s.filterBar}>
          <input type="date" value={filters.asOfDate} onChange={(e) => setFilters((p) => ({ ...p, asOfDate: e.target.value }))} placeholder="As of Date" />
          <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.CatID} value={c.CatID}>{c.CatID}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No aging data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockaging-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Qty</th><th>0-30 days</th><th>31-60 days</th><th>61-90 days</th><th>90+ days</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}><td>{r.itemCode}</td><td>{r.description}</td><td>{r.qty}</td><td>{r.days0_30 ?? '—'}</td><td>{r.days31_60 ?? '—'}</td><td>{r.days61_90 ?? '—'}</td><td>{r.days90plus ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
