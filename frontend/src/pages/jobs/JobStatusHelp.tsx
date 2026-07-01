import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobStatusMasterApi } from '../../api/jobs';
import s from './Jobs.module.css';

export default function JobStatusHelp() {
  const { data: statuses = [], isLoading } = useQuery({ queryKey: ['job-status-help'], queryFn: () => jobStatusMasterApi.help() });

  return (
    <div data-testid="jobstatushelp-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Job Status Reference</h1>
      </div>
      <div className={s.card}>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
          This page lists all available job statuses used across the system. Read-only reference.
        </p>
        {isLoading ? (
          <div className={s.skeleton} style={{ height: '120px' }} />
        ) : (statuses as any[]).length === 0 ? (
          <div className={s.empty}>No statuses available.</div>
        ) : (
          <table className={s.table} data-testid="jobstatushelp-table">
            <thead>
              <tr><th>#</th><th>Code</th><th>Description</th><th>Colour</th><th>Sort</th></tr>
            </thead>
            <tbody>
              {(statuses as any[]).map((st: any, i: number) => {
                const colour = st.ForeColour ?? st.BackColour;
                return (
                  <tr key={st.StatusID ?? i} data-testid={`jobstatushelp-row-${st.StatusID}`}>
                    <td>{i + 1}</td>
                    <td><code>{st.StatusID}</code></td>
                    <td>{st.Description}</td>
                    <td>
                      {colour ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '3px', background: colour, border: '1px solid #d1d5db' }} />
                          {colour}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{st.SortOrder}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
