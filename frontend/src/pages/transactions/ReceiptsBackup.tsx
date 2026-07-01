import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function ReceiptsBackup() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', party: '' });
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['receipts-backup', filters],
    queryFn: () => receiptsApi.backup(filters),
  });

  const restoreMut = useMutation({
    mutationFn: (id: string) => receiptsApi.restoreBackup({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receipts-backup'] }),
  });

  return (
    <div data-testid="receipts-backup-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Receipts Backup</h1></div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          <input placeholder="Party" value={filters.party} onChange={(e) => setFilters((p) => ({ ...p, party: e.target.value }))} />
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No backup records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="receipts-backup-table">
              <thead><tr><th>Date</th><th>Party</th><th>Amount</th><th>Ref</th><th>Backup Date</th><th>Action</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`receipts-backup-row-${i}`}>
                    <td>{r.receiptDate}</td><td>{r.receivedFrom ?? r.payer}</td>
                    <td>{Number(r.amount ?? 0).toFixed(2)}</td><td>{r.refNo ?? '—'}</td><td>{r.backupDate ?? '—'}</td>
                    <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => restoreMut.mutate(String(r.id))}>Restore</button></td>
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
