import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { deliveryApi } from '../../api/sales';
import s from './Sales.module.css';

export default function DeliveryNoteEntry() {
  const { orderId, noteId } = useParams<{ orderId?: string; noteId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(noteId);

  const { data: existingNotes } = useQuery({
    queryKey: ['delivery-notes', orderId],
    queryFn: () => deliveryApi.listForOrder(orderId!),
    enabled: !!orderId,
  });

  const existing = isEdit ? (existingNotes as any[])?.find((n: any) => String(n.id) === noteId) : null;

  const [form, setForm] = useState({ recipientName: '', deliveryDate: new Date().toISOString().slice(0, 10), deliveredBy: '', remarks: '', signature: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        recipientName: existing.recipientName ?? '',
        deliveryDate: existing.deliveryDate ?? '',
        deliveredBy: existing.deliveredBy ?? '',
        remarks: existing.remarks ?? '',
        signature: existing.signature ?? '',
      });
    }
  }, [existing]);

  const createMut = useMutation({ mutationFn: (d: any) => deliveryApi.create(orderId!, d), onSuccess: () => navigate(`/sales/orders/${orderId}`) });
  const updateMut = useMutation({ mutationFn: (d: any) => deliveryApi.update(orderId!, noteId!, d), onSuccess: () => navigate(`/sales/orders/${orderId}`) });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.recipientName) { setError('Recipient name is required.'); return; }
    if (!orderId) { setError('Order reference is required (BR-60).'); return; }
    if (isEdit) updateMut.mutate(form); else createMut.mutate(form);
  };

  return (
    <div data-testid="deliverynote-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{isEdit ? 'Edit Delivery Note' : 'New Delivery Note'}</h1>
      </div>

      {(error || createMut.error || updateMut.error) && (
        <div className={s.error} data-testid="deliverynote-error">{error || 'An error occurred.'}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Order Reference</label>
              <input readOnly value={orderId ?? ''} />
            </div>
            <div className={s.formGroup}>
              <label>Delivery Date/Time *</label>
              <input type="date" data-testid="deliverynote-date-field" value={form.deliveryDate} onChange={f('deliveryDate')} required />
            </div>
            <div className={s.formGroup}>
              <label>Recipient Name *</label>
              <input data-testid="deliverynote-recipient-field" value={form.recipientName} onChange={f('recipientName')} required />
            </div>
            <div className={s.formGroup}>
              <label>Delivered By</label>
              <input data-testid="deliverynote-deliveredby-field" value={form.deliveredBy} onChange={f('deliveredBy')} />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Remarks</label>
              <textarea data-testid="deliverynote-remarks-field" value={form.remarks} onChange={f('remarks')} />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Signature</label>
              <input data-testid="deliverynote-signature-field" value={form.signature} onChange={f('signature')} placeholder="Digital signature" />
            </div>
          </div>
        </div>

        <div className={s.actions}>
          <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="deliverynote-save-btn" disabled={createMut.isPending || updateMut.isPending}>
            {createMut.isPending || updateMut.isPending ? 'Saving…' : 'Save Delivery Note'}
          </button>
          {!isEdit && <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="deliverynote-print-btn" onClick={() => window.print()}>Print</button>}
          <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
