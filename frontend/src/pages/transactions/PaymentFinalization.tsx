import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function PaymentFinalization() {
  const [selected, setSelected] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery({ queryKey: ['payments-pending'], queryFn: () => paymentsApi.list({ status: 'Pending' }) });

  const finMut = useMutation({
    mutationFn: (ids: string[]) => paymentsApi.finalize({ ids }),
    onSuccess: () => { setSelected([]); qc.invalidateQueries({ queryKey: ['payments-pending'] }); },
  });

  const toggle = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => setSelected((p) => p.length === (rows as any[]).length ? [] : (rows as any[]).map((r: any) => String(r.ID)));

  return (
    <div data-testid="payment-finalization-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Payment Finalization</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="payment-finalization-finalize-selected" onClick={() => finMut.mutate(selected)} disabled={!selected.length || finMut.isPending}>Finalize Selected ({selected.length})</button>
        </div>
      </div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No pending payments.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="payment-finalization-table">
              <thead><tr><th><input type="checkbox" onChange={toggleAll} checked={selected.length === (rows as any[]).length && (rows as any[]).length > 0} /></th><th>Date</th><th>Payee</th><th>Type</th><th>Amount</th><th>Ref</th><th>Status</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`payment-finalization-row-${i}`}>
                    <td><input type="checkbox" checked={selected.includes(String(r.ID))} onChange={() => toggle(String(r.ID))} /></td>
                    <td>{r.DATE}</td><td>{r.NARRATION}</td><td>{r.VTYPE}</td>
                    <td>{Number(r.DEBT ?? r.CRED ?? 0).toFixed(2)}</td><td>{r.REFNO ?? '—'}</td>
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
