import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import { useAuthStore } from '../../store/authStore';
import s from './Jobs.module.css';

export default function JobAuditLogs() {
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const [jobId, setJobId] = useState('');
  const [searched, setSearched] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['job-audit', searched],
    queryFn: () => jobsApi.auditLogs(searched),
    enabled: !!searched && isSupervisorOrAdmin,
  });

  if (!isSupervisorOrAdmin) {
    return (
      <div data-testid="job-audit-page" className={s.page}>
        <div className={s.error} data-testid="job-audit-perm-error">Only Supervisor or Administrator can view audit logs (BR-131/135).</div>
      </div>
    );
  }

  return (
    <div data-testid="job-audit-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Job Audit Logs</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Job ID" data-testid="job-audit-jobid-input" value={jobId} onChange={(e) => setJobId(e.target.value)} />
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="job-audit-search-btn" onClick={() => setSearched(jobId)}>Search</button>
        </div>

        {!searched && <div className={s.empty}>Enter a Job ID to view its audit history.</div>}

        {searched && isLoading && <div className={s.skeleton} style={{ height: '120px' }} />}

        {searched && !isLoading && (logs as any[]).length === 0 && (
          <div className={s.empty}>No audit entries for this job.</div>
        )}

        {(logs as any[]).length > 0 && (
          <table className={s.table} data-testid="job-audit-table">
            <thead>
              <tr><th>Timestamp</th><th>Action</th><th>User</th><th>Before</th><th>After</th></tr>
            </thead>
            <tbody>
              {(logs as any[]).map((entry: any, i: number) => (
                <tr key={i} data-testid={`job-audit-row-${i}`}>
                  <td style={{ whiteSpace: 'nowrap' }}>{entry.createdAt ?? '—'}</td>
                  <td><span className={`${s.badge} ${s.badgeBlue}`}>{entry.action}</span></td>
                  <td>{entry.userId}</td>
                  <td>
                    <pre style={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'auto', margin: 0 }}>
                      {entry.before ? JSON.stringify(JSON.parse(entry.before), null, 2) : '—'}
                    </pre>
                  </td>
                  <td>
                    <pre style={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'auto', margin: 0 }}>
                      {entry.after ? JSON.stringify(JSON.parse(entry.after), null, 2) : '—'}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
