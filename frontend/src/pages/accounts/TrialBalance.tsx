import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trialBalanceApi } from '../../api/accounts';
import s from './Accounts.module.css';

interface Props {
  title: string;
  queryKey: string;
  fetchFn: (p: any) => Promise<any>;
  testidPrefix: string;
}

function TrialBalanceBase({ title, queryKey, fetchFn, testidPrefix }: Props) {
  const [filters, setFilters] = useState({ accountGroup: '', fromDate: '', toDate: '', period: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => fetchFn(filters),
    enabled: false,
  });

  const totalDr = (rows as any[]).reduce((sum, r) => sum + Number(r.TotalDebit ?? r.debit ?? r.dr ?? 0), 0);
  const totalCr = (rows as any[]).reduce((sum, r) => sum + Number(r.TotalCredit ?? r.credit ?? r.cr ?? 0), 0);

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export-btn`}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Account Group" data-testid={`${testidPrefix}-filter-group`} value={filters.accountGroup} onChange={(e) => setFilters((p) => ({ ...p, accountGroup: e.target.value }))} />
          <input placeholder="Period" data-testid={`${testidPrefix}-filter-period`} value={filters.period} onChange={(e) => setFilters((p) => ({ ...p, period: e.target.value }))} />
          <input type="date" data-testid={`${testidPrefix}-filter-datefrom`} value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${testidPrefix}-generate-btn`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '160px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data. Select filters and click Generate.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={`${s.table} ${s.debitCredit}`} data-testid={`${testidPrefix}-table`}>
              <thead>
                <tr><th>Code</th><th>Account Name</th><th>Opening Dr</th><th>Opening Cr</th><th>Debit</th><th>Credit</th><th>Closing Dr</th><th>Closing Cr</th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    <td>{r.AccountCode ?? r.CODES ?? r.code ?? r.acCode}</td>
                    <td>{r.AccountName ?? r.name ?? r.acName}</td>
                    <td>{'—'}</td>
                    <td>{'—'}</td>
                    <td>{r.TotalDebit != null ? Number(r.TotalDebit).toFixed(2) : '—'}</td>
                    <td>{r.TotalCredit != null ? Number(r.TotalCredit).toFixed(2) : '—'}</td>
                    <td>{r.NetBalance != null && r.NetBalance > 0 ? Number(r.NetBalance).toFixed(2) : '—'}</td>
                    <td>{r.NetBalance != null && r.NetBalance < 0 ? Number(Math.abs(r.NetBalance)).toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><strong>Total</strong></td>
                  <td><strong>{totalDr.toFixed(2)}</strong></td>
                  <td><strong>{totalCr.toFixed(2)}</strong></td>
                  <td colSpan={2}><span className={`${s.badge} ${Math.abs(totalDr - totalCr) < 0.01 ? s.badgeGreen : s.badgeRed}`}>{Math.abs(totalDr - totalCr) < 0.01 ? 'Balanced' : 'Difference: ' + Math.abs(totalDr - totalCr).toFixed(2)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const TrialBalance = () => <TrialBalanceBase title="Trial Balance" queryKey="trial-balance" fetchFn={trialBalanceApi.get} testidPrefix="trialbalance" />;
export const TrialBalanceSummary = () => <TrialBalanceBase title="Trial Balance Summary" queryKey="trial-balance-summary" fetchFn={trialBalanceApi.summary} testidPrefix="trialbalance-summary" />;
export const TrialBalanceTest = () => <TrialBalanceBase title="Trial Balance (Test)" queryKey="trial-balance-test" fetchFn={trialBalanceApi.test} testidPrefix="trialbalance-test" />;
export const TrialBalanceTest111 = () => <TrialBalanceBase title="Trial Balance Test 111" queryKey="trial-balance-test111" fetchFn={trialBalanceApi.test111} testidPrefix="trialbalance-test111" />;

export default TrialBalanceBase;
