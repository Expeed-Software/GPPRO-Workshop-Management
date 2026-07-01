import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import styles from './UserList.module.css';

const emptyForm = () => ({
  EmpID: '',
  EmpName: '',
  Dept: '',
  Desig: '',
  DateJoin: '',
  DOB: '',
  Gender: '',
  Phone: '',
  Email: '',
  BasicSal: 0,
});

export const EmployeeEntry: React.FC = () => {
  const { empId } = useParams<{ empId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(empId);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['payroll-employee', empId],
    queryFn: () => payrollApi.getEmployee(empId!),
    enabled: isEdit,
  });

  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        EmpID:    existing.EmpID    ?? '',
        EmpName:  existing.EmpName  ?? '',
        Dept:     existing.Dept     ?? '',
        Desig:    existing.Desig    ?? '',
        DateJoin: existing.DateJoin ? existing.DateJoin.toString().slice(0, 10) : '',
        DOB:      existing.DOB      ? existing.DOB.toString().slice(0, 10)      : '',
        Gender:   existing.Gender   ?? '',
        Phone:    existing.Phone    ?? '',
        Email:    existing.Email    ?? '',
        BasicSal: existing.BasicSal ?? 0,
      });
    }
  }, [existing]);

  const createMut = useMutation({
    mutationFn: (d: any) => payrollApi.createEmployee(d),
    onSuccess: () => navigate('/admin/employees'),
    onError: (e: any) => setError(e?.response?.data?.error?.message || 'Save failed.'),
  });
  const updateMut = useMutation({
    mutationFn: (d: any) => payrollApi.updateEmployee(empId!, d),
    onSuccess: () => navigate('/admin/employees'),
    onError: (e: any) => setError(e?.response?.data?.error?.message || 'Update failed.'),
  });

  const f = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.EmpID)   { setError('Employee ID is required.');   return; }
    if (!form.EmpName) { setError('Employee Name is required.'); return; }
    if (isEdit) updateMut.mutate(form); else createMut.mutate(form);
  };

  if (isLoading) return <div className={styles.page}><div className={styles.skeleton} style={{ height: 200 }} /></div>;

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div data-testid="employee-entry-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? `Edit Employee — ${empId}` : 'New Employee'}</h1>
          <p className={styles.subtitle}>Employee master record (EmployeeDet)</p>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ color: 'var(--color-error)', background: '#fee', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--color-card)', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Employee ID *</label>
              <input
                data-testid="empentry-empid"
                className={styles.searchInput}
                value={form.EmpID}
                onChange={f('EmpID')}
                placeholder="e.g. E001"
                disabled={isEdit}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name *</label>
              <input
                data-testid="empentry-empname"
                className={styles.searchInput}
                value={form.EmpName}
                onChange={f('EmpName')}
                placeholder="Employee full name"
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Department</label>
              <input
                data-testid="empentry-dept"
                className={styles.searchInput}
                value={form.Dept}
                onChange={f('Dept')}
                placeholder="Department"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Designation</label>
              <input
                data-testid="empentry-desig"
                className={styles.searchInput}
                value={form.Desig}
                onChange={f('Desig')}
                placeholder="Job title / designation"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date of Joining</label>
              <input
                type="date"
                data-testid="empentry-datejoin"
                className={styles.searchInput}
                value={form.DateJoin}
                onChange={f('DateJoin')}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date of Birth</label>
              <input
                type="date"
                data-testid="empentry-dob"
                className={styles.searchInput}
                value={form.DOB}
                onChange={f('DOB')}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Gender</label>
              <select
                data-testid="empentry-gender"
                className={styles.filterSelect}
                value={form.Gender}
                onChange={f('Gender')}
                style={{ width: '100%' }}
              >
                <option value="">— Select —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label>
              <input
                data-testid="empentry-phone"
                className={styles.searchInput}
                value={form.Phone}
                onChange={f('Phone')}
                placeholder="Phone number"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
              <input
                type="email"
                data-testid="empentry-email"
                className={styles.searchInput}
                value={form.Email}
                onChange={f('Email')}
                placeholder="Email address"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Basic Salary</label>
              <input
                type="number"
                data-testid="empentry-basicsal"
                className={styles.searchInput}
                value={form.BasicSal}
                onChange={(e) => setForm((p) => ({ ...p, BasicSal: Number(e.target.value) }))}
                min={0}
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            className={styles.createBtn}
            data-testid="empentry-save-btn"
            disabled={busy}
          >
            {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
          <button
            type="button"
            className={styles.filterSelect}
            style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}
            onClick={() => navigate('/admin/employees')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeEntry;
