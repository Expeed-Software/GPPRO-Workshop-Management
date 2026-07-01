import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockAvailability() {
  const [itemCode, setItemCode] = useState('');
  const [queried, setQueried] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['stock-qty', queried],
    queryFn: () => stockApi.qty(queried),
    enabled: !!queried,
  });

  const row = Array.isArray(data) ? data[0] : data;

  return (
    <div data-testid="stockavailability-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Availability</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Enter Item Code" data-testid="stockavailability-itemcode" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="stockavailability-check-btn" onClick={() => setQueried(itemCode)}>Check</button>
        </div>
        {isLoading && <div className={s.skeleton} style={{ height: '80px' }} />}
        {row && (
          <div className={s.summaryCards}>
            <div className={s.summaryCard}><div className={s.value}>{row.availableQty ?? row.qty ?? 0}</div><div className={s.label}>Available Qty</div></div>
            <div className={s.summaryCard}><div className={s.value}>{row.totalIn ?? '—'}</div><div className={s.label}>Total In</div></div>
            <div className={s.summaryCard}><div className={s.value}>{row.totalOut ?? '—'}</div><div className={s.label}>Total Out</div></div>
            <div className={s.summaryCard}><div className={s.value}>{row.ReOrder ?? row.reorderQty ?? '—'}</div><div className={s.label}>Reorder Level</div></div>
          </div>
        )}
        {row && Number(row.availableQty ?? row.qty ?? 0) < Number(row.ReOrder ?? row.reorderQty ?? 0) && (
          <div className={s.reorderAlert} data-testid="stockavailability-reorder-alert">Reorder Required — Available qty is below reorder level (BR-75)</div>
        )}
      </div>
    </div>
  );
}
