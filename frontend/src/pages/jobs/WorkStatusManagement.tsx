import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import s from './Jobs.module.css';

export default function WorkStatusManagement() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  const { data: _overview, isLoading, refetch } = useQuery({
    queryKey: ['work-status-overview', filters],
    queryFn: () => jobsApi.workStatus({ ...filters, overview: true }),
  });
  const overview: any[] = (_overview as any)?.data ?? [];

  const { data: _running, isLoading: runLoading } = useQuery({
    queryKey: ['running-jobs'],
    queryFn: () => jobsApi.running({}),
  });
  const running: any[] = (_running as any)?.data ?? [];

  const { data: _partsNA } = useQuery({
    queryKey: ['parts-not-available'],
    queryFn: () => jobsApi.partsNotAvailable({}),
  });
  const partsNA: any[] = (_partsNA as any)?.data ?? [];

  return (
    <div data-testid="workstatusmgmt-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Work Status Management</h1>
      </div>

      <div className={s.filterBar} style={{ marginBottom: '1rem' }}>
        <input type="date" data-testid="workstatusmgmt-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
        <input type="date" data-testid="workstatusmgmt-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className={s.card} data-testid="workstatusmgmt-overview-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3831c4' }}>{(running as any[]).length}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Running Jobs</div>
        </div>
        <div className={s.card} data-testid="workstatusmgmt-parts-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{(partsNA as any[]).length}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Parts Not Available</div>
        </div>
        <div className={s.card} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065f46' }}>{(overview as any[]).length}</div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Active</div>
        </div>
      </div>

      <div className={s.card}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Running Jobs</h2>
        {runLoading ? (
          <div className={s.skeleton} style={{ height: '100px' }} />
        ) : (running as any[]).length === 0 ? (
          <div className={s.empty}>No running jobs.</div>
        ) : (
          <table className={s.table} data-testid="workstatusmgmt-running-table">
            <thead><tr><th>Job #</th><th>Customer</th><th>Advisor</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {(running as any[]).map((job: any, i: number) => (
                <tr key={job.ID ?? job.id ?? i}>
                  <td>{job.Ordr ?? job.jobNo ?? job.id}</td>
                  <td>{job.CustomerName ?? job.customer ?? '—'}</td>
                  <td>{job.EmpID ?? job.advisor ?? '—'}</td>
                  <td>{job.StatusDescription ?? job.status ?? '—'}</td>
                  <td>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(partsNA as any[]).length > 0 && (
        <div className={s.card} data-testid="workstatusmgmt-partsna-section">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem', color: '#dc2626' }}>Parts Not Available</h2>
          <table className={s.table} data-testid="workstatusmgmt-parts-table">
            <thead><tr><th>Job #</th><th>Customer</th><th>Vehicle</th><th>Missing Part</th><th>Advisor</th></tr></thead>
            <tbody>
              {(partsNA as any[]).map((job: any, i: number) => (
                <tr key={job.ID ?? job.id ?? i}>
                  <td>{job.Ordr ?? job.jobNo ?? job.id}</td>
                  <td>{job.CustomerName ?? job.customer ?? '—'}</td>
                  <td>{job.VehNo ?? job.vehicle ?? '—'}</td>
                  <td>{job.ItemDescription ?? job.missingPart ?? '—'}</td>
                  <td>{job.EmpName ?? job.advisor ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
