import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../../api/documents';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import styles from '../admin/UserList.module.css';
import docStyles from './Documents.module.css';

export const DocumentHeadManagement: React.FC = () => {
  const qc = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['Administrator', 'Supervisor']);
  const isAdmin = hasAnyRole(['Administrator']);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category: '', status: 'active', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['document-heads'],
    queryFn: () => documentsApi.listHeads({}),
  });

  const heads: any[] = (data?.data as any) || [];

  const saveMutation = useMutation({
    mutationFn: (d: any) => editItem ? documentsApi.editHead(editItem.id, d) : documentsApi.createHead(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-heads'] });
      setShowModal(false); setEditItem(null); setSuccess('Saved successfully.');
    },
    onError: (err: any) => setError(err?.response?.data?.error?.message || 'Operation failed.'),
  });

  const openAdd = () => { setEditItem(null); setForm({ name: '', category: '', status: 'active', description: '' }); setShowModal(true); setError(''); };
  const openEdit = (h: any) => { setEditItem(h); setForm({ name: h.name || h.Name, category: h.category || h.Category || '', status: h.status || h.Status || 'active', description: h.description || h.Description || '' }); setShowModal(true); setError(''); };

  return (
    <div data-testid="dochead-management-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Document Head Management</h1>
          <p className={styles.subtitle}>Manage document headers and categories</p>
        </div>
        {isAdmin && <Button onClick={openAdd} data-testid="dochead-add-btn">+ Add Header</Button>}
      </div>

      {!canWrite && (
        <div className={docStyles.errorBanner} data-testid="dochead-perm-error-banner" role="alert">
          You do not have permission to manage document heads.
        </div>
      )}

      {success && <div className={docStyles.successBanner} role="status">{success}</div>}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : heads.length === 0 ? (
          <div className={styles.emptyState}>No document heads configured.</div>
        ) : (
          <table className={styles.table} data-testid="dochead-table">
            <thead><tr><th>Header Name</th><th>Category</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {heads.map((h: any) => (
                <tr key={h.id} className={styles.row}>
                  <td className={styles.userName}>{h.name || h.Name}</td>
                  <td>{h.category || h.Category || '—'}</td>
                  <td><span className={styles.statusBadge} style={{ background: (h.status || h.Status) === 'active' ? '#2eae6c18' : '#95959418', color: (h.status || h.Status) === 'active' ? '#2eae6c' : '#959ac7' }}>{h.status || h.Status}</span></td>
                  <td className={styles.dimCell}>{h.description || h.Description || '—'}</td>
                  <td>{canWrite && <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => openEdit(h)}>Edit</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="dialog">
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', backdropFilter: 'blur(16px)', minWidth: 360, maxWidth: 480, boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: 'var(--text-body-size)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>{editItem ? 'Edit' : 'Add'} Document Header</h2>
            {error && <div className={docStyles.errorBanner} role="alert">{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className={docStyles.fieldGroup}>
                <label className={docStyles.fieldLabel}>Header Name *</label>
                <input className={docStyles.select} data-testid="dochead-name-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={docStyles.fieldGroup}>
                <label className={docStyles.fieldLabel}>Category</label>
                <input className={docStyles.select} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
              <div className={docStyles.fieldGroup}>
                <label className={docStyles.fieldLabel}>Status</label>
                <select className={docStyles.select} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={docStyles.fieldGroup}>
                <label className={docStyles.fieldLabel}>Description</label>
                <textarea className={docStyles.select} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button loading={saveMutation.isPending} onClick={() => { if (!form.name) { setError('Name is required.'); return; } saveMutation.mutate(form); }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
