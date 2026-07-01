import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { payrollApi } from '../../api/payroll';
import styles from './UserList.module.css';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ dept: '', status: '', page: 1 });

  const deactivateMut = useMutation({
    mutationFn: (empId: string) => payrollApi.deactivateEmployee(empId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => usersApi.listEmployees(filters),
  });

  const employees = (data?.data as any) || [];
  const total = data?.meta?.total || 0;

  return (
    <div data-testid="employee-list-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employee List</h1>
          <p className={styles.subtitle}>View and manage staff/employee records</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/admin/employees/new')}>+ New Employee</button>
      </div>

      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          style={{ flex: 1 }}
          placeholder="Filter by department..."
          data-testid="employee-dept-filter"
          value={filters.dept}
          onChange={(e) => setFilters((f) => ({ ...f, dept: e.target.value, page: 1 }))}
        />
        <select
          className={styles.filterSelect}
          data-testid="employee-status-filter"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>
            {[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
          </div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load employees.</div>
        ) : employees.length === 0 ? (
          <div className={styles.emptyState}>No employee records found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id || emp.staffId} className={styles.row}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{emp.name?.charAt(0).toUpperCase() || 'E'}</div>
                    <div>
                      <div className={styles.userName}>{emp.name}</div>
                      <div className={styles.userUsername}>{emp.email || emp.phone || emp.staffId || ''}</div>
                    </div>
                  </td>
                  <td className={styles.dimCell}>{emp.staffId}</td>
                  <td>{(emp as any).ccode || '—'}</td>
                  <td>{emp.role || '—'}</td>
                  <td>
                    <span className={styles.statusBadge}
                      style={{ background: emp.status === 'active' ? '#2eae6c18' : '#95959418', color: emp.status === 'active' ? '#2eae6c' : '#959ac7' }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/employees/${emp.staffId || emp.id}/edit`} className={styles.actionLink} style={{ marginRight: 8 }}>Edit</Link>
                    <button
                      className={styles.actionLink}
                      style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                      onClick={() => { if (window.confirm('Deactivate this employee?')) deactivateMut.mutate(String(emp.staffId || emp.id)); }}
                      disabled={deactivateMut.isPending}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total} total employees</span>
      </div>
    </div>
  );
};
