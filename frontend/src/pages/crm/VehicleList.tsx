import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import styles from './CrmList.module.css';

export const VehicleList: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['Administrator', 'Supervisor']);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => vehiclesApi.list(filters),
  });

  const vehicles: any[] = (data?.data as any) || [];
  const total = (data?.meta as any)?.total || 0;

  return (
    <div data-testid="vehicle-list-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vehicles</h1>
          <p className={styles.subtitle}>Manage customer vehicle records</p>
        </div>
        {canWrite && (
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={() => navigate('/crm/vehicles/merge-duplicates')}>Merge Duplicates</Button>
            <Button onClick={() => navigate('/crm/vehicles/new')} data-testid="vehicle-new-button">+ New Vehicle</Button>
          </div>
        )}
      </div>

      <div className={styles.filterBar}>
        <input className={styles.searchInput} placeholder="Search by reg no, make, model..."
          data-testid="vehicle-search-input" value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
        <select className={styles.filterSelect} data-testid="vehicle-status-filter"
          value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load vehicles.</div>
        ) : vehicles.length === 0 ? (
          <div className={styles.emptyState}>No vehicles found.</div>
        ) : (
          <table className={styles.table} data-testid="vehicle-list-table">
            <thead>
              <tr><th>Reg No</th><th>Make</th><th>Model</th><th>Year</th><th>Customer</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {vehicles.map((v: any) => {
                const id = v.VehID ?? v.VehId ?? v.id;
                return (
                  <tr key={id} className={styles.row}>
                    <td className={styles.primaryText}>{v.VehNo ?? v.RegNo ?? v.regNo}</td>
                    <td>{v.Make ?? v.make ?? '—'}</td>
                    <td>{v.RegType ?? v.Model ?? v.model ?? '—'}</td>
                    <td className={styles.dimText}>{v.ManYear ?? v.Year ?? v.year ?? '—'}</td>
                    <td className={styles.dimText}>{v.CustomerName ?? v.CustName ?? v.customerName ?? '—'}</td>
                    <td><span className={styles.statusBadge} style={{ background: (v.Active === 1 || v.Active === true || (v.Status || v.status) === 'active') ? '#2eae6c18' : '#95959418', color: (v.Active === 1 || v.Active === true || (v.Status || v.status) === 'active') ? '#2eae6c' : '#959ac7' }}>{v.Active !== undefined ? (v.Active ? 'active' : 'inactive') : ((v.Status || v.status || 'active'))}</span></td>
                    <td className={styles.actions}>
                      <Link to={`/crm/vehicles/${id}`} className={styles.actionLink}>View</Link>
                      {canWrite && <Link to={`/crm/vehicles/${id}/edit`} className={styles.actionLink}>Edit</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total || vehicles.length} total vehicles</span>
      </div>
    </div>
  );
};
