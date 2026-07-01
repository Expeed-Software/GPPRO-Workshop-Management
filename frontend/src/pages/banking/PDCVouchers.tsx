import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

interface Props { type?: 'issue' | 'receipt'; }

export default function PDCVouchers({ type = 'issue' }: Props) {
  const qc = useQueryClient();
  const prefix = type === 'receipt' ? 'pdc-receipt-voucher-report' : 'pdc-issue-voucher-report';
  const title = type === 'receipt' ? 'PDC Receipt Vouchers' : 'PDC Issue Vouchers';

  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '' });

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [prefix, filters, type],
    queryFn: () => bankingApi.pdcVouchers({ ...filters, pdcType: type }),
  });

  const deleteMut = useMutation({
    // PDCBulk01 rows have ID not VSRL — pass ID as the key
    mutationFn: (id: string) => bankingApi.deleteVoucher(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [prefix] }),
  });

  return (
    <div data-testid={`${prefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${prefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${prefix}-export-btn`}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" data-testid={`${prefix}-filter-datefrom`} value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Cleared">Cleared</option>
            <option value="Returned">Returned</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No PDC vouchers found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${prefix}-table`}>
              <thead><tr><th>Voucher Ref</th><th>Date</th><th>Account</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${prefix}-table-row-${i}`}>
                    <td>{r.ID ?? r.vsrl ?? r.voucherRef}</td><td>{r.Date ?? r.date}</td><td>{r.Ac ?? r.account}</td>
                    <td>{Number(r.NetAmt ?? r.amount ?? 0).toFixed(2)}</td>
                    <td>
                      {/* PDCBulk01 has no Status column — show Remark if present, otherwise blank */}
                      <span className={`${s.badge} ${s.badgeYellow}`}>{r.Remark ?? r.Status ?? r.status ?? ''}</span>
                    </td>
                    <td>
                      {/* Delete by ID (PDCBulk01 primary key) */}
                      <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} onClick={() => { if (window.confirm('Delete voucher?')) deleteMut.mutate(String(r.ID ?? r.id)); }}>Delete</button>
                    </td>
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

export const PDCReceiptVouchers = () => <PDCVouchers type="receipt" />;
