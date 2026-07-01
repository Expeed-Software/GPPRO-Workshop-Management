import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mailApi } from '../../api/messaging';
import s from './Messaging.module.css';

const schema = z.object({
  toUserId: z.string().min(1, 'Recipient required'),
  subject: z.string().min(1, 'Subject required'),
  reportType: z.string().min(1, 'Report type required'),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const REPORT_TYPES = ['Sales Summary', 'Outstanding Balances', 'Daily Receipts', 'Petty Cash', 'Voucher Summary', 'Trial Balance'];

export default function MailReporter() {
  const [sentId, setSentId] = useState<string | null>(null);
  const { data: sentList = [] } = useQuery({ queryKey: ['sent-reports'], queryFn: () => mailApi.sentReports() });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const sendMut = useMutation({
    mutationFn: (d: Form) => mailApi.sendReport(d),
    onSuccess: (data: any) => { setSentId(data?.id ?? 'sent'); reset(); },
  });

  return (
    <div data-testid="mailreporter-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Mail Reporter</h1></div>
      <div className={s.card}>
        <form onSubmit={handleSubmit((d) => sendMut.mutate(d))} className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label>To (User ID)</label>
              <input {...register('toUserId')} placeholder="Recipient user ID" />
              {errors.toUserId && <span className={s.fieldError}>{errors.toUserId.message}</span>}
            </div>
            <div className={s.field}>
              <label>Report Type</label>
              <select {...register('reportType')}>
                <option value="">Select report...</option>
                {REPORT_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.reportType && <span className={s.fieldError}>{errors.reportType.message}</span>}
            </div>
          </div>
          <div className={s.field}>
            <label>Subject</label>
            <input {...register('subject')} placeholder="Email subject" />
            {errors.subject && <span className={s.fieldError}>{errors.subject.message}</span>}
          </div>
          <div className={s.field}>
            <label>Notes</label>
            <textarea {...register('notes')} rows={3} placeholder="Optional notes..." />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="mailreport-send-btn" disabled={sendMut.isPending}>
              {sendMut.isPending ? 'Sending...' : 'Send Report Mail'}
            </button>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="mailreport-cancel-btn" onClick={() => reset()}>Cancel</button>
          </div>
          {sentId && <a data-testid="mailreport-sent-link" href="#sent" style={{ color: '#3831c4', fontSize: '0.85rem' }}>Report sent — view in Sent Mail (ID: {sentId})</a>}
        </form>
      </div>
      {(sentList as any[]).length > 0 && (
        <div className={s.card}>
          <strong style={{ fontSize: '0.9rem', color: '#1e1b4b' }}>Sent Reports</strong>
          <table className={s.table} style={{ marginTop: '0.5rem' }}>
            <thead><tr><th>To</th><th>Subject</th><th>Report</th><th>Date</th></tr></thead>
            <tbody>
              {(sentList as any[]).map((m: any, i: number) => (
                <tr key={i}><td>{m.SendTo}</td><td>{m.Subject}</td><td>{m.reportType}</td><td>{m.Date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
