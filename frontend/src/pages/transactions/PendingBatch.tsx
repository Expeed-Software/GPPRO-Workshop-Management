import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, receiptsApi } from '../../api/transactions';
import s from './Transactions.module.css';

interface Props { type: 'payment' | 'receipt'; }

export default function PendingBatch({ type }: Props) {
  const title = type === 'payment' ? 'Pending Add Payment' : 'Pending Add Receipt';
  const testidPrefix = type === 'payment' ? 'pending-payment' : 'pending-receipt';
  const qc = useQueryClient();
  const qk = [`pending-${type}s`];

  const fetchFn = type === 'payment' ? paymentsApi.list : receiptsApi.list;
  const approveFn = type === 'payment' ? paymentsApi.approve : receiptsApi.approve;
  const rejectFn = type === 'payment' ? paymentsApi.reject : receiptsApi.reject;

  const { data: rows = [], isLoading } = useQuery({ queryKey: qk, queryFn: () => fetchFn({ status: 'Pending' }) });

  const appMut = useMutation({ mutationFn: (ids: string[]) => approveFn({ ids }), onSuccess: () => qc.invalidateQueries({ queryKey: qk }) });
  const rejMut = useMutation({ mutationFn: (ids: string[]) => rejectFn({ ids }), onSuccess: () => qc.invalidateQueries({ queryKey: qk }) });

  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${testidPrefix}-approve-btn`} onClick={() => appMut.mutate(selected)} disabled={!selected.length}>Approve</button>
          <button className={`${s.btn} ${s.btnDanger}`} data-testid={`${testidPrefix}-reject-btn`} onClick={() => rejMut.mutate(selected)} disabled={!selected.length}>Reject</button>
        </div>
      </div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No pending {type}s.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr><th></th><th>Date</th><th>Party</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    <td><input type="checkbox" checked={selected.includes(String(r.ID))} onChange={() => toggle(String(r.ID))} /></td>
                    <td>{r.DATE}</td><td>{r.NARRATION}</td>
                    <td>{Number(r.DEBT ?? r.CRED ?? 0).toFixed(2)}</td><td>{r.VTYPE ?? '—'}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{r.POSTED ? 'Posted' : 'Pending'}</span></td>
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

export const PendingAddPayment = () => <PendingBatch type="payment" />;
export const PendingAddReceipt = () => <PendingBatch type="receipt" />;
