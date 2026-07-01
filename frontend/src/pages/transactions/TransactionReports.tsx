import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi, receiptsApi } from '../../api/transactions';
import s from './Transactions.module.css';

interface Props { type: 'receipts' | 'payments' | 'receipts-backup'; title: string; testidPrefix: string; }

function TransactionReport({ type, title, testidPrefix }: Props) {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', party: '', status: '', method: '' });

  const fetchFn = type === 'receipts' ? receiptsApi.report : type === 'payments' ? paymentsApi.report : receiptsApi.backupReport;

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [`${type}-report`, filters],
    queryFn: () => fetchFn(filters),
    enabled: false,
  });

  const total = (rows as any[]).reduce((sum, r) => sum + Number(r.DEBT ?? r.CRED ?? 0), 0);

  return (
    <div data-testid={`${testidPrefix}-root`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export-pdf`}>Export PDF</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} placeholder="From" />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} placeholder="To" />
          <input placeholder="Party" value={filters.party} onChange={(e) => setFilters((p) => ({ ...p, party: e.target.value }))} />
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}><option value="">All Status</option><option>Pending</option><option>Posted</option></select>
          {type !== 'receipts-backup' && <select value={filters.method} onChange={(e) => setFilters((p) => ({ ...p, method: e.target.value }))}><option value="">All Methods</option><option>Cash</option><option>Cheque</option><option>Transfer</option></select>}
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data. Apply filters and click Generate.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr><th>Date</th><th>Party</th><th>Method</th><th>Amount</th><th>Ref</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    <td>{r.DATE}</td><td>{r.NARRATION}</td>
                    <td>{r.VTYPE ?? '—'}</td>
                    <td>{Number(r.DEBT ?? r.CRED ?? 0).toFixed(2)}</td>
                    <td>{r.REFNO ?? '—'}</td>
                    <td><span className={`${s.badge} ${r.POSTED ? s.badgeGreen : s.badgeYellow}`}>{r.POSTED ? 'Posted' : 'Pending'}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3}><strong>Total</strong></td><td><strong>{total.toFixed(2)}</strong></td><td colSpan={2} /></tr></tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const ReceiptsReport = () => <TransactionReport type="receipts" title="Receipts Report" testidPrefix="receipts-report" />;
export const PaymentsReport = () => <TransactionReport type="payments" title="Payments Report" testidPrefix="payments-report" />;
export const ReceiptsBackupReport = () => <TransactionReport type="receipts-backup" title="Receipts Backup Report" testidPrefix="receipts-backup-report" />;

export default TransactionReport;
