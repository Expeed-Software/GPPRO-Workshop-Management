import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { salesOrdersApi } from '../../api/sales';
import s from './Sales.module.css';

export default function ChangeOrderCustomer() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerId: '', reason: '' });
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: () => salesOrdersApi.changeCustomer(orderId!, form.customerId, form.reason),
    onSuccess: () => navigate(`/sales/orders/${orderId}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerId) { setError('New customer is required.'); return; }
    if (form.reason.length < 16) { setError('Reason must be at least 16 characters.'); return; }
    mut.mutate();
  };

  return (
    <div data-testid="changecust-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Change Order Customer</h1>
      </div>

      {(error || mut.error) && (
        <div className={s.error} data-testid="changecust-error">{error || 'An error occurred.'}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>New Customer *</label>
              <input data-testid="changecust-newcust-field" value={form.customerId} onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))} placeholder="Customer ID or name" required />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Reason * (min 16 characters)</label>
              <textarea
                data-testid="changecust-reason-field"
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                minLength={16}
                required
              />
              <small style={{ color: form.reason.length < 16 ? '#dc2626' : '#6b7280' }}>{form.reason.length}/16 chars minimum</small>
            </div>
          </div>
          <div className={s.actions}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="changecust-submit-btn" disabled={mut.isPending}>
              {mut.isPending ? 'Updating…' : 'Confirm Change'}
            </button>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="changecust-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
