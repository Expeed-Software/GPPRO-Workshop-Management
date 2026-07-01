import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function CBPBook() {
  const [filters, setFilters] = useState({ accountType: '', fromDate: '', toDate: '', tranType: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['cbpbook', filters],
    queryFn: () => bankingApi.cbpBook(filters),
    enabled: false,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!filters.accountType) e.accountType = 'Account type is required';
    if (!filters.fromDate || !filters.toDate) e.date = 'Period is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid="cbpbook-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Cash/Bank Book Report (CBPBook)</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="cbpbook-print-btn" onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="cbpbook-export-btn" disabled={isLoading || (rows as any[]).length === 0}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid="cbpbook-filter-daterange" value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} placeholder="From" />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
          <select data-testid="cbpbook-filter-accounttype" value={filters.accountType} onChange={(e) => setFilters((p) => ({ ...p, accountType: e.target.value }))}>
            <option value="">Account Type *</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>
          <select data-testid="cbpbook-filter-transtype" value={filters.tranType} onChange={(e) => setFilters((p) => ({ ...p, tranType: e.target.value }))}>
            <option value="">All Transactions</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="cbpbook-submit-btn" onClick={() => { if (validate()) refetch(); }}>Generate</button>
        </div>
        {errors.accountType && <div className={s.fieldError}>{errors.accountType}</div>}
        {errors.date && <div className={s.fieldError}>{errors.date}</div>}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No transactions for the selected period.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>Date</th><th>Account</th><th>Type</th><th>Reference</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`cbpbook-table-row-${i}`}>
                    <td>{r.DATE ? new Date(r.DATE).toLocaleDateString() : '—'}</td><td>{r.NARRATION ?? '—'}</td>
                    <td><span className={`${s.badge} ${r.TRANTYPE === 'Debit' ? s.badgeRed : s.badgeGreen}`}>{r.TRANTYPE ?? '—'}</span></td>
                    <td>{r.REFNO ?? '—'}</td><td>—</td><td>—</td><td>—</td>
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
