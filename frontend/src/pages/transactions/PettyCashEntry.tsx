import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pettyCashApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function PettyCashEntry() {
  const [form, setForm] = useState({ txnDate: '', type: '', amount: '', purpose: '', refNo: '', memo: '', approve: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: pettyCashApi.create,
    onSuccess: () => { setSuccess('Petty cash entry saved.'); setForm({ txnDate: '', type: '', amount: '', purpose: '', refNo: '', memo: '', approve: false }); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Save failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.txnDate) e.txnDate = 'Required';
    if (!form.type) e.type = 'Required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Must be > 0';
    if (!form.purpose) e.purpose = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div data-testid="petty-cash-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Petty Cash Entry</h1></div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Date *</label><input type="date" value={form.txnDate} onChange={set('txnDate')} />{errors.txnDate && <div className={s.fieldError}>{errors.txnDate}</div>}</div>
            <div className={s.field}><label>Type *</label><select value={form.type} onChange={set('type')}><option value="">Select...</option><option>Expense</option><option>Income</option></select>{errors.type && <div className={s.fieldError}>{errors.type}</div>}</div>
            <div className={s.field}><label>Amount *</label><input type="number" value={form.amount} onChange={set('amount')} />{errors.amount && <div className={s.fieldError}>{errors.amount}</div>}</div>
          </div>
          <div className={s.formRow}>
            <div className={s.field} style={{ flex: 2 }}><label>Purpose *</label><input value={form.purpose} onChange={set('purpose')} />{errors.purpose && <div className={s.fieldError}>{errors.purpose}</div>}</div>
            <div className={s.field}><label>Ref No</label><input value={form.refNo} onChange={set('refNo')} /></div>
          </div>
          <div className={s.field}><label>Memo</label><textarea rows={2} value={form.memo} onChange={set('memo')} style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnSecondary}`} data-testid="petty-cash-reset-btn" onClick={() => setForm({ txnDate: '', type: '', amount: '', purpose: '', refNo: '', memo: '', approve: false })}>Reset</button>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="petty-cash-save-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
