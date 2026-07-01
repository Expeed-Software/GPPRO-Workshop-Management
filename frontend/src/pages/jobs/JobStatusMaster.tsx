import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobStatusMasterApi } from '../../api/jobs';
import { useAuthStore } from '../../store/authStore';
import s from './Jobs.module.css';

export default function JobStatusMaster() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('Administrator');
  const qc = useQueryClient();

  const { data: _res, isLoading } = useQuery({ queryKey: ['job-status-master'], queryFn: () => jobStatusMasterApi.list() });
  const statuses: any[] = (_res as any)?.data ?? [];

  const [modal, setModal] = useState<{ open: boolean; id?: string; code: string; label: string; active: boolean }>({ open: false, code: '', label: '', active: true });

  const createMut = useMutation({
    mutationFn: () => jobStatusMasterApi.create({ Description: modal.label, SortOrder: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['job-status-master'] }); setModal({ open: false, code: '', label: '', active: true }); },
  });

  const updateMut = useMutation({
    mutationFn: () => jobStatusMasterApi.update(modal.id!, { Description: modal.label, SortOrder: 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['job-status-master'] }); setModal({ open: false, code: '', label: '', active: true }); },
  });

  if (!isAdmin) {
    return (
      <div data-testid="jobstatusmaster-page" className={s.page}>
        <div className={s.error} data-testid="jobstatusmaster-perm-error">Only Administrators can manage job status master (BR-50).</div>
      </div>
    );
  }

  return (
    <div data-testid="jobstatusmaster-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Job Status Master</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} data-testid="jobstatusmaster-add-btn" onClick={() => setModal({ open: true, code: '', label: '', active: true })}>+ Add Status</button>
      </div>

      <div className={s.card}>
        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : (statuses as any[]).length === 0 ? (
          <div className={s.empty}>No statuses defined.</div>
        ) : (
          <table className={s.table} data-testid="jobstatusmaster-table">
            <thead>
              <tr><th>#</th><th>Code</th><th>Label</th><th>Active</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {(statuses as any[]).map((st: any, i: number) => (
                <tr key={st.StatusID ?? i} data-testid={`jobstatusmaster-row-${st.StatusID}`}>
                  <td>{i + 1}</td>
                  <td>{st.StatusID}</td>
                  <td>{st.Description}</td>
                  <td>
                    <span className={`${s.badge} ${(st.FinishedStatusYN || st.INProgressYN || st.AssignedYN) ? s.badgeGreen : s.badgeRed}`}>{(st.FinishedStatusYN || st.INProgressYN || st.AssignedYN) ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`jobstatusmaster-edit-${st.StatusID}`} style={{ fontSize: '0.75rem' }}
                      onClick={() => setModal({ open: true, id: String(st.StatusID), code: String(st.StatusID ?? ''), label: st.Description ?? '', active: !!(st.FinishedStatusYN || st.INProgressYN || st.AssignedYN) })}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={s.card} style={{ minWidth: 360 }} data-testid="jobstatusmaster-modal">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>{modal.id ? 'Edit' : 'Add'} Status</h2>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label>Code *</label>
                <input data-testid="jobstatusmaster-code-input" value={modal.code} onChange={(e) => setModal((p) => ({ ...p, code: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label>Label *</label>
                <input data-testid="jobstatusmaster-label-input" value={modal.label} onChange={(e) => setModal((p) => ({ ...p, label: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label>Active</label>
                <select data-testid="jobstatusmaster-active-select" value={String(modal.active)} onChange={(e) => setModal((p) => ({ ...p, active: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className={s.actions}>
              <button className={`${s.btn} ${s.btnPrimary}`} data-testid="jobstatusmaster-save-btn"
                onClick={() => modal.id ? updateMut.mutate() : createMut.mutate()}
                disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : 'Save'}
              </button>
              <button className={`${s.btn} ${s.btnSecondary}`} data-testid="jobstatusmaster-cancel-btn" onClick={() => setModal({ open: false, code: '', label: '', active: true })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
