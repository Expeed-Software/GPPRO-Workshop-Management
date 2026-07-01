import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import s from '../jobs/Jobs.module.css';

// Exact Salary01 column names
const emptySalary = () => ({
  empId: '',
  Month: new Date().getMonth() + 1,
  Year:  new Date().getFullYear(),
  // Earnings
  Basic:         0,
  DA:            0,
  Hra:           0,
  Food:          0,
  Petrol:        0,
  Washing:       0,
  OthAllowance:  0,
  Ot:            0,
  incentives:    0,
  // Attendance
  Atten:         0,
  days:          0,
  Absent:        0,
  Leave:         0,
  ReguHoliday:   0,
  OthHoliday:    0,
  // Deductions
  advance:       0,
  OthDeduction:  0,
  // Computed totals (live-calculated, stored on save)
  TotEarning:    0,
  TotalDeduction:0,
  NetSalary:     0,
  MonthSal:      0,
  Hship:         0,
});

type SalaryForm = ReturnType<typeof emptySalary>;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function SalaryEntry() {
  const [form, setForm] = useState<SalaryForm>(emptySalary());
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Load existing salary when empId+Month+Year are set
  const canLoad = Boolean(form.empId && form.Month && form.Year);
  const { data: existing, refetch: loadSalary, isFetching } = useQuery({
    queryKey: ['salary', form.empId, form.Month, form.Year],
    queryFn: () => payrollApi.getSalary(form.empId, form.Month, form.Year),
    enabled: false,
  });

  useEffect(() => {
    if (existing && loaded) {
      if (existing) {
        setForm((p) => ({ ...p, ...existing }));
      }
    }
  }, [existing, loaded]);

  const saveMut = useMutation({
    mutationFn: (d: SalaryForm) => payrollApi.saveSalary(d),
    onSuccess: () => {
      setSuccess('Salary saved successfully.');
      setError('');
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error?.message || 'Save failed.');
      setSuccess('');
    },
  });

  const n = (k: keyof SalaryForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value) || 0;
      setForm((p) => {
        const next = { ...p, [k]: val };
        return recalc(next);
      });
    };

  const recalc = (f: SalaryForm): SalaryForm => {
    const TotEarning = f.Basic + f.DA + f.Hra + f.Food + f.Petrol +
      f.Washing + f.OthAllowance + f.Ot + f.incentives;
    const TotalDeduction = f.advance + f.OthDeduction;
    const NetSalary = TotEarning - TotalDeduction;
    return { ...f, TotEarning, TotalDeduction, NetSalary };
  };

  const handleLoad = async () => {
    if (!canLoad) { setError('Enter Employee ID, Month and Year first.'); return; }
    setLoaded(true);
    setError('');
    setSuccess('');
    await loadSalary();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.empId) { setError('Employee ID is required.'); return; }
    saveMut.mutate(recalc(form));
  };

  const row = (label: string, field: keyof SalaryForm, testid?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <label style={{ width: 160, fontSize: '0.83rem', fontWeight: 500 }}>{label}</label>
      <input
        type="number"
        data-testid={testid || `sal-${field}`}
        value={(form as any)[field]}
        onChange={n(field)}
        min={0}
        step="0.01"
        style={{ width: 120, padding: '0.35rem 0.5rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.875rem' }}
      />
    </div>
  );

  return (
    <div data-testid="salary-entry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Salary Entry</h1>
      </div>

      {error   && <div className={s.error}>{error}</div>}
      {success && <div style={{ color: '#2eae6c', background: '#f0fff4', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Header — Employee + Period */}
        <div className={s.card} style={{ marginBottom: '1rem' }}>
          <div className={s.filterBar} style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Employee ID *</label>
              <input
                data-testid="sal-empid"
                value={form.empId}
                onChange={(e) => setForm((p) => ({ ...p, empId: e.target.value }))}
                placeholder="Employee ID"
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, width: 160 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Month</label>
              <select
                data-testid="sal-month"
                value={form.Month}
                onChange={(e) => setForm((p) => ({ ...p, Month: Number(e.target.value) }))}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
              >
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Year</label>
              <input
                type="number"
                data-testid="sal-year"
                value={form.Year}
                onChange={(e) => setForm((p) => ({ ...p, Year: Number(e.target.value) }))}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, width: 90 }}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                type="button"
                className={`${s.btn} ${s.btnSecondary}`}
                onClick={handleLoad}
                disabled={isFetching}
              >
                {isFetching ? 'Loading…' : 'Load Existing'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {/* Earnings */}
          <div className={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Earnings</h3>
            {row('Basic',           'Basic')}
            {row('DA',              'DA')}
            {row('HRA',             'Hra')}
            {row('Food',            'Food')}
            {row('Petrol',          'Petrol')}
            {row('Washing',         'Washing')}
            {row('Other Allowance', 'OthAllowance')}
            {row('Overtime (OT)',   'Ot')}
            {row('Incentives',      'incentives')}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Earning</span>
                <span data-testid="sal-totearning">{form.TotEarning.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Attendance</h3>
            {row('Attendance Days', 'Atten')}
            {row('Working Days',    'days')}
            {row('Absent',         'Absent')}
            {row('Leave',          'Leave')}
            {row('Regular Holiday','ReguHoliday')}
            {row('Other Holiday',  'OthHoliday')}
          </div>

          {/* Deductions */}
          <div className={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Deductions</h3>
            {row('Advance',          'advance')}
            {row('Other Deduction',  'OthDeduction')}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total Deduction</span>
                <span data-testid="sal-totaldeduction">{form.TotalDeduction.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Summary</h3>
            {row('Monthly Salary',  'MonthSal')}
            {row('Hardship',        'Hship')}
            <div style={{ borderTop: '2px solid #2563eb', paddingTop: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#2563eb' }}>
                <span>Net Salary</span>
                <span data-testid="sal-netsalary">{form.NetSalary.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={s.actions} style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            className={`${s.btn} ${s.btnPrimary}`}
            data-testid="sal-save-btn"
            disabled={saveMut.isPending}
          >
            {saveMut.isPending ? 'Saving…' : 'Save Salary'}
          </button>
        </div>
      </form>
    </div>
  );
}
