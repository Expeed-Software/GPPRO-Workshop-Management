import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function PhysicalAdjustment() {
  const [form, setForm] = useState({ itemCode: '', physicalQty: '', reason: '', referenceNo: '', date: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mut = useMutation({
    mutationFn: (data: any) => stockApi.physicalAdjust(data),
    onSuccess: () => { setSuccess('Physical adjustment recorded.'); setForm({ itemCode: '', physicalQty: '', reason: '', referenceNo: '', date: '' }); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Adjustment failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.itemCode) e.itemCode = 'Item code is required';
    if (!form.physicalQty) e.physicalQty = 'Physical count quantity is required';
    if (!form.reason) e.reason = 'Reason is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid="physicaladjust-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Physical Stock Adjustment</h1></div>
      <div className={s.card}>
        <div className={s.reorderAlert} style={{ marginBottom: '1rem' }}>Supervisor or Administrator access required (BR-73)</div>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '1rem' }}>{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Item Code *</label><input data-testid="physicaladjust-itemcode" value={form.itemCode} onChange={(e) => setForm((p) => ({ ...p, itemCode: e.target.value }))} />{errors.itemCode && <div className={s.fieldError}>{errors.itemCode}</div>}</div>
            <div className={s.field}><label>Physical Count Qty *</label><input type="number" data-testid="physicaladjust-physicalqty" value={form.physicalQty} onChange={(e) => setForm((p) => ({ ...p, physicalQty: e.target.value }))} />{errors.physicalQty && <div className={s.fieldError}>{errors.physicalQty}</div>}</div>
            <div className={s.field}><label>Reference No</label><input data-testid="physicaladjust-refno" value={form.referenceNo} onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} /></div>
            <div className={s.field}><label>Date *</label><input type="date" data-testid="physicaladjust-date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />{errors.date && <div className={s.fieldError}>{errors.date}</div>}</div>
          </div>
          <div className={s.field}><label>Reason *</label><textarea data-testid="physicaladjust-reason" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} rows={3} />{errors.reason && <div className={s.fieldError}>{errors.reason}</div>}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="physicaladjust-submit-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
