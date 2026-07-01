import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import { usersApi } from '../../api/users';
import { useAuthStore } from '../../store/authStore';
import s from './Jobs.module.css';

export default function JobOrderStatus() {
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const [filters, setFilters] = useState({ status: '', advisor: '' });
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [progress, setProgress] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [signature, setSignature] = useState('');

  const { data: _empRes } = useQuery({ queryKey: ['employees-list'], queryFn: () => usersApi.listEmployees() });
  const employees: any[] = (_empRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['running-jobs', filters],
    queryFn: () => jobsApi.running(filters),
  });
  const jobs: any[] = (_res as any)?.data ?? [];

  const statusMut = useMutation({ mutationFn: () => jobsApi.setStatus(selectedJob.ID ?? selectedJob.id, newStatus), onSuccess: () => { refetch(); setSelectedJob(null); } });
  const progressMut = useMutation({ mutationFn: () => jobsApi.setProgress(selectedJob.ID ?? selectedJob.id, Number(progress), progressNote), onSuccess: () => { refetch(); setSelectedJob(null); } });
  const completeMut = useMutation({ mutationFn: () => jobsApi.complete(selectedJob.ID ?? selectedJob.id, signature), onSuccess: () => { refetch(); setSelectedJob(null); } });

  const getBadgeClass = (status: string) => {
    if (!status) return s.badgeGray;
    const st = status.toLowerCase();
    if (st.includes('complete') || st.includes('done')) return s.badgeGreen;
    if (st.includes('progress') || st.includes('running')) return s.badgeBlue;
    if (st.includes('pending')) return s.badgeYellow;
    if (st.includes('hold') || st.includes('cancel')) return s.badgeRed;
    return s.badgeGray;
  };

  return (
    <div data-testid="joborderstatus-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Job Order Status</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="joborderstatus-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="hold">On Hold</option>
          </select>
          <select data-testid="joborderstatus-filter-advisor" value={filters.advisor} onChange={(e) => setFilters((p) => ({ ...p, advisor: e.target.value }))}>
            <option value="">All Advisors</option>
            {employees.map((e: any) => <option key={e.staffId ?? e.id} value={e.staffId ?? e.id}>{e.name}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (jobs as any[]).length === 0 ? (
          <div className={s.empty}>No jobs found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="joborderstatus-table">
              <thead>
                <tr>
                  <th>Job #</th><th>Customer</th><th>Vehicle</th><th>Advisor</th><th>Status</th><th>Progress</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(jobs as any[]).map((job: any, i: number) => (
                  <tr key={job.ID ?? job.id ?? i}>
                    <td data-testid={`joborderstatus-row-${job.ID ?? job.id}`}>{job.Ordr ?? job.ID}</td>
                    <td>{job.CustomerName}</td>
                    <td>{job.VehId}</td>
                    <td>{job.EmpID}</td>
                    <td><span className={`${s.badge} ${getBadgeClass(job.StatusDescription)}`}>{job.StatusDescription}</span></td>
                    <td>
                      <div className={s.progressBar} style={{ width: 80 }}>
                        <div className={s.progressFill} style={{ width: `${0}%` }} />
                      </div>
                      <small>{0}%</small>
                    </td>
                    <td>
                      <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} data-testid={`joborderstatus-select-${job.ID ?? job.id}`} onClick={() => { setSelectedJob(job); setNewStatus(job.StatusDescription ?? ''); setProgress('0'); }}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <div className={s.card} data-testid="joborderstatus-update-panel">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Update Job #{selectedJob.Ordr ?? selectedJob.ID}</h2>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>New Status</label>
              <input data-testid="joborderstatus-status-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            </div>
            <div className={s.formGroup} />
            <div className={s.formGroup}>
              <label>Progress (%)</label>
              <input type="number" min={0} max={100} data-testid="joborderstatus-progress-input" value={progress} onChange={(e) => setProgress(e.target.value)} />
            </div>
            <div className={s.formGroup}>
              <label>Progress Note</label>
              <input data-testid="joborderstatus-progress-note" value={progressNote} onChange={(e) => setProgressNote(e.target.value)} />
            </div>
            {isSupervisorOrAdmin && (
              <div className={`${s.formGroup} ${s.formFull}`}>
                <label>Digital Signature (for completion — BR-48)</label>
                <input data-testid="joborderstatus-signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
              </div>
            )}
          </div>
          <div className={s.actions}>
            <button className={`${s.btn} ${s.btnPrimary}`} data-testid="joborderstatus-update-status-btn" onClick={() => statusMut.mutate()} disabled={statusMut.isPending}>Update Status</button>
            <button className={`${s.btn} ${s.btnSecondary}`} data-testid="joborderstatus-update-progress-btn" onClick={() => progressMut.mutate()} disabled={progressMut.isPending}>Update Progress</button>
            {isSupervisorOrAdmin && signature && (
              <button className={`${s.btn} ${s.btnSuccess}`} data-testid="joborderstatus-complete-btn" onClick={() => completeMut.mutate()} disabled={completeMut.isPending}>Complete Job</button>
            )}
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setSelectedJob(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
