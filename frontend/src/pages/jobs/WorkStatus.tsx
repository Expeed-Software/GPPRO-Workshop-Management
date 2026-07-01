import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { usersApi } from '../../api/users';
import s from './Jobs.module.css';

export default function WorkStatus() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', advisor: '' });

  const { data: _empRes } = useQuery({ queryKey: ['employees-list'], queryFn: () => usersApi.listEmployees() });
  const employees: any[] = (_empRes as any)?.data ?? [];

  const { data: jobsResult, isLoading, refetch } = useQuery({
    queryKey: ['work-status', filters],
    queryFn: () => jobsApi.workStatus(filters),
  });
  const jobs: any[] = jobsResult?.data ?? [];

  const getBadge = (status: string) => {
    if (!status) return s.badgeGray;
    const st = status.toLowerCase();
    if (st.includes('complete') || st.includes('done')) return s.badgeGreen;
    if (st.includes('progress') || st.includes('running')) return s.badgeBlue;
    if (st.includes('pending')) return s.badgeYellow;
    if (st.includes('hold') || st.includes('cancel')) return s.badgeRed;
    return s.badgeGray;
  };

  return (
    <div data-testid="workstatus-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Work Status</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => navigate('/jobs/estimation-entry')}>+ New Estimation</button>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" data-testid="workstatus-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" data-testid="workstatus-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          </div>
          <select data-testid="workstatus-filter-advisor" value={filters.advisor} onChange={(e) => setFilters((p) => ({ ...p, advisor: e.target.value }))}>
            <option value="">All Advisors</option>
            {employees.map((e: any) => <option key={e.staffId ?? e.id} value={e.staffId ?? e.id}>{e.name}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : jobs.length === 0 ? (
          <div className={s.empty}>No jobs found for the selected criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="workstatus-table">
              <thead>
                <tr><th>Job #</th><th>Customer</th><th>Vehicle</th><th>Advisor</th><th>Status</th><th>Progress</th><th>Updated</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {jobs.map((job: any, i: number) => (
                  <tr key={job.id ?? i} data-testid={`workstatus-row-${job.id}`}>
                    <td>{job.Ordr ?? job.ID}</td>
                    <td>{job.CustomerName}</td>
                    <td>{job.VehId}</td>
                    <td>{job.staffid}</td>
                    <td><span className={`${s.badge} ${getBadge(job.StatusDescription)}`}>{job.StatusDescription}</span></td>
                    <td>
                      <div className={s.progressBar}>
                        <div className={s.progressFill} style={{ width: `${0}%` }} />
                      </div>
                      <small>{0}%</small>
                    </td>
                    <td>{job.Ordt ?? '—'}</td>
                    <td>
                      <button
                        className={`${s.btn} ${s.btnSecondary}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                        onClick={() => navigate(`/jobs/estimation-entry/${job.Ordr ?? job.ID}`)}
                      >
                        Labour &amp; Parts
                      </button>
                    </td>
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
