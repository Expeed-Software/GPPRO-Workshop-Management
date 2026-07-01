import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function ItemPendingDOList() {
  const [itemCode, setItemCode] = useState('');

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['item-pending-do', itemCode],
    queryFn: () => itemCode ? itemsApi.pendingDOList(itemCode, {}) : Promise.resolve([]),
    enabled: !!itemCode,
  });

  return (
    <div data-testid="itempendingdolist-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Item Pending DO List</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code *" data-testid="itempendingdolist-itemcode" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '100px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No pending delivery orders for this item.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="itempendingdolist-table">
              <thead><tr><th>DO Number</th><th>PO Number</th><th>Supplier</th><th>Expected Date</th><th>Pending Qty</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}><td>{r.doNumber}</td><td>{r.poNumber}</td><td>{r.supplier}</td><td>{r.expectedDate ?? '—'}</td><td>{r.pendingQty ?? r.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
