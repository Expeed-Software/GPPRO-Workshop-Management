import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import s from '../jobs/Jobs.module.css';

// Exact jobInProgress column names used in writes
const emptyClockIn = () => ({
  EmpID:     '',
  Ordr:      '',
  SectionID: '',
  Remarks:   '',
  UserID:    '',
  StatusID:  1,
  Date:      new Date().toISOString().slice(0, 16),
});

export default function ClockingEntry() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ EmpID: '', Ordr: '', dateFrom: '', dateTo: '' });
  const [form, setForm] = useState(emptyClockIn());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clockOutId, setClockOutId] = useState<number | null>(null);
  const [clockOutRemarks, setClockOutRemarks] = useState('');

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['clocking', filter],
    queryFn: () => payrollApi.listClocking(filter),
  });
  const rows: any[] = (_res as any)?.data ?? [];

  const clockInMut = useMutation({
    mutationFn: (d: any) => payrollApi.clockIn(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clocking'] });
      setForm(emptyClockIn());
      setSuccess('Clocked in successfully.');
      setError('');
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error?.message || 'Clock-in failed.');
      setSuccess('');
    },
  });

  const clockOutMut = useMutation({
    mutationFn: ({ id, remarks }: { id: number; remarks: string }) =>
      payrollApi.clockOut(String(id), { StatusID: 2, Remarks: remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clocking'] });
      setClockOutId(null);
      setClockOutRemarks('');
      setSuccess('Clocked out successfully.');
    },
    onError: (e: any) => setError(e?.response?.data?.error?.message || 'Clock-out failed.'),
  });

  const f = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.EmpID) { setError('Employee ID is required.'); return; }
    if (!form.Ordr)  { setError('Job / Order number is required.'); return; }
    clockInMut.mutate(form);
  };

  const statusLabel = (sid: number) =>
    sid === 1 ? 'In Progress' : sid === 2 ? 'Completed' : `Status ${sid}`;

  return (
    <div data-testid="clocking-entry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Clocking / Attendance Entry</h1>
      </div>

      {error   && <div className={s.error}>{error}</div>}
      {success && <div style={{ color: '#2eae6c', background: '#f0fff4', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

      {/* Clock-In Form */}
      <div className={s.card} style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Clock In</h2>
        <form onSubmit={handleClockIn}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Employee ID *</label>
              <input
                data-testid="clock-empid"
                value={form.EmpID}
                onChange={f('EmpID')}
                placeholder="Employee ID"
                style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Job / Order No *</label>
              <input
                data-testid="clock-ordr"
                value={form.Ordr}
                onChange={f('Ordr')}
                placeholder="Job order number"
                style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Section</label>
              <input
                data-testid="clock-section"
                value={form.SectionID}
                onChange={f('SectionID')}
                placeholder="Section ID"
                style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date / Time</label>
              <input
                type="datetime-local"
                data-testid="clock-date"
                value={form.Date}
                onChange={f('Date')}
                style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Remarks</label>
              <input
                data-testid="clock-remarks"
                value={form.Remarks}
                onChange={f('Remarks')}
                placeholder="Optional remarks"
                style={{ width: '100%', padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${s.btn} ${s.btnPrimary}`}
            data-testid="clock-in-btn"
            disabled={clockInMut.isPending}
          >
            {clockInMut.isPending ? 'Saving…' : 'Clock In'}
          </button>
        </form>
      </div>

      {/* Filter + List */}
      <div className={s.card}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Attendance Records</h2>
        <div className={s.filterBar} style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <input
            placeholder="Employee ID"
            value={filter.EmpID}
            onChange={(e) => setFilter((p) => ({ ...p, EmpID: e.target.value }))}
            data-testid="clock-filter-empid"
            style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          />
          <input
            placeholder="Job / Order #"
            value={filter.Ordr}
            onChange={(e) => setFilter((p) => ({ ...p, Ordr: e.target.value }))}
            data-testid="clock-filter-ordr"
            style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          />
          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => setFilter((p) => ({ ...p, dateFrom: e.target.value }))}
            data-testid="clock-filter-from"
            style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          />
          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => setFilter((p) => ({ ...p, dateTo: e.target.value }))}
            data-testid="clock-filter-to"
            style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: 120 }} />
        ) : rows.length === 0 ? (
          <div className={s.empty}>No attendance records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="clocking-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Job / Ordr</th>
                  <th>Section</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row.ID} data-testid={`clock-row-${row.ID}`}>
                    <td>{row.ID}</td>
                    <td>{row.EmpID}</td>
                    <td>{row.Ordr}</td>
                    <td>{row.SectionID}</td>
                    <td>{row.Date ? new Date(row.Date).toLocaleString() : '—'}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                        background: row.StatusID === 1 ? '#dbeafe' : '#dcfce7',
                        color: row.StatusID === 1 ? '#1d4ed8' : '#166534',
                      }}>
                        {statusLabel(row.StatusID)}
                      </span>
                    </td>
                    <td>{row.Remarks}</td>
                    <td>
                      {row.StatusID === 1 && clockOutId !== row.ID && (
                        <button
                          className={`${s.btn} ${s.btnSecondary}`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => { setClockOutId(row.ID); setClockOutRemarks(''); }}
                          data-testid={`clock-out-btn-${row.ID}`}
                        >
                          Clock Out
                        </button>
                      )}
                      {clockOutId === row.ID && (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <input
                            placeholder="Remarks"
                            value={clockOutRemarks}
                            onChange={(e) => setClockOutRemarks(e.target.value)}
                            style={{ padding: '0.3rem 0.5rem', border: '1px solid #ddd', borderRadius: 4, width: 120 }}
                            data-testid={`clock-out-remarks-${row.ID}`}
                          />
                          <button
                            className={`${s.btn} ${s.btnPrimary}`}
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => clockOutMut.mutate({ id: row.ID, remarks: clockOutRemarks })}
                            disabled={clockOutMut.isPending}
                            data-testid={`clock-out-confirm-${row.ID}`}
                          >
                            Confirm
                          </button>
                          <button
                            className={`${s.btn} ${s.btnSecondary}`}
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setClockOutId(null)}
                          >
                            ×
                          </button>
                        </div>
                      )}
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
