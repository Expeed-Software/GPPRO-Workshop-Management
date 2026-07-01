import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { vouchersApi } from '../../api/accounts';
import s from './Accounts.module.css';

interface Line { account: string; debit: string; credit: string; narration: string; }

interface Props { bulk?: boolean; pdcType?: 'receipt' | 'transactions'; }

export default function JournalVoucherEntry({ bulk = false, pdcType }: Props) {
  const title = pdcType === 'receipt' ? 'Bulk PDC Receipt Transactions' : pdcType === 'transactions' ? 'Bulk PDC Transactions' : bulk ? 'Bulk Journal Voucher Entry' : 'Journal Voucher Entry';
  const testidPrefix = pdcType === 'receipt' ? 'bulk-pdc-receipt' : pdcType === 'transactions' ? 'bulk-pdc-transactions' : bulk ? 'bulk-journal-entry' : 'journal-entry';

  const [form, setForm] = useState({ date: '', reference: '', narration: '' });
  const [lines, setLines] = useState<Line[]>([{ account: '', debit: '', credit: '', narration: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const mutFn = pdcType === 'receipt' ? vouchersApi.bulkPDCReceipt : pdcType === 'transactions' ? vouchersApi.bulkPDC : bulk ? vouchersApi.bulkJournal : vouchersApi.createJournal;

  const mut = useMutation({
    mutationFn: (data: any) => mutFn(data),
    onSuccess: () => { setSuccess('Voucher entry saved.'); setLines([{ account: '', debit: '', credit: '', narration: '' }]); },
    onError: (err: any) => setErrors({ global: err?.response?.data?.error?.message ?? 'Save failed' }),
  });

  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.narration) e.narration = 'Narration is required';
    if (!balanced) e.balance = 'Debits must equal Credits (BR-110)';
    if (lines.some((l) => !l.account)) e.lines = 'All lines must have an account';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addLine = () => setLines((p) => [...p, { account: '', debit: '', credit: '', narration: '' }]);
  const removeLine = (i: number) => setLines((p) => p.filter((_, idx) => idx !== i));
  const updateLine = (i: number, key: keyof Line, val: string) => setLines((p) => p.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}><h1 className={s.title}>{title}</h1></div>
      <div className={s.card}>
        {errors.global && <div className={s.fieldError} style={{ marginBottom: '1rem' }}>{errors.global}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}
        <div className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}><label>Date *</label><input type="date" data-testid={`${testidPrefix}-date`} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />{errors.date && <div className={s.fieldError}>{errors.date}</div>}</div>
            <div className={s.field}><label>Reference</label><input data-testid={`${testidPrefix}-reference`} value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} /></div>
            <div className={s.field}><label>Narration *</label><input data-testid={`${testidPrefix}-narration`} value={form.narration} onChange={(e) => setForm((p) => ({ ...p, narration: e.target.value }))} />{errors.narration && <div className={s.fieldError}>{errors.narration}</div>}</div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-lines-table`}>
              <thead><tr><th>Account *</th><th>Debit</th><th>Credit</th><th>Narration</th><th></th></tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td><input value={l.account} onChange={(e) => updateLine(i, 'account', e.target.value)} style={{ width: '140px', padding: '0.3rem' }} /></td>
                    <td><input type="number" value={l.debit} onChange={(e) => updateLine(i, 'debit', e.target.value)} style={{ width: '90px', padding: '0.3rem' }} /></td>
                    <td><input type="number" value={l.credit} onChange={(e) => updateLine(i, 'credit', e.target.value)} style={{ width: '90px', padding: '0.3rem' }} /></td>
                    <td><input value={l.narration} onChange={(e) => updateLine(i, 'narration', e.target.value)} style={{ width: '140px', padding: '0.3rem' }} /></td>
                    <td>{lines.length > 1 && <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }} onClick={() => removeLine(i)}>✕</button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`${testidPrefix}-add-line`} onClick={addLine}>+ Add Line</button></td>
                  <td><strong>{totalDebit.toFixed(2)}</strong></td>
                  <td><strong>{totalCredit.toFixed(2)}</strong></td>
                  <td colSpan={2}><span className={`${s.badge} ${balanced ? s.badgeGreen : s.badgeRed}`}>{balanced ? 'Balanced ✓' : 'Unbalanced!'}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {errors.balance && <div className={s.fieldError}>{errors.balance}</div>}
          {errors.lines && <div className={s.fieldError}>{errors.lines}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${testidPrefix}-submit-btn`} onClick={() => { if (validate()) mut.mutate({ ...form, lines }); }} disabled={mut.isPending}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BulkJournalVoucherEntry = () => <JournalVoucherEntry bulk />;
export const BulkPDCReceiptTransactions = () => <JournalVoucherEntry pdcType="receipt" />;
export const BulkPDCTransactions = () => <JournalVoucherEntry pdcType="transactions" />;
