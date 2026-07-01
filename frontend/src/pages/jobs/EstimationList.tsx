import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { estimationsApi } from '../../api/jobs';
import s from './Jobs.module.css';

export default function EstimationList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    EstimationNo: '',
    JObCardNo: '',
    CustomerName: '',
    StaffId: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 50,
  });

  const { data: _res, isLoading, error } = useQuery({
    queryKey: ['estimations-list', filters],
    queryFn: () => estimationsApi.list(filters),
  });

  const rows: any[] = (_res as any)?.data ?? [];
  const total: number = (_res as any)?.meta?.total ?? 0;

  const f = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilters((p) => ({ ...p, [k]: e.target.value, page: 1 }));

  return (
    <div data-testid="estimation-list-page" className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Estimations</h1>
          <p className={s.subtitle}>Search and manage estimation records</p>
        </div>
        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => navigate('/jobs/estimation-entry')}
        >
          + New Estimation
        </button>
      </div>

      {/* Filter bar */}
      <div className={s.filterBar} style={{ flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
        <input
          placeholder="Estimation No"
          value={filters.EstimationNo}
          onChange={f('EstimationNo')}
          data-testid="filter-estimation-no"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, minWidth: 140 }}
        />
        <input
          placeholder="Job Card No"
          value={filters.JObCardNo}
          onChange={f('JObCardNo')}
          data-testid="filter-jobcardno"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, minWidth: 140 }}
        />
        <input
          placeholder="Customer name"
          value={filters.CustomerName}
          onChange={f('CustomerName')}
          data-testid="filter-customer"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, minWidth: 160 }}
        />
        <input
          placeholder="Staff ID"
          value={filters.StaffId}
          onChange={f('StaffId')}
          data-testid="filter-staff"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, minWidth: 110 }}
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={f('dateFrom')}
          data-testid="filter-date-from"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={f('dateTo')}
          data-testid="filter-date-to"
          style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className={s.skeleton} style={{ height: 200 }} />
      ) : error ? (
        <div className={s.error} role="alert">Failed to load estimations.</div>
      ) : rows.length === 0 ? (
        <div className={s.empty}>No estimations found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className={s.table} data-testid="estimation-table">
            <thead>
              <tr>
                <th>Estimation No</th>
                <th>Date</th>
                <th>Job Card No</th>
                <th>Customer</th>
                <th>Vehicle ID</th>
                <th>Staff ID</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Net</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.ID} data-testid={`est-row-${row.ID}`}>
                  <td>{row.EstimationNo}</td>
                  <td>{row.BillDt ? new Date(row.BillDt).toLocaleDateString() : '—'}</td>
                  <td>{row.JObCardNo || '—'}</td>
                  <td>{row.CustomerName || row.CustomerId}</td>
                  <td>{row.VehicleId}</td>
                  <td>{row.StaffId}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.Total || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(row.nett || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className={`${s.btn} ${s.btnSecondary}`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate(`/jobs/estimation-entry?jobCard=${encodeURIComponent(row.JObCardNo || row.EstimationNo)}`)}
                      data-testid={`est-edit-${row.ID}`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
        {total} total records
      </div>
    </div>
  );
}
