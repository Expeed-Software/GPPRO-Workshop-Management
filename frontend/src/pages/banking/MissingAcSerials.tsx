import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function MissingAcSerials() {
  const qc = useQueryClient();
  const [mode, setMode] = useState('');
  const [editRow, setEditRow] = useState<{ id: string; serial: string } | null>(null);
  const [saveError, setSaveError] = useState('');

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ['missing-serials', mode],
    queryFn: () => bankingApi.missingSerials({ mode }),
    enabled: false,
  });

  const patchMut = useMutation({
    mutationFn: ({ id, serial }: { id: string; serial: string }) => bankingApi.patchSerial(id, serial),
    onSuccess: () => { setEditRow(null); qc.invalidateQueries({ queryKey: ['missing-serials'] }); },
    onError: (err: any) => setSaveError(err?.response?.data?.error?.message ?? 'Save failed'),
  });

  return (
    <div data-testid="missingsrl-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Missing Account Serials</h1></div>
      <div className={s.card}>
        <div className={s.alert} style={{ marginBottom: '1rem' }}>Supervisor / Administrator required (BR-134)</div>
        <div className={s.filterBar}>
          <select data-testid="missingsrl-filter-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All</option>
            <option value="Missing">Only Missing</option>
            <option value="Duplicates">Only Duplicates</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="missingsrl-scan-btn" onClick={() => refetch()}>Scan</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '100px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No missing or duplicate serials found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead><tr><th>ID</th><th>Account</th><th>Serial</th><th>Issue</th><th>Actions</th></tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i}>
                    <td>{r.id}</td><td>{r.account}</td>
                    <td>
                      {editRow?.id === String(r.id) ? (
                        <input value={editRow.serial} onChange={(e) => setEditRow({ id: String(r.id), serial: e.target.value })} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', width: '120px' }} />
                      ) : (r.serial ?? <span className={`${s.badge} ${s.badgeRed}`}>Missing</span>)}
                    </td>
                    <td><span className={`${s.badge} ${r.issue === 'Duplicate' ? s.badgeYellow : s.badgeRed}`}>{r.issue ?? 'Missing'}</span></td>
                    <td>
                      {editRow?.id === String(r.id) ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: '0.75rem' }} data-testid={`missingsrl-save-btn-${r.id}`} onClick={() => { setSaveError(''); patchMut.mutate({ id: String(r.id), serial: editRow.serial }); }} disabled={patchMut.isPending}>Save</button>
                          <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => setEditRow(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`missingsrl-edit-btn-${r.id}`} onClick={() => { setSaveError(''); setEditRow({ id: String(r.id), serial: r.serial ?? '' }); }}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {saveError && <div className={s.fieldError} style={{ marginTop: '0.5rem' }}>{saveError}</div>}
      </div>
    </div>
  );
}
