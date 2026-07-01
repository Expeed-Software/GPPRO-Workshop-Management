import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { receiptsApi } from '../../api/transactions';
import s from './Transactions.module.css';

interface Row { date: string; method: string; party: string; amount: string; allocation: string; status: string; }
const EMPTY_ROW: Row = { date: '', method: '', party: '', amount: '', allocation: '', status: 'Pending' };

export default function AutoReceiptEntry() {
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY_ROW }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: (data: Row[]) => receiptsApi.autoSave({ entries: data }),
    onSuccess: () => setSuccess('All entries saved.'),
    onError: (err: any) => setErrors([err?.response?.data?.error?.message ?? 'Save failed']),
  });

  const validate = () => {
    const e: string[] = [];
    rows.forEach((r, i) => { if (!r.date || !r.method || !r.party || !r.amount || Number(r.amount) <= 0) e.push(`Row ${i + 1}: date, method, party, and amount required`); });
    setErrors(e);
    return e.length === 0;
  };

  const updateRow = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addRow = () => setRows((p) => [...p, { ...EMPTY_ROW }]);
  const removeRow = (i: number) => setRows((p) => p.filter((_, idx) => idx !== i));

  return (
    <div data-testid="auto-receipt-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Auto Receipt Entry</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={addRow}>+ Add Row</button>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="auto-receipt-save-all" onClick={() => { if (validate()) mut.mutate(rows); }} disabled={mut.isPending}>Save All</button>
        </div>
      </div>
      <div className={s.card}>
        {errors.length > 0 && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{errors.map((e, i) => <div key={i}>{e}</div>)}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{success}</div>}
        <div style={{ overflowX: 'auto' }}>
          <table className={s.table}>
            <thead><tr><th>Date</th><th>Method</th><th>Party</th><th>Amount</th><th>Allocation</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} data-testid={`auto-receipt-row-${i}`}>
                  <td><input type="date" value={r.date} onChange={(e) => updateRow(i, 'date', e.target.value)} style={{ padding: '0.3rem', width: '130px' }} /></td>
                  <td><select value={r.method} onChange={(e) => updateRow(i, 'method', e.target.value)} style={{ padding: '0.3rem' }}><option value="">Select</option><option>Cash</option><option>Cheque</option><option>Transfer</option></select></td>
                  <td><input value={r.party} onChange={(e) => updateRow(i, 'party', e.target.value)} style={{ padding: '0.3rem', width: '120px' }} /></td>
                  <td><input type="number" value={r.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} style={{ padding: '0.3rem', width: '90px' }} /></td>
                  <td><input value={r.allocation} onChange={(e) => updateRow(i, 'allocation', e.target.value)} style={{ padding: '0.3rem', width: '110px' }} /></td>
                  <td><select value={r.status} onChange={(e) => updateRow(i, 'status', e.target.value)} style={{ padding: '0.3rem' }}><option>Pending</option><option>Posted</option></select></td>
                  <td>{rows.length > 1 && <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} onClick={() => removeRow(i)}>✕</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
