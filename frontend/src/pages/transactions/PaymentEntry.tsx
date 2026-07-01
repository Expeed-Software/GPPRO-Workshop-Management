import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../api/transactions';
import s from './Transactions.module.css';

export default function PaymentEntry() {
  const [form, setForm] = useState({ DATE: '', payeeType: '', payee: '', VTYPE: 'BP', amount: '', REFNO: '', NARRATION: '', status: 'Pending' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => { setSuccess('Payment saved.'); setForm({ DATE: '', payeeType: '', payee: '', VTYPE: 'BP', amount: '', REFNO: '', NARRATION: '', status: 'Pending' }); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Save failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.DATE) e.DATE = 'Required';
    if (!form.payeeType) e.payeeType = 'Required';
    if (!form.payee) e.payee = 'Required';
    if (!form.VTYPE) e.VTYPE = 'Required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Must be > 0';
    if (form.VTYPE === 'Cheque' && !form.REFNO) e.REFNO = 'Required for cheques';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (k: string) => (e: any) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div data-testid="payment-entry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Payment Entry</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="payment-entry-new-btn" onClick={() => setForm({ DATE: '', payeeType: '', payee: '', VTYPE: 'BP', amount: '', REFNO: '', NARRATION: '', status: 'Pending' })}>New</button>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="payment-entry-save-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Save</button>
        </div>
      </div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Payment Date *</label><input type="date" data-testid="payment-entry-date" value={form.DATE} onChange={set('DATE')} />{errors.DATE && <div className={s.fieldError}>{errors.DATE}</div>}</div>
            <div className={s.field}><label>Payee Type *</label><select data-testid="payment-entry-payeetype" value={form.payeeType} onChange={set('payeeType')}><option value="">Select...</option><option>Customer</option><option>Supplier</option><option>Employee</option><option>Other</option></select>{errors.payeeType && <div className={s.fieldError}>{errors.payeeType}</div>}</div>
            <div className={s.field}><label>Payee *</label><input data-testid="payment-entry-payee" value={form.payee} onChange={set('payee')} />{errors.payee && <div className={s.fieldError}>{errors.payee}</div>}</div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}><label>Payment Type *</label><select data-testid="payment-entry-type" value={form.VTYPE} onChange={set('VTYPE')}><option value="">Select...</option><option>Cash</option><option>Cheque</option><option>Transfer</option><option>PDC</option></select>{errors.VTYPE && <div className={s.fieldError}>{errors.VTYPE}</div>}</div>
            <div className={s.field}><label>Amount *</label><input type="number" data-testid="payment-entry-amount" value={form.amount} onChange={set('amount')} />{errors.amount && <div className={s.fieldError}>{errors.amount}</div>}</div>
            <div className={s.field}><label>Ref No {form.VTYPE === 'Cheque' ? '*' : ''}</label><input data-testid="payment-entry-refno" value={form.REFNO} onChange={set('REFNO')} />{errors.REFNO && <div className={s.fieldError}>{errors.REFNO}</div>}</div>
          </div>
          <div className={s.formRow}>
            <div className={s.field} style={{ flex: 2 }}><label>Memo</label><textarea rows={2} value={form.NARRATION} onChange={set('NARRATION')} style={{ resize: 'vertical' }} /></div>
            <div className={s.field}><label>Status</label><select value={form.status} onChange={set('status')}><option>Pending</option><option>Posted</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnSecondary}`} data-testid="payment-entry-allocate-btn">Allocate</button>
          </div>
        </div>
      </div>
    </div>
  );
}
