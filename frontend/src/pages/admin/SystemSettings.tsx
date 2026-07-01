import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import s from './Admin.module.css';

// Fields mapped to real Company table columns (SELECT TOP 1 * FROM Company)
// CompanyName, Address1, Phone1, email, CCode
const FIELDS = [
  { key: 'CompanyName', label: 'Company Name', type: 'text' },
  { key: 'Address1', label: 'Address', type: 'text' },
  { key: 'Phone1', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'CCode', label: 'Company Code', type: 'text' },
];

export default function SystemSettings() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['system-settings'], queryFn: () => adminApi.settings() });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => { if (settings) setForm(settings as any); }, [settings]);

  const mut = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['system-settings'] }),
  });

  return (
    <div data-testid="settings-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>System Settings</h1></div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '200px' }} /> : (
          <div className={s.form}>
            <div className={s.formRow}>
              {FIELDS.map((f) => (
                <div key={f.key} className={s.field}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.key] ?? ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}>
                      {f.options?.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={form[f.key] ?? ''} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={`${s.btn} ${s.btnSecondary}`} data-testid="settings-reset-btn" onClick={() => setForm(settings as any ?? {})}>Reset</button>
              <button className={`${s.btn} ${s.btnPrimary}`} data-testid="settings-save-btn" onClick={() => mut.mutate(form)} disabled={mut.isPending}>Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
