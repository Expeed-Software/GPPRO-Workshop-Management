import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import { usersApi } from '../../api/users';
import s from './Jobs.module.css';

export default function WorkStatusReport() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', advisor: '', status: '' });

  const { data: _empRes } = useQuery({ queryKey: ['employees-list'], queryFn: () => usersApi.listEmployees() });
  const employees: any[] = (_empRes as any)?.data ?? [];

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['work-status-report', filters],
    queryFn: () => jobsApi.workStatusReport(filters),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  return (
    <div data-testid="workstatusreport-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Work Status Report</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" data-testid="workstatusreport-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" data-testid="workstatusreport-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          </div>
          <select data-testid="workstatusreport-filter-advisor" value={filters.advisor} onChange={(e) => setFilters((p) => ({ ...p, advisor: e.target.value }))}>
            <option value="">All Advisors</option>
            {employees.map((e: any) => <option key={e.staffId ?? e.id} value={e.staffId ?? e.id}>{e.name}</option>)}
          </select>
          <select data-testid="workstatusreport-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="hold">On Hold</option>
          </select>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate Report</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '150px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data for the selected criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="workstatusreport-table">
              <thead>
                <tr><th>Job #</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Advisor</th><th>Status</th><th>Progress</th><th>Completion</th></tr>
              </thead>
              <tbody>
                {(rows as any[]).map((row: any, i: number) => (
                  <tr key={row.id ?? i} data-testid={`workstatusreport-row-${row.id}`}>
                    <td>{row.Ordr ?? row.ID}</td>
                    <td>{row.Ordt ?? '—'}</td>
                    <td>{row.CustomerName}</td>
                    <td>{row.VehId}</td>
                    <td>{row.staffid}</td>
                    <td>{row.StatusDescription}</td>
                    <td>{0}%</td>
                    <td>{'—'}</td>
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
