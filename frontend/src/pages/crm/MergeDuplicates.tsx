import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, suppliersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import styles from './CrmList.module.css';

type EntityType = 'customer' | 'supplier';

export const MergeDuplicates: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const entityType: EntityType = location.pathname.includes('supplier') ? 'supplier' : 'customer';
  const api = entityType === 'customer' ? customersApi : suppliersApi;

  const [masterId, setMasterId] = useState<number | null>(null);
  const [dupIds, setDupIds] = useState<number[]>([]);
  const [fieldMap, setFieldMap] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [entityType + 's-merge'],
    queryFn: () => api.list({ page: 1, limit: 50 }),
  });

  const records: any[] = (data?.data as any) || [];

  const mergeMutation = useMutation({
    mutationFn: () => {
      if (!masterId || !dupIds.length) throw new Error('Select master and at least one duplicate.');
      return api.merge(masterId, dupIds, fieldMap);
    },
    onSuccess: () => {
      setSuccess('Records merged successfully.');
      setError('');
      qc.invalidateQueries({ queryKey: [entityType + 's'] });
    },
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Merge failed.'),
  });

  const toggleDup = (id: number) => setDupIds((d) => d.includes(id) ? d.filter((x) => x !== id) : [...d, id]);
  const getName = (c: any) => c.CustName || c.SupplierName || c.name || 'Unknown';
  const getId = (c: any) => c.CustId || c.SuppId || c.id;

  return (
    <div data-testid={`${entityType}-merge-duplicates-page`} className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Merge Duplicate {entityType === 'customer' ? 'Customers' : 'Suppliers'}</h1>
          <p className={styles.subtitle}>Select the master record and mark duplicates to merge</p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      </div>

      {success && <div className={styles.successBanner} role="status">{success}</div>}
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      {isLoading ? (
        <div className={styles.skeleton}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Master</th>
                <th>Duplicate</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => {
                const rid = getId(r);
                const isMaster = masterId === rid;
                const isDup = dupIds.includes(rid);
                return (
                  <tr key={rid} className={styles.row} style={{ background: isMaster ? 'rgba(56,49,196,0.06)' : isDup ? 'rgba(210,59,65,0.04)' : undefined }}>
                    <td>
                      <input type="radio" name="master" value={rid}
                        checked={isMaster}
                        onChange={() => { setMasterId(rid); setDupIds((d) => d.filter((x) => x !== rid)); }}
                        data-testid={`master-radio-${rid}`}
                      />
                    </td>
                    <td>
                      <input type="checkbox"
                        checked={isDup}
                        disabled={isMaster}
                        onChange={() => toggleDup(rid)}
                        data-testid={`dup-check-${rid}`}
                      />
                    </td>
                    <td className={styles.primaryText}>{getName(r)}</td>
                    <td className={styles.dimText}>{r.Phone || r.phone || '—'}</td>
                    <td className={styles.dimText}>{r.Email || r.email || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        <Button
          onClick={() => mergeMutation.mutate()}
          loading={mergeMutation.isPending}
          disabled={!masterId || dupIds.length === 0}
          data-testid="merge-confirm-button"
        >
          Merge Selected
        </Button>
      </div>
    </div>
  );
};
