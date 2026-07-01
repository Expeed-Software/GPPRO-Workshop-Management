import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import s from './Reports.module.css';

export default function CompanyReportHeader() {
  const qc = useQueryClient();
  const { data: header, isLoading } = useQuery({ queryKey: ['company-header'], queryFn: () => reportsApi.companyHeader() });
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState(false);

  const mut = useMutation({
    mutationFn: reportsApi.updateCompanyHeader,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-header'] }); setEditing(false); },
  });

  const current = { ...header, ...form };

  return (
    <div data-testid="company-header-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Company Report Header</h1>
        {!editing && <button className={`${s.btn} ${s.btnPrimary}`} data-testid="company-header-edit-btn" onClick={() => { setForm(header ?? {}); setEditing(true); }}>Edit</button>}
      </div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '80px' }} /> : editing ? (
          <div className={s.filterBar} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            {['companyName', 'address', 'phone', 'email', 'website', 'logo'].map((k) => (
              <div key={k} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ width: '120px', fontSize: '0.8rem', fontWeight: 600, color: '#4338ca' }}>{k}</label>
                <input value={form[k] ?? ''} onChange={(e) => setForm((p: any) => ({ ...p, [k]: e.target.value }))} style={{ padding: '0.3rem 0.6rem', border: '1px solid rgba(56,49,196,0.2)', borderRadius: '0.375rem', width: '280px' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className={`${s.btn} ${s.btnPrimary}`} data-testid="company-header-save-btn" onClick={() => mut.mutate(form)} disabled={mut.isPending}>Save</button>
              <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', fontSize: '0.875rem' }}>
            {['companyName', 'address', 'phone', 'email', 'website'].map((k) => (
              <React.Fragment key={k}>
                <span style={{ fontWeight: 600, color: '#4338ca' }}>{k}</span>
                <span>{(header as any)?.[k] ?? '—'}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
