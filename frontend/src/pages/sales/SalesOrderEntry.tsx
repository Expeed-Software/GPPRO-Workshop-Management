import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

const emptyItem = () => ({ product: '', description: '', qty: 1, unitPrice: 0, discount: 0 });

export default function SalesOrderEntry() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(orderId);

  const { data: order, isLoading } = useQuery({
    queryKey: ['sales-order', orderId],
    queryFn: () => salesOrdersApi.get(orderId!),
    enabled: isEdit,
  });

  const [form, setForm] = useState({ customerId: '', orderDate: '', status: 'Draft', notes: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      // Backend returns SalesOrdr01 column names: CustId, Ordt, CustNote, StatusId
      const o = order as any;
      setForm({
        customerId: o.CustId ?? o.customerId ?? '',
        orderDate: o.Ordt ? String(o.Ordt).slice(0, 10) : (o.orderDate ?? ''),
        status: o.StatusId != null ? String(o.StatusId) : (o.status ?? 'Draft'),
        notes: o.CustNote ?? o.notes ?? '',
      });
      if (o.items?.length) setItems(o.items);
    }
  }, [order]);

  const isDelivered = isEdit && (order as any)?.StatusDescription === 'Delivered';

  const createMut = useMutation({ mutationFn: (d: any) => salesOrdersApi.create(d), onSuccess: () => { navigate('/sales/orders'); } });
  const updateMut = useMutation({ mutationFn: (d: any) => salesOrdersApi.update(orderId!, d), onSuccess: () => navigate('/sales/orders') });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerId) { setError('Customer is required (BR-52).'); return; }
    if (!form.orderDate) { setError('Order date is required (BR-52).'); return; }
    if (!items.length) { setError('At least one product is required (BR-52).'); return; }
    const payload = { ...form, items };
    if (isEdit) updateMut.mutate(payload); else createMut.mutate(payload);
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const setItem = (i: number, k: string, v: any) => setItems((p) => p.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const total = items.reduce((acc, it) => acc + it.qty * it.unitPrice * (1 - it.discount / 100), 0);

  if (isLoading) return <div data-testid="salesorderentry-loading-skeleton" className={s.page}><div className={s.skeleton} style={{ height: '200px' }} /></div>;

  return (
    <div data-testid="salesorderentry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{isEdit ? 'Edit Sales Order' : 'New Sales Order'}</h1>
        {isDelivered && <span className={`${s.badge} ${s.badgeGreen}`}>Delivered — Read Only</span>}
      </div>

      {(error || createMut.error || updateMut.error) && (
        <div data-testid="salesorderentry-error" className={s.error}>{error || 'An error occurred.'}</div>
      )}
      {createMut.isSuccess && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
          Order confirmation sent to customer (BR-54). ✓
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Customer *</label>
              <input data-testid="salesorderentry-customer-field" value={form.customerId} onChange={f('customerId')} disabled={isDelivered} required />
            </div>
            <div className={s.formGroup}>
              <label>Order Date *</label>
              <input type="date" data-testid="salesorderentry-date-field" value={form.orderDate} onChange={f('orderDate')} disabled={isDelivered} required />
            </div>
            <div className={s.formGroup}>
              <label>Status</label>
              <select data-testid="salesorderentry-status-field" value={form.status} onChange={f('status')} disabled={isDelivered}>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className={s.formGroup} />
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Notes</label>
              <textarea data-testid="salesorderentry-notes-field" value={form.notes} onChange={f('notes')} disabled={isDelivered} />
            </div>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.header}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Products</h2>
            {!isDelivered && <button type="button" className={`${s.btn} ${s.btnPrimary}`} data-testid="salesorderentry-add-item" onClick={addItem}>+ Add Product</button>}
          </div>
          <table className={s.itemsTable} data-testid="salesorderentry-items-table">
            <thead>
              <tr><th>Product/Part</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Discount %</th><th>Amount</th>{!isDelivered && <th></th>}</tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td><input data-testid={`salesorderentry-item-product-${i}`} value={it.product} onChange={(e) => setItem(i, 'product', e.target.value)} disabled={isDelivered} style={{ width: '100%' }} /></td>
                  <td><input value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} disabled={isDelivered} style={{ width: '100%' }} /></td>
                  <td><input type="number" min={1} value={it.qty} onChange={(e) => setItem(i, 'qty', Number(e.target.value))} disabled={isDelivered} style={{ width: 60 }} /></td>
                  <td><input type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))} disabled={isDelivered} style={{ width: 90 }} /></td>
                  <td><input type="number" min={0} max={100} value={it.discount} onChange={(e) => setItem(i, 'discount', Number(e.target.value))} disabled={isDelivered} style={{ width: 60 }} /></td>
                  <td>{(it.qty * it.unitPrice * (1 - it.discount / 100)).toFixed(2)}</td>
                  {!isDelivered && <td><button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={() => removeItem(i)} aria-label="Remove">×</button></td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                <td data-testid="salesorderentry-total" style={{ fontWeight: 700 }}>{total.toFixed(2)}</td>
                {!isDelivered && <td />}
              </tr>
            </tfoot>
          </table>
        </div>

        {!isDelivered && (
          <div className={s.actions}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="salesorderentry-submit-btn" disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : isEdit ? 'Update Order' : 'Submit Order'}
            </button>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => navigate('/sales/orders')}>Cancel</button>
          </div>
        )}
      </form>
    </div>
  );
}
