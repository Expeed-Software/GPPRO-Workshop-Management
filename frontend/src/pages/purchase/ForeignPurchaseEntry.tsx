import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../../api/purchase';
import s from '../sales/Sales.module.css';

const emptyItem = () => ({ itemCode: '', description: '', qty: 1, unitPrice: 0 });

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'JPY', 'CNY'];

export default function ForeignPurchaseEntry() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ poNumber: '', date: '', supplierId: '', currency: 'USD', remarks: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');

  const createMut = useMutation({ mutationFn: (d: any) => purchaseOrdersApi.createForeign(d), onSuccess: () => navigate('/purchase/orders/local/manage') });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.supplierId) { setError('Supplier is required.'); return; }
    if (!form.currency) { setError('Currency is required.'); return; }
    if (!items.length) { setError('At least one item is required.'); return; }
    createMut.mutate({ ...form, items });
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const setItem = (i: number, k: string, v: any) => setItems((p) => p.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  return (
    <div data-testid="foreignpurchaseentry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>New Foreign Purchase Order</h1>
      </div>
      {(error || createMut.error) && <div className={s.error} data-testid="foreignpurchaseentry-form-error">{error || 'An error occurred.'}</div>}
      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}><label>PO Number</label><input data-testid="foreignpurchaseentry-pono" value={form.poNumber} onChange={f('poNumber')} /></div>
            <div className={s.formGroup}><label>Date *</label><input type="date" data-testid="foreignpurchaseentry-date" value={form.date} onChange={f('date')} required /></div>
            <div className={s.formGroup}><label>Supplier *</label><input data-testid="foreignpurchaseentry-supplier" value={form.supplierId} onChange={f('supplierId')} required /></div>
            <div className={s.formGroup}>
              <label>Currency *</label>
              <select data-testid="foreignpurchaseentry-currency" value={form.currency} onChange={f('currency')}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}><label>Remarks</label><textarea value={form.remarks} onChange={f('remarks')} /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700 }}>Items</h3>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} data-testid="foreignpurchaseentry-items-addrow" onClick={addItem}>+ Add Row</button>
          </div>
          <table className={s.itemsTable}>
            <thead><tr><th>Item Code</th><th>Description</th><th>Qty</th><th>Unit Price ({form.currency})</th><th></th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td><input value={it.itemCode} onChange={(e) => setItem(i, 'itemCode', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, 'qty', Number(e.target.value))} style={{ width: 60 }} /></td>
                  <td><input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))} style={{ width: 90 }} /></td>
                  <td><button type="button" className={`${s.btn} ${s.btnDanger}`} data-testid="foreignpurchaseentry-items-removerow" onClick={() => removeItem(i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="foreignpurchaseentry-upload-btn" style={{ fontSize: '0.8rem' }}>📎 Supporting Docs (BR-65)</button>
          </div>
        </div>
        <div className={s.actions}>
          <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="foreignpurchaseentry-submit-btn" disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Submit'}</button>
          <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="foreignpurchaseentry-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
