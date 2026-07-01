import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import styles from './CrmList.module.css';

export const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['Administrator', 'Supervisor']);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => suppliersApi.list(filters),
  });

  const suppliers: any[] = (data?.data as any) || [];
  const total = (data?.meta as any)?.total || 0;

  return (
    <div data-testid="supplier-management-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Suppliers</h1>
          <p className={styles.subtitle}>Manage supplier accounts and contacts</p>
        </div>
        {canWrite && (
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={() => navigate('/crm/suppliers/merge-duplicates')}>Merge Duplicates</Button>
            <Button onClick={() => navigate('/crm/suppliers/new')} data-testid="supplier-new-button">+ New Supplier</Button>
          </div>
        )}
      </div>

      <div className={styles.filterBar}>
        <input className={styles.searchInput} placeholder="Search suppliers..." data-testid="supplier-search-input"
          value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))} />
        <select className={styles.filterSelect} data-testid="supplier-status-filter"
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
          <div className={styles.errorState} role="alert">Failed to load suppliers.</div>
        ) : suppliers.length === 0 ? (
          <div className={styles.emptyState}>No suppliers found.</div>
        ) : (
          <table className={styles.table} data-testid="supplier-list-table">
            <thead>
              <tr><th>Supplier</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {suppliers.map((s: any) => {
                const id = s.SuppID ?? s.SuppId ?? s.id;
                return (
                  <tr key={id} className={styles.row}>
                    <td className={styles.nameCell}>
                      <div className={styles.avatar}>{(s.SuppName ?? s.SupplierName ?? s.name ?? 'S').charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.primaryText}>{s.SuppName ?? s.SupplierName ?? s.name}</div>
                        <div className={styles.dimText}>{s.Address1 ?? s.Address ?? s.address ?? ''}</div>
                      </div>
                    </td>
                    <td className={styles.dimText}>{s.Phone1 ?? s.Phone ?? s.phone ?? '—'}</td>
                    <td className={styles.dimText}>{s.email ?? s.Email ?? '—'}</td>
                    <td><span className={styles.statusBadge} style={{ background: (s.Active === 1 || s.Active === true || (s.Status || s.status) === 'active') ? '#2eae6c18' : '#95959418', color: (s.Active === 1 || s.Active === true || (s.Status || s.status) === 'active') ? '#2eae6c' : '#959ac7' }}>{s.Active !== undefined ? (s.Active ? 'active' : 'inactive') : (s.Status || s.status || 'active')}</span></td>
                    <td className={styles.actions}>
                      <Link to={`/crm/suppliers/${id}`} className={styles.actionLink}>View</Link>
                      {canWrite && <Link to={`/crm/suppliers/${id}/edit`} className={styles.actionLink}>Edit</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total || suppliers.length} total suppliers</span>
      </div>
    </div>
  );
};
