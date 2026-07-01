import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { receiptsApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function ReceiptEntry() {
  const [form, setForm] = useState({ DATE: '', receivedFrom: '', payer: '', VTYPE: 'BR', amount: '', REFNO: '', allocation: '', NARRATION: '', status: 'Pending' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: receiptsApi.create,
    onSuccess: () => { setSuccess('Receipt saved.'); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Save failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.DATE) e.DATE = 'Required';
    if (!form.receivedFrom) e.receivedFrom = 'Required';
    if (!form.payer) e.payer = 'Required';
    if (!form.VTYPE) e.VTYPE = 'Required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div data-testid="receipt-entry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Receipt Entry</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="receipt-entry-new-btn">New</button>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="receipt-entry-save-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Save</button>
        </div>
      </div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Receipt Date *</label><input type="date" data-testid="receipt-entry-date" value={form.DATE} onChange={set('DATE')} />{errors.DATE && <div className={s.fieldError}>{errors.DATE}</div>}</div>
            <div className={s.field}><label>Received From *</label><input data-testid="receipt-entry-receivedfrom" value={form.receivedFrom} onChange={set('receivedFrom')} />{errors.receivedFrom && <div className={s.fieldError}>{errors.receivedFrom}</div>}</div>
            <div className={s.field}><label>Payer *</label><input data-testid="receipt-entry-payer" value={form.payer} onChange={set('payer')} />{errors.payer && <div className={s.fieldError}>{errors.payer}</div>}</div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}><label>Payment Method *</label><select data-testid="receipt-entry-method" value={form.VTYPE} onChange={set('VTYPE')}><option value="">Select...</option><option>Cash</option><option>Cheque</option><option>Transfer</option></select>{errors.VTYPE && <div className={s.fieldError}>{errors.VTYPE}</div>}</div>
            <div className={s.field}><label>Amount *</label><input type="number" data-testid="receipt-entry-amount" value={form.amount} onChange={set('amount')} />{errors.amount && <div className={s.fieldError}>{errors.amount}</div>}</div>
            <div className={s.field}><label>Ref No</label><input value={form.REFNO} onChange={set('REFNO')} /></div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}><label>Allocation</label><input data-testid="receipt-entry-allocation" value={form.allocation} onChange={set('allocation')} /></div>
            <div className={s.field}><label>Memo</label><input value={form.NARRATION} onChange={set('NARRATION')} /></div>
            <div className={s.field}><label>Status</label><select value={form.status} onChange={set('status')}><option>Pending</option><option>Posted</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnSecondary}`} data-testid="receipt-entry-allocation-btn">Allocate</button>
          </div>
        </div>
      </div>
    </div>
  );
}
