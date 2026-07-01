import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remarksApi } from '../../api/documents';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import { downloadCsv } from '../../utils/export';
import styles from '../admin/UserList.module.css';

const REMARKS_EXPORT_COLUMNS = [
  { key: 'createdAt', label: 'Date/Time' },
  { key: 'transactionId', label: 'Transaction' },
  { key: 'remark', label: 'Remark' },
  { key: 'userName', label: 'User' },
  { key: 'updatedAt', label: 'Last Edited' },
];

function toRemarkExportRow(r: any) {
  return {
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
    transactionId: r.transactionId ?? r.TransactionId ?? '',
    remark: r.remark ?? r.Remark ?? '',
    userName: r.userName ?? r.UserId ?? '',
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '',
  };
}

export const AdditionalRemarksReport: React.FC = () => {
  const qc = useQueryClient();
  const { hasAnyRole, user } = useAuthStore();
  const canExport = hasAnyRole(['Administrator', 'Supervisor']);
  const canDelete = hasAnyRole(['Administrator', 'Supervisor']);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', userId: '', transactionId: '', page: 1 });
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['remarks-report', filters],
    queryFn: () => remarksApi.report(filters),
  });

  const remarks: any[] = (data?.data as any) || [];
  const total = (data?.meta as any)?.total || 0;

  const editMutation = useMutation({
    mutationFn: () => remarksApi.edit(editId!, editText),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['remarks-report'] }); setEditId(null); },
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Edit failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => remarksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remarks-report'] }),
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Delete failed.'),
  });

  return (
    <div data-testid="additional-remarks-report-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Additional Remarks Report</h1>
          <p className={styles.subtitle}>View and manage transaction remarks and audit history</p>
        </div>
        {canExport && <Button variant="ghost" data-testid="remarks-report-export-btn" onClick={() => downloadCsv('additional-remarks.csv', remarks.map(toRemarkExportRow), REMARKS_EXPORT_COLUMNS)}>Export</Button>}
      </div>

      {error && <div style={{ padding: '10px 14px', background: 'rgba(210,59,65,0.09)', border: '1px solid rgba(210,59,65,0.25)', color: 'var(--color-error)', borderRadius: 8, fontSize: 'var(--text-sm-size)' }} role="alert">{error}</div>}

      <div className={styles.filterBar}>
        <input type="date" className={styles.filterSelect} data-testid="remarks-report-filter-date-from"
          value={filters.fromDate} onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value, page: 1 }))} />
        <input type="date" className={styles.filterSelect} data-testid="remarks-report-filter-date-to"
          value={filters.toDate} onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value, page: 1 }))} />
        <input className={styles.filterSelect} placeholder="User ID" data-testid="remarks-report-filter-user"
          value={filters.userId} onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value, page: 1 }))} />
        <input className={styles.filterSelect} placeholder="Transaction ID" data-testid="remarks-report-filter-transaction"
          value={filters.transactionId} onChange={(e) => setFilters((f) => ({ ...f, transactionId: e.target.value, page: 1 }))} />
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton} data-testid="remarks-list-skeleton">{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : remarks.length === 0 ? (
          <div className={styles.emptyState}>No additional remarks found for selected criteria.</div>
        ) : (
          <table className={styles.table} data-testid="remarks-remark-table">
            <thead>
              <tr><th>Date/Time</th><th>Transaction</th><th>Remark</th><th>User</th><th>Last Edited</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {remarks.map((r: any) => (
                <React.Fragment key={r.id}>
                  <tr className={styles.row}>
                    <td className={styles.dimCell}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
                    <td className={styles.dimCell}>{r.transactionId || r.TransactionId || '—'}</td>
                    <td>{editId === r.id ? (
                      <textarea className={styles.filterSelect} value={editText} maxLength={500}
                        onChange={(e) => setEditText(e.target.value)} style={{ width: '100%' }} />
                    ) : (
                      <span>{r.remark || r.Remark || '—'}</span>
                    )}</td>
                    <td className={styles.dimCell}>{r.userName || r.UserId || '—'}</td>
                    <td className={styles.dimCell}>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      {editId === r.id ? (
                        <>
                          <Button variant="primary" onClick={() => editMutation.mutate()} loading={editMutation.isPending} style={{ fontSize: 11 }}>Save</Button>
                          <Button variant="ghost" onClick={() => setEditId(null)} style={{ fontSize: 11 }}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            data-testid={`remarks-edit-btn-${r.id}`}
                            onClick={() => { setEditId(r.id); setEditText(r.remark || r.Remark || ''); }}>Edit</button>
                          {canDelete && (
                            <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                              data-testid={`remarks-delete-btn-${r.id}`}
                              onClick={() => deleteMutation.mutate(r.id)}>Delete</button>
                          )}
                          <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            data-testid={`remarks-hist-link-${r.id}`}
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>History</button>
                        </>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.totalCount}>{total || remarks.length} total remarks</span>
      </div>
    </div>
  );
};
