import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../api/jobs';
import s from './Jobs.module.css';

export default function WorkStatusSummary() {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['work-status-summary', filters],
    queryFn: () => jobsApi.workStatusSummary(filters),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  const totals = (rows as any[]).reduce((acc: any, row: any) => ({
    total: (acc.total ?? 0) + (row.total ?? 0),
    running: (acc.running ?? 0) + (row.running ?? 0),
    completed: (acc.completed ?? 0) + (row.completed ?? 0),
    pending: (acc.pending ?? 0) + (row.pending ?? 0),
  }), { total: 0, running: 0, completed: 0, pending: 0 });

  return (
    <div data-testid="rptworkstatussummary-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Work Status Summary</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>From</label>
            <input type="date" data-testid="rptworkstatussummary-filter-from" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>To</label>
            <input type="date" data-testid="rptworkstatussummary-filter-to" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
          </div>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Generate</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: '100px' }} />
        ) : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No summary data available.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total', value: totals.total, cls: s.badgeBlue },
                { label: 'Running', value: totals.running, cls: s.badgeYellow },
                { label: 'Completed', value: totals.completed, cls: s.badgeGreen },
                { label: 'Pending', value: totals.pending, cls: s.badgeRed },
              ].map((card) => (
                <div key={card.label} className={s.card} style={{ textAlign: 'center', margin: 0 }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{card.value}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className={s.table} data-testid="rptworkstatussummary-table">
                <thead>
                  <tr><th>Advisor</th><th>Total</th><th>Running</th><th>Completed</th><th>Pending</th><th>On Hold</th></tr>
                </thead>
                <tbody>
                  {(rows as any[]).map((row: any, i: number) => (
                    <tr key={i} data-testid={`rptworkstatussummary-row-${i}`}>
                      <td>{row.advisor ?? '—'}</td>
                      <td>{row.total ?? 0}</td>
                      <td>{row.running ?? 0}</td>
                      <td>{row.completed ?? 0}</td>
                      <td>{row.pending ?? 0}</td>
                      <td>{row.onHold ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td>Total</td>
                    <td>{totals.total}</td>
                    <td>{totals.running}</td>
                    <td>{totals.completed}</td>
                    <td>{totals.pending}</td>
                    <td>—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
