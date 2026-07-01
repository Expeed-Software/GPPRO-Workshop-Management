import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../../api/purchase';
import s from '../sales/Sales.module.css';

const emptyItem = () => ({ itemCode: '', description: '', qty: 1, unitPrice: 0 });

export default function LocalPurchaseEntry() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(orderId);

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-order', orderId],
    queryFn: () => purchaseOrdersApi.list({ id: orderId }),
    enabled: isEdit,
  });

  const [form, setForm] = useState({ poNumber: '', date: '', supplierId: '', invoiceNumber: '', remarks: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = Array.isArray(order) ? order[0] : order?.data?.[0];
    if (existing) {
      setForm({ poNumber: existing.Invoice ?? existing.poNumber ?? '', date: existing.InvDt ?? existing.date ?? '', supplierId: existing.SuppId ?? existing.supplierId ?? '', invoiceNumber: existing.SuppInv ?? existing.invoiceNumber ?? '', remarks: existing.Remarks ?? existing.remarks ?? '' });
      if (existing.items?.length) setItems(existing.items);
    }
  }, [order]);

  const createMut = useMutation({ mutationFn: (d: any) => purchaseOrdersApi.createLocal(d), onSuccess: () => navigate('/purchase/orders/local/manage') });
  const updateMut = useMutation({ mutationFn: (d: any) => purchaseOrdersApi.update(orderId!, d), onSuccess: () => navigate('/purchase/orders/local/manage') });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.supplierId) { setError('Supplier is required.'); return; }
    if (!form.date) { setError('Date is required.'); return; }
    if (!items.length) { setError('At least one item is required.'); return; }
    const payload = { ...form, items };
    if (isEdit) updateMut.mutate(payload); else createMut.mutate(payload);
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const setItem = (i: number, k: string, v: any) => setItems((p) => p.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  if (isLoading) return <div data-testid="localpurchaseentry-loading-skeleton" className={s.page}><div className={s.skeleton} style={{ height: '200px' }} /></div>;

  return (
    <div data-testid="localpurchaseentry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{isEdit ? 'Edit Local Purchase Order' : 'New Local Purchase Order'}</h1>
      </div>
      {(error || createMut.error || updateMut.error) && (
        <div className={s.error} data-testid="localpurchaseentry-form-error">{error || 'An error occurred.'}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}><label>PO Number</label><input data-testid="localpurchaseentry-pono" value={form.poNumber} onChange={f('poNumber')} /></div>
            <div className={s.formGroup}><label>Date *</label><input type="date" data-testid="localpurchaseentry-date" value={form.date} onChange={f('date')} required /></div>
            <div className={s.formGroup}><label>Supplier *</label><input data-testid="localpurchaseentry-supplier" value={form.supplierId} onChange={f('supplierId')} required /></div>
            <div className={s.formGroup}><label>Invoice Number</label><input value={form.invoiceNumber} onChange={f('invoiceNumber')} /></div>
            <div className={`${s.formGroup} ${s.formFull}`}><label>Remarks</label><textarea value={form.remarks} onChange={f('remarks')} /></div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700 }}>Items</h3>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} data-testid="localpurchaseentry-items-addrow" onClick={addItem}>+ Add Row</button>
          </div>
          <table className={s.itemsTable}>
            <thead><tr><th>Item Code</th><th>Description</th><th>Qty</th><th>Unit Price</th><th></th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td><input value={it.itemCode} onChange={(e) => setItem(i, 'itemCode', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} style={{ width: '100%' }} /></td>
                  <td><input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, 'qty', Number(e.target.value))} style={{ width: 60 }} /></td>
                  <td><input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))} style={{ width: 90 }} /></td>
                  <td><button type="button" className={`${s.btn} ${s.btnDanger}`} data-testid="localpurchaseentry-items-removerow" onClick={() => removeItem(i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="localpurchaseentry-upload-btn" style={{ fontSize: '0.8rem' }}>📎 Attach Document</button>
          </div>
        </div>
        <div className={s.actions}>
          <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="localpurchaseentry-submit-btn" disabled={createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? 'Saving…' : 'Submit'}
          </button>
          <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="localpurchaseentry-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
