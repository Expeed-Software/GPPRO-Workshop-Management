import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function ItemDOSummary() {
  const [itemCode, setItemCode] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['item-do-summary', itemCode, filters],
    queryFn: () => itemCode ? itemsApi.doSummary(itemCode, filters) : Promise.resolve([]),
    enabled: !!itemCode,
  });

  const totalQty = (rows as any[]).reduce((sum: number, r: any) => sum + Number(r.totalQty ?? 0), 0);
  const totalAmt = (rows as any[]).reduce((sum: number, r: any) => sum + Number(r.totalAmount ?? 0), 0);

  return (
    <div data-testid="itemdosummary-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Item DO Summary</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code *" data-testid="itemdosummary-itemcode" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '100px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No DO summary for this item.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="itemdosummary-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Total Qty</th><th>Total Amount</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}><td>{r.itemCode}</td><td>{r.description}</td><td>{r.totalQty}</td><td>{Number(r.totalAmount ?? 0).toFixed(2)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={2}><strong>Total</strong></td><td><strong>{totalQty}</strong></td><td><strong>{totalAmt.toFixed(2)}</strong></td></tr></tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
