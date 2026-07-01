import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import s from './Jobs.module.css';

export default function PendingJobCardHelp() {
  const [search, setSearch] = useState('');

  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-jobcard-help', search],
    queryFn: () => jobsApi.pendingJobCardHelp({ search }),
  });

  const filtered = (jobs as any[]).filter((j: any) =>
    !search || [j.jobNo, j.customer, j.vehicle, j.advisor].some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div data-testid="pendingjobcard-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Pending Job Cards</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search job #, customer, vehicle…" data-testid="pendingjobcard-search" value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 260 }} />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : filtered.length === 0 ? (
          <div className={s.empty}>No pending job cards found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="pendingjobcard-table">
              <thead>
                <tr><th>Job #</th><th>Customer</th><th>Vehicle</th><th>Advisor</th><th>Status</th><th>Parts Issue</th><th>Created</th></tr>
              </thead>
              <tbody>
                {filtered.map((job: any, i: number) => (
                  <tr key={job.id ?? i} data-testid={`pendingjobcard-row-${job.id}`}>
                    <td>{job.jobNo ?? job.id}</td>
                    <td>{job.customer}</td>
                    <td>{job.vehicle}</td>
                    <td>{job.advisor}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{job.status ?? 'Pending'}</span></td>
                    <td>{job.missingPart ? <span className={`${s.badge} ${s.badgeRed}`}>Missing: {job.missingPart}</span> : '—'}</td>
                    <td>{job.createdAt ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
