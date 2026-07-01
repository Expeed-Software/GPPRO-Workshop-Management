import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { vouchersExtApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function AccountVoucherDisplay() {
  const { code } = useParams<{ code: string }>();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['account-vouchers', code, filters],
    queryFn: () => vouchersExtApi.accountVouchers(code ?? '', filters),
    enabled: !!code,
  });

  return (
    <div data-testid="account-vouchers-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Account Vouchers — {code}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No vouchers found for this account.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="account-vouchers-table">
              <thead><tr><th>Voucher #</th><th>Date</th><th>Type</th><th>Debit</th><th>Credit</th><th>Narration</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`account-vouchers-row-${i}`}>
                    <td>{r.VSRL}</td><td>{r.DATE}</td><td>{r.VTYPE}</td>
                    <td>{r.DEBT ? Number(r.DEBT).toFixed(2) : '—'}</td>
                    <td>{r.CRED ? Number(r.CRED).toFixed(2) : '—'}</td>
                    <td>{r.NARRATION ?? r.Lnarration ?? '—'}</td>
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
