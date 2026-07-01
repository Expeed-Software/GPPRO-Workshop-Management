import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports';
import s from './Reports.module.css';

export default function SalarySlip() {
  const [employeeId, setEmployeeId] = useState('');
  const [period, setPeriod] = useState('');

  const { data: slip, isLoading, refetch } = useQuery({
    queryKey: ['salary-slip', employeeId, period],
    queryFn: () => reportsApi.salarySlip(employeeId, period),
    enabled: false,
  });

  return (
    <div data-testid="salary-slip-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Salary Slip</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => window.print()}>Print</button>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input data-testid="salary-slip-employee" placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          <input data-testid="salary-slip-period" placeholder="Period (YYYY-MM)" value={period} onChange={(e) => setPeriod(e.target.value)} />
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="salary-slip-generate-btn" onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : !slip ? (
          <div className={s.empty}>Enter Employee ID and Period to generate slip.</div>
        ) : (
          <div data-testid="salary-slip-content" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem', fontSize: '0.875rem' }}>
            {Object.entries(slip as any).map(([k, v]) => (
              <React.Fragment key={k}><span style={{ fontWeight: 600, color: '#4338ca' }}>{k}</span><span>{String(v)}</span></React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
