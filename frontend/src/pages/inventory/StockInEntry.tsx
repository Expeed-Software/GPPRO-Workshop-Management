import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockInEntry() {
  const [form, setForm] = useState({ itemCode: '', qty: '', unitCost: '', referenceNo: '', date: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: (data: any) => stockApi.in(data),
    onSuccess: () => { setSuccess('Stock in recorded successfully.'); setForm({ itemCode: '', qty: '', unitCost: '', referenceNo: '', date: '', notes: '' }); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Stock in failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.itemCode) e.itemCode = 'Item code is required';
    if (!form.qty || Number(form.qty) <= 0) e.qty = 'Quantity must be > 0';
    if (!form.unitCost) e.unitCost = 'Unit cost is required';
    if (!form.referenceNo) e.referenceNo = 'Reference No is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid="stockinentry-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock In Entry</h1></div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '1rem' }} data-testid="stockinentry-error">{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Item Code *</label><input data-testid="stockinentry-itemcode" value={form.itemCode} onChange={(e) => setForm((p) => ({ ...p, itemCode: e.target.value }))} />{errors.itemCode && <div className={s.fieldError}>{errors.itemCode}</div>}</div>
            <div className={s.field}><label>Quantity *</label><input type="number" data-testid="stockinentry-qty" value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} />{errors.qty && <div className={s.fieldError}>{errors.qty}</div>}</div>
            <div className={s.field}><label>Unit Cost *</label><input type="number" data-testid="stockinentry-unitcost" value={form.unitCost} onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))} />{errors.unitCost && <div className={s.fieldError}>{errors.unitCost}</div>}</div>
            <div className={s.field}><label>Reference No *</label><input data-testid="stockinentry-refno" value={form.referenceNo} onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />{errors.referenceNo && <div className={s.fieldError}>{errors.referenceNo}</div>}</div>
            <div className={s.field}><label>Date *</label><input type="date" data-testid="stockinentry-date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />{errors.date && <div className={s.fieldError}>{errors.date}</div>}</div>
            <div className={s.field}><label>Notes</label><input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="stockinentry-submit-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
