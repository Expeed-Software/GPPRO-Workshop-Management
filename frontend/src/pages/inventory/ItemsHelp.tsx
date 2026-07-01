import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function ItemsHelp() {
  const [search, setSearch] = useState('');
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items-help', search],
    queryFn: () => itemsApi.help({ search }),
  });

  return (
    <div data-testid="itemshelp-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Items Help</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search item code or description..." data-testid="itemshelp-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isLoading ? <div data-testid="itemshelp-skeleton" className={s.skeleton} style={{ height: '120px' }} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="itemshelp-table">
              <thead><tr><th>Item Code</th><th>Description</th><th>Unit</th><th>Category</th><th>Reorder Qty</th></tr></thead>
              <tbody>
                {(items as any[]).map((item: any, i: number) => (
                  <tr key={item.ItemCode ?? i}><td>{item.ItemCode}</td><td>{item.Description}</td><td>{item.Denom}</td><td>{item.CatID ?? '—'}</td><td>{item.ReOrder ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
