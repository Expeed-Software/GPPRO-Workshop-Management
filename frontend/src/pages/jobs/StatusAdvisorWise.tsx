import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import { usersApi } from '../../api/users';
import s from './Jobs.module.css';

export default function StatusAdvisorWise() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', advisor: '' });

  const { data: _empRes } = useQuery({ queryKey: ['employees-list'], queryFn: () => usersApi.listEmployees() });
  const employees: any[] = (_empRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['advisorwise-report', filters],
    queryFn: () => jobsApi.advisorwiseReport(filters),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  const advisors = Array.from(new Set(rows.map((r: any) => r.staffid).filter(Boolean)));

  return (
    <div data-testid="statusadvisorwise-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Status — Advisor Wise Report</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" data-testid="statusadvisorwise-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" data-testid="statusadvisorwise-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          </div>
          <select data-testid="statusadvisorwise-filter-advisor" value={filters.advisor} onChange={(e) => setFilters((p) => ({ ...p, advisor: e.target.value }))}>
            <option value="">All Advisors</option>
            {employees.map((e: any) => <option key={e.staffId ?? e.id} value={e.staffId ?? e.id}>{e.name}</option>)}
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data for the selected criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="statusadvisorwise-table">
              <thead>
                <tr><th>Advisor</th><th>Job #</th><th>Customer</th><th>Vehicle</th><th>Status</th><th>Progress</th><th>Date</th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((row: any, i: number) => (
                  <tr key={row.id ?? i} data-testid={`statusadvisorwise-row-${row.id}`}>
                    <td style={{ fontWeight: 600, color: '#3831c4' }}>{row.staffid}</td>
                    <td>{row.Ordr ?? row.ID}</td>
                    <td>{row.CustomerName}</td>
                    <td>{row.VehId}</td>
                    <td>{row.StatusDescription}</td>
                    <td>{0}%</td>
                    <td>{row.Ordt ? new Date(row.Ordt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {advisors.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Summary by Advisor</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {advisors.map((adv: string) => {
                const advRows = (rows as any[]).filter((r: any) => r.staffid === adv);
                const completed = advRows.filter((r: any) => r.StatusDescription?.toLowerCase().includes('complete')).length;
                return (
                  <div key={adv} className={s.card} style={{ minWidth: 160, margin: 0, textAlign: 'center' }} data-testid={`statusadvisorwise-advisor-${adv}`}>
                    <div style={{ fontWeight: 700, color: '#3831c4' }}>{adv}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{advRows.length} jobs · {completed} completed</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
