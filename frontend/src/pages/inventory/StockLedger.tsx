import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockLedger() {
  const [filters, setFilters] = useState({ itemCode: '', dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-ledger', filters],
    queryFn: () => stockApi.ledger(filters),
    enabled: !!filters.itemCode,
  });

  return (
    <div data-testid="stockledger-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Ledger</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code *" data-testid="stockledger-itemcode" value={filters.itemCode} onChange={(e) => setFilters((p) => ({ ...p, itemCode: e.target.value }))} />
          <input type="date" data-testid="stockledger-datefrom" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No ledger entries.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockledger-table">
              <thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>In Qty</th><th>Out Qty</th><th>Balance</th><th>Unit Cost</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.Date ?? r.date}</td><td>{r.RefNo ?? r.referenceNo}</td>
                    <td><span className={`${s.badge} ${(r.TRType ?? r.type) === 'IN' ? s.badgeGreen : s.badgeRed}`}>{r.TRType ?? r.type}</span></td>
                    <td>{r.StkIN ?? r.inQty ?? '—'}</td><td>{r.StkOut ?? r.outQty ?? '—'}</td><td>{r.balance ?? '—'}</td><td>{r.Rate ?? r.unitCost}</td>
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
