import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockValuation() {
  const [asOfDate, setAsOfDate] = useState('');

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-valuation', asOfDate],
    queryFn: () => stockApi.valuation({ asOfDate }),
    enabled: false,
  });

  const total = (rows as any[]).reduce((sum: number, r: any) => sum + Number(r.StockValue ?? r.totalValue ?? 0), 0);

  return (
    <div data-testid="stockvaluation-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Stock Valuation</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
      </div>
      <div className={s.card}>
        <div className={s.reorderAlert} style={{ marginBottom: '1rem' }}>Administrator access required (BR-74)</div>
        <div className={s.filterBar}>
          <input type="date" data-testid="stockvaluation-date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} placeholder="As of Date" />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No valuation data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="stockvaluation-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Total Value</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}><td>{r.ItemCode ?? r.itemCode}</td><td>{r.Description ?? r.description}</td><td>{r.StockQty ?? r.qty}</td><td>{Number(r.Cost ?? r.Srate ?? r.unitCost ?? 0).toFixed(2)}</td><td>{Number(r.StockValue ?? r.totalValue ?? 0).toFixed(2)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={4}><strong>Total</strong></td><td><strong>{total.toFixed(2)}</strong></td></tr></tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
