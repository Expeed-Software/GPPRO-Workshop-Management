import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import { downloadCsv } from '../../utils/export';
import s from './Banking.module.css';

interface Props { type?: 'bank' | 'cash'; }

const BANK_BOOK_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference' },
  { key: 'description', label: 'Description' },
  { key: 'debit', label: 'Debit' },
  { key: 'credit', label: 'Credit' },
  { key: 'balance', label: 'Balance' },
];

function toBankBookExportRow(r: any) {
  return {
    date: r.DATE ?? r.date,
    reference: r.REFNO ?? r.reference,
    description: r.NARRATION ?? r.description,
    debit: r.TRANTYPE === 'Debit' ? (r.AMT ?? r.debit ?? '') : '',
    credit: r.TRANTYPE === 'Credit' ? (r.AMT ?? r.credit ?? '') : '',
    balance: r.BALANCE ?? r.balance ?? '',
  };
}

export default function BankBook({ type = 'bank' }: Props) {
  const prefix = type === 'cash' ? 'cashbook' : 'bankbook';
  const title = type === 'cash' ? 'Cash Book' : 'Bank Book';
  const [filters, setFilters] = useState({ account: '', fromDate: '', toDate: '', type: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts-recon'],
    queryFn: () => bankingApi.bankAccountsForRecon(),
  });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [prefix, filters],
    queryFn: () => bankingApi.bankBook({ ...filters, bookType: type }),
    enabled: false,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!filters.account) e.account = 'Account is required';
    if (!filters.fromDate || !filters.toDate) e.date = 'Date range is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const total = (rows as any[]).reduce((sum: number, r: any) => sum + Number(r.AMT ?? r.amount ?? 0), 0);

  return (
    <div data-testid={`${prefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${prefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${prefix}-export-btn`} disabled={isLoading || (rows as any[]).length === 0} onClick={() => downloadCsv(`${prefix}.csv`, (rows as any[]).map(toBankBookExportRow), BANK_BOOK_COLUMNS)}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid={`${prefix}-filter-bank`} value={filters.account} onChange={(e) => setFilters((p) => ({ ...p, account: e.target.value }))} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minWidth: '220px' }}>
            <option value="">Bank Account *</option>
            {(bankAccounts as any[]).map((a: any) => (
              <option key={a.ID} value={String(a.ID)}>{a.HEAD}{a.CODES ? ` (${a.CODES})` : ''}</option>
            ))}
          </select>
          <input type="date" data-testid={`${prefix}-filter-daterange`} value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
          <select data-testid={`${prefix}-filter-type`} value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${prefix}-submit-btn`} onClick={() => { if (validate()) refetch(); }}>Generate</button>
        </div>
        {errors.account && <div className={s.fieldError}>{errors.account}</div>}
        {errors.date && <div className={s.fieldError}>{errors.date}</div>}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No bank transactions for selection.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${prefix}-table-row-${i}`}>
                    <td>{r.DATE ?? r.date}</td><td>{r.REFNO ?? r.reference}</td><td>{r.NARRATION ?? r.description}</td>
                    <td>{r.TRANTYPE === 'Debit' ? (r.AMT ?? r.debit ?? '—') : '—'}</td><td>{r.TRANTYPE === 'Credit' ? (r.AMT ?? r.credit ?? '—') : '—'}</td><td>{r.BALANCE ?? r.balance ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3}><strong>Total</strong></td><td colSpan={3}><strong>{total.toFixed(2)}</strong></td></tr></tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const CashBook = () => <BankBook type="cash" />;
