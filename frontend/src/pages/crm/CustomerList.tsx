import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import { normList } from '../../api/client';
import { downloadCsv } from '../../utils/export';
import styles from './CrmList.module.css';

const CUSTOMER_EXPORT_COLUMNS = [
  { key: 'CustName', label: 'Customer' },
  { key: 'Phone1', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'Address1', label: 'Address' },
];

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['Administrator', 'Supervisor']);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [selected, setSelected] = useState<number[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.overview(filters),
  });

  const customers: any[] = (data?.data as any) || [];
  const total = (data?.meta as any)?.total || 0;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => customersApi.setStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setActionMsg('Status updated.'); },
  });

  const toggleSelect = (id: number) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const selectAll = () => setSelected(customers.map((c) => c.CustId || c.id));
  const clearSelect = () => setSelected([]);

  const handleExport = async () => {
    const res = await customersApi.export(filters);
    const { data: exportRows } = normList(res);
    downloadCsv('customers.csv', exportRows, CUSTOMER_EXPORT_COLUMNS);
  };

  return (
    <div data-testid="customer-management-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>Manage customer accounts, contacts, and vehicles</p>
        </div>
        {canWrite && (
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={() => navigate('/crm/customers/merge-duplicates')} data-testid="customer-merge-button">Merge Duplicates</Button>
            <Button onClick={() => navigate('/crm/customers/new')} data-testid="customer-new-button">+ New Customer</Button>
          </div>
        )}
      </div>

      {actionMsg && <div className={styles.successBanner} role="status">{actionMsg}</div>}

      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, phone, email..."
          data-testid="customer-management-name-input"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
        />
        <select className={styles.filterSelect} data-testid="customer-status-filter"
          value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {canWrite && (
          <>
            <Button variant="ghost" onClick={handleExport} data-testid="customer-export-button">Export</Button>
          </>
        )}
      </div>

      {selected.length > 0 && (
        <div className={styles.bulkBar}>
          <span>{selected.length} selected</span>
          <Button variant="ghost" onClick={clearSelect}>Clear</Button>
          <Button variant="danger" onClick={() => { selected.forEach((id) => statusMutation.mutate({ id, status: 'inactive' })); clearSelect(); }}>Deactivate</Button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load customers.</div>
        ) : customers.length === 0 ? (
          <div className={styles.emptyState}>No customers found. Add your first customer.</div>
        ) : (
          <table className={styles.table} data-testid="customer-list-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : clearSelect()} /></th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => {
                const id = c.CustId || c.id;
                return (
                  <tr key={id} className={styles.row}>
                    <td><input type="checkbox" checked={selected.includes(id)} onChange={() => toggleSelect(id)} /></td>
                    <td className={styles.nameCell}>
                      <div className={styles.avatar}>{(c.CustName || c.name || 'C').charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.primaryText}>{c.CustName || c.name}</div>
                        <div className={styles.dimText}>{c.Address1 ?? ''}</div>
                      </div>
                    </td>
                    <td className={styles.dimText}>{c.Phone1 ?? '—'}</td>
                    <td className={styles.dimText}>{c.email ?? '—'}</td>
                    <td>{(c.Tags || []).map((t: string) => <span key={t} className={styles.tag}>{t}</span>)}</td>
                    <td>
                      <span className={styles.statusBadge} style={{ background: (c.Active === 1 || c.Active === true) ? '#2eae6c18' : '#95959418', color: (c.Active === 1 || c.Active === true) ? '#2eae6c' : '#959ac7' }}>
                        {c.Active !== undefined ? (c.Active ? 'active' : 'inactive') : 'active'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <Link to={`/crm/customers/${id}`} className={styles.actionLink}>View</Link>
                      {canWrite && <Link to={`/crm/customers/${id}/edit`} className={styles.actionLink}>Edit</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total || customers.length} total customers</span>
        <Button variant="ghost" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</Button>
        <span className={styles.pageNum}>Page {filters.page}</span>
        <Button variant="ghost" disabled={customers.length < 20} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</Button>
      </div>
    </div>
  );
};
