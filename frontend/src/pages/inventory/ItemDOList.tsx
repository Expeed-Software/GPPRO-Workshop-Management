import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function ItemDOList() {
  const [itemCode, setItemCode] = useState('');
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['item-do-list', itemCode, filters],
    queryFn: () => itemCode ? itemsApi.doList(itemCode, filters) : Promise.resolve([]),
    enabled: !!itemCode,
  });

  return (
    <div data-testid="itemdolist-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Item DO List</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code *" data-testid="itemdolist-itemcode" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <input type="date" data-testid="itemdolist-datefrom" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '100px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No delivery orders found for this item.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="itemdolist-table">
              <thead><tr><th>ID</th><th>Date</th><th>Item Code</th><th>Ref No</th><th>Stock In</th><th>Stock Out</th><th>Rate</th><th>Type</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={r.ID ?? i}><td>{r.ID}</td><td>{r.Date}</td><td>{r.Itemcode}</td><td>{r.RefNo ?? '—'}</td><td>{r.StkIN ?? '—'}</td><td>{r.StkOut ?? '—'}</td><td>{r.Rate ?? '—'}</td><td>{r.TRType ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
