import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '../../api/accounts';
import s from './Accounts.module.css';

interface Props {
  title: string;
  queryKey: string;
  fetchFn: (params: any) => Promise<any>;
  testidPrefix: string;
  requireAccount?: boolean;
}

function LedgerReport({ title, queryKey, fetchFn, testidPrefix, requireAccount = true }: Props) {
  const [filters, setFilters] = useState({ account: '', fromDate: '', toDate: '', voucherType: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => fetchFn(filters),
    enabled: false,
  });

  const drTotal = (rows as any[]).reduce((s: number, r: any) => s + Number(r.DEBT ?? r.debit ?? 0), 0);
  const crTotal = (rows as any[]).reduce((s: number, r: any) => s + Number(r.CRED ?? r.credit ?? 0), 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (requireAccount && !filters.account) e.account = 'Account is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export-btn`} disabled={isLoading}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          {requireAccount && <input placeholder="Account *" data-testid={`${testidPrefix}-filter-account`} value={filters.account} onChange={(e) => setFilters((p) => ({ ...p, account: e.target.value }))} />}
          <input type="date" data-testid={`${testidPrefix}-filter-datefrom`} value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
          <select value={filters.voucherType} onChange={(e) => setFilters((p) => ({ ...p, voucherType: e.target.value }))}>
            <option value="">All Types</option>
            <option value="Journal">Journal</option>
            <option value="Payment">Payment</option>
            <option value="Receipt">Receipt</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${testidPrefix}-generate-btn`} onClick={() => { if (validate()) refetch(); }}>Generate</button>
        </div>
        {errors.account && <div className={s.fieldError}>{errors.account}</div>}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No ledger entries.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={`${s.table} ${s.debitCredit}`} data-testid={`${testidPrefix}-table`}>
              <thead><tr><th>Date</th><th>Voucher #</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th><th>Reference</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    <td>{r.DATE ?? r.date}</td><td>{r.VSRL ?? r.voucherNo ?? r.vsrl}</td><td>{r.NARRATION ?? r.description}</td>
                    <td>{r.DEBT ?? r.debit ? Number(r.DEBT ?? r.debit).toFixed(2) : '—'}</td>
                    <td>{r.CRED ?? r.credit ? Number(r.CRED ?? r.credit).toFixed(2) : '—'}</td>
                    <td>{r.NetBalance != null ? Number(r.NetBalance).toFixed(2) : (r.balance != null ? Number(r.balance).toFixed(2) : '—')}</td>
                    <td>{r.REFNO ?? r.reference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3}><strong>Total</strong></td><td><strong>{drTotal.toFixed(2)}</strong></td><td><strong>{crTotal.toFixed(2)}</strong></td><td colSpan={2} /></tr></tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const LedgerReportPage = () => <LedgerReport title="Ledger Report" queryKey="ledger-report" fetchFn={ledgerApi.report} testidPrefix="ledger-report" />;
export const LedgerActualDateReport = () => <LedgerReport title="Ledger (Actual Date)" queryKey="ledger-actual-date" fetchFn={ledgerApi.actualDateReport} testidPrefix="ledger-actualdate-report" />;
export const LedgerPDCReport = () => <LedgerReport title="PDC Ledger" queryKey="ledger-pdc" fetchFn={ledgerApi.pdcReport} testidPrefix="ledger-pdc" />;
export const LedgerSummaryReport = () => <LedgerReport title="Ledger Summary" queryKey="ledger-summary" fetchFn={ledgerApi.summaryReport} testidPrefix="ledger-summary" requireAccount={false} />;
export const LedgerSummaryActual = () => <LedgerReport title="Ledger Summary (Actual)" queryKey="ledger-summary-actual" fetchFn={ledgerApi.summaryActual} testidPrefix="ledger-summary-actual" requireAccount={false} />;
export const LedgerShortReport = () => <LedgerReport title="Ledger Short Report" queryKey="ledger-short" fetchFn={ledgerApi.shortReport} testidPrefix="ledger-short" requireAccount={false} />;
export const GroupLedgerSummary = () => <LedgerReport title="Group Ledger Summary" queryKey="group-ledger-summary" fetchFn={ledgerApi.groupSummary} testidPrefix="group-ledger" requireAccount={false} />;
export const LedgerAccountsAudit = () => <LedgerReport title="Ledger Accounts Audit" queryKey="ledger-accounts-audit" fetchFn={ledgerApi.audit} testidPrefix="ledger-accounts-audit" requireAccount={false} />;

export default LedgerReport;
