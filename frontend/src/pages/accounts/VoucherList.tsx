import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vouchersApi } from '../../api/accounts';
import s from './Accounts.module.css';

interface Props { title?: string; queryKey?: string; fetchFn?: (p: any) => Promise<any>; testidPrefix?: string; }

function VoucherListBase({ title = 'Voucher List', queryKey = 'voucher-list', fetchFn = vouchersApi.list, testidPrefix = 'voucher-list' }: Props) {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', account: '', status: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => fetchFn(filters),
  });

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
          <input type="date" data-testid={`${testidPrefix}-filter-datefrom`} value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Account" value={filters.account} onChange={(e) => setFilters((p) => ({ ...p, account: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No vouchers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr><th>Voucher #</th><th>Date</th><th>Account</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    <td>{r.VSRL ?? r.vsrl ?? r.voucherNo}</td><td>{r.DATE ?? r.date}</td><td>{r.VTYPE ?? r.account}</td>
                    <td>{Number(r.DEBT ?? r.amount ?? 0).toFixed(2)}</td>
                    <td><span className={`${s.badge} ${(r.POSTED === 1 || r.status === 'Posted') ? s.badgeGreen : s.badgeYellow}`}>{r.POSTED === 1 ? 'Posted' : (r.status ?? 'Draft')}</span></td>
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

export default VoucherListBase;
export const VoucherListReport = () => <VoucherListBase title="Voucher List Report" queryKey="voucher-list-report" fetchFn={vouchersApi.listReport} testidPrefix="voucher-list-report" />;
export const VoucherDailyList = () => <VoucherListBase title="Daily Voucher List" queryKey="voucher-daily" fetchFn={vouchersApi.dailyList} testidPrefix="voucher-list-daily" />;
export const VoucherDetailsListReport = () => <VoucherListBase title="Voucher Details List" queryKey="voucher-details-list" fetchFn={vouchersApi.detailsReport} testidPrefix="voucher-details-list-report" />;
export const JournalVoucherList = () => <VoucherListBase title="Journal Vouchers" queryKey="journal-vouchers" fetchFn={vouchersApi.journalList} testidPrefix="journal-voucher-list" />;
