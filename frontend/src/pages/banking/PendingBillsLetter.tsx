import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function PendingBillsLetter() {
  const [filters, setFilters] = useState({ recipientType: '', ageBucket: '', asOfDate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-bills-letter', filters],
    queryFn: () => bankingApi.pendingBillsLetter(filters),
    enabled: false,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!filters.recipientType) e.recipientType = 'Recipient type is required';
    if (!filters.asOfDate) e.asOfDate = 'As of date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid="pendingbills-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Pending Bills Letter</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="pendingbills-filter-recipient" value={filters.recipientType} onChange={(e) => setFilters((p) => ({ ...p, recipientType: e.target.value }))}>
            <option value="">Recipient Type *</option>
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
          </select>
          <select data-testid="pendingbills-filter-age" value={filters.ageBucket} onChange={(e) => setFilters((p) => ({ ...p, ageBucket: e.target.value }))}>
            <option value="">All Ages</option>
            <option value="0-30">0–30 days</option>
            <option value="31-60">31–60 days</option>
            <option value="61-90">61–90 days</option>
            <option value="90+">90+ days</option>
          </select>
          <input type="date" data-testid="pendingbills-filter-date" value={filters.asOfDate} onChange={(e) => setFilters((p) => ({ ...p, asOfDate: e.target.value }))} />
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="pendingbills-submit-btn" onClick={() => { if (validate()) refetch(); }}>Generate</button>
        </div>
        {errors.recipientType && <div className={s.fieldError}>{errors.recipientType}</div>}
        {errors.asOfDate && <div className={s.fieldError}>{errors.asOfDate}</div>}
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No pending bills for the selection.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>Recipient</th><th>Bills Count</th><th>Total Amount</th><th>Age Bucket</th><th>Actions</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`pendingbills-table-row-${i}`}>
                    <td>{r.recipientName}</td><td>{r.billsCount}</td><td>{Number(r.totalAmount ?? 0).toFixed(2)}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{r.ageBucket ?? '—'}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`pendingbills-preview-btn-${r.recipientId}`}>Preview</button>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`pendingbills-print-btn-${r.recipientId}`} onClick={() => window.print()}>Print</button>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`pendingbills-export-btn-${r.recipientId}`}>Export</button>
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
