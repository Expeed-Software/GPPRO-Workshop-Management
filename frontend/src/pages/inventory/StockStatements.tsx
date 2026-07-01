import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import { downloadCsv } from '../../utils/export';
import s from './Inventory.module.css';

const STOCK_STATEMENT_COLUMNS = [
  { key: 'Date', label: 'Date' },
  { key: 'Itemcode', label: 'Item Code' },
  { key: 'ItemDescription', label: 'Description' },
  { key: 'StkIN', label: 'In Qty' },
  { key: 'StkOut', label: 'Out Qty' },
];

interface Props {
  title: string;
  queryKey: string;
  fetchFn: (params: any) => Promise<any>;
  testidPrefix: string;
}

function StockStatement({ title, queryKey, fetchFn, testidPrefix }: Props) {
  const [filters, setFilters] = useState({ itemCode: '', dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => fetchFn(filters),
  });

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export`} onClick={() => downloadCsv(`${testidPrefix}.csv`, rows as any[], STOCK_STATEMENT_COLUMNS)}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Item Code" data-testid={`${testidPrefix}-itemcode`} value={filters.itemCode} onChange={(e) => setFilters((p) => ({ ...p, itemCode: e.target.value }))} />
          <input type="date" data-testid={`${testidPrefix}-datefrom`} value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No statement data.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr><th>Date</th><th>Item Code</th><th>Description</th><th>In Qty</th><th>Out Qty</th><th>Balance</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}><td>{r.Date}</td><td>{r.Itemcode}</td><td>{r.ItemDescription}</td><td>{r.StkIN ?? '—'}</td><td>{r.StkOut ?? '—'}</td><td>{'—'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const StockStatementMain = () => <StockStatement title="Stock Statement" queryKey="stock-stmt" fetchFn={(p) => stockApi.statement(p)} testidPrefix="stockstatement" />;
export const StockStatement1 = () => <StockStatement title="Stock Statement 1" queryKey="stock-stmt1" fetchFn={(p) => stockApi.statement1(p)} testidPrefix="stockstatement1" />;
export const StockStatementFromItemFile = () => <StockStatement title="Stock Statement From Item File" queryKey="stock-stmt-itemfile" fetchFn={(p) => stockApi.statementFromItemFile(p)} testidPrefix="stockstatement-itemfile" />;
export const StockStatementDD = () => <StockStatement title="Stock Statement DD" queryKey="stock-stmt-dd" fetchFn={(p) => stockApi.statementDD(p)} testidPrefix="stockstatement-dd" />;

export default StockStatement;
