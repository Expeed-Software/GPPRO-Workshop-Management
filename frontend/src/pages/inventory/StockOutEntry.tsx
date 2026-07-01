import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { stockApi } from '../../api/inventory';
import s from './Inventory.module.css';

export default function StockOutEntry() {
  const [form, setForm] = useState({ itemCode: '', qty: '', referenceNo: '', date: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const { data: qtyData } = useQuery({
    queryKey: ['stock-qty', form.itemCode],
    queryFn: () => stockApi.qty(form.itemCode),
    enabled: form.itemCode.length > 2,
  });
  const availQty = (qtyData as any)?.[0]?.availableQty ?? (qtyData as any)?.[0]?.qty ?? 0;

  const mut = useMutation({
    mutationFn: (data: any) => stockApi.out(data),
    onSuccess: () => { setSuccess('Stock out recorded.'); setForm({ itemCode: '', qty: '', referenceNo: '', date: '', notes: '' }); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Stock out failed' }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.itemCode) e.itemCode = 'Item code is required';
    if (!form.qty || Number(form.qty) <= 0) e.qty = 'Quantity must be > 0';
    if (!form.referenceNo) e.referenceNo = 'Reference No is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div data-testid="stockoutentry-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Stock Out Entry</h1></div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '1rem' }} data-testid="stockoutentry-error">{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}
        {form.itemCode.length > 2 && (
          <div className={s.reorderAlert} style={{ background: '#dbeafe', borderColor: '#3b82f6', color: '#1d4ed8', marginBottom: '1rem' }}>
            Available Qty for <strong>{form.itemCode}</strong>: <strong>{availQty}</strong>
          </div>
        )}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Item Code *</label><input data-testid="stockoutentry-itemcode" value={form.itemCode} onChange={(e) => setForm((p) => ({ ...p, itemCode: e.target.value }))} />{errors.itemCode && <div className={s.fieldError}>{errors.itemCode}</div>}</div>
            <div className={s.field}><label>Quantity *</label><input type="number" data-testid="stockoutentry-qty" value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} />{errors.qty && <div className={s.fieldError}>{errors.qty}</div>}</div>
            <div className={s.field}><label>Reference No *</label><input data-testid="stockoutentry-refno" value={form.referenceNo} onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />{errors.referenceNo && <div className={s.fieldError}>{errors.referenceNo}</div>}</div>
            <div className={s.field}><label>Date *</label><input type="date" data-testid="stockoutentry-date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />{errors.date && <div className={s.fieldError}>{errors.date}</div>}</div>
            <div className={s.field}><label>Notes</label><input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="stockoutentry-submit-btn" onClick={() => { if (validate()) mut.mutate(form); }} disabled={mut.isPending}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
