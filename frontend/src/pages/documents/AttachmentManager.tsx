import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '../../api/documents';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/auth';
import styles from '../admin/UserList.module.css';
import docStyles from './Documents.module.css';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const MAX_SIZE_MB = 10;

export const AttachmentManager: React.FC = () => {
  const qc = useQueryClient();
  const { hasAnyRole, user } = useAuthStore();
  const canBulk = hasAnyRole(['Administrator', 'Supervisor']);
  const [filters, setFilters] = useState({ transactionId: '', docType: '', page: 1 });
  const [selected, setSelected] = useState<number[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['attachments', filters],
    queryFn: () => attachmentsApi.list(filters),
  });

  const attachments: any[] = (data?.data as any) || [];

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const results = [];
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) { setUploadError(`File type not allowed: ${file.name}`); continue; }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) { setUploadError(`File too large (max ${MAX_SIZE_MB}MB): ${file.name}`); continue; }
        results.push(attachmentsApi.upload({ fileName: file.name, fileType: file.type, transactionId: filters.transactionId || 0 }));
      }
      return Promise.all(results);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attachments'] }); setSuccess('Files uploaded.'); setUploadError(''); },
    onError: (err: any) => setUploadError(err?.response?.data?.error?.message || 'Upload failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => attachmentsApi.delete(id, true),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attachments'] }); setSuccess('Attachment deleted.'); },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => attachmentsApi.bulkDelete(selected, true),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attachments'] }); setSelected([]); setSuccess('Attachments deleted.'); },
  });

  const toggleSelect = (id: number) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div data-testid="attachments-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Attachments</h1>
          <p className={styles.subtitle}>Manage file attachments linked to transactions</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => fileRef.current?.click()} data-testid="attachments-upload-btn">Upload Files</Button>
          <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            data-testid="attachments-upload-input" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files) uploadMutation.mutate(e.target.files); }} />
        </div>
      </div>

      {success && <div style={{ padding: '10px 14px', background: 'rgba(46,174,108,0.09)', border: '1px solid rgba(46,174,108,0.3)', color: 'var(--color-success)', borderRadius: 8, fontSize: 'var(--text-sm-size)' }}>{success}</div>}
      {uploadError && <div style={{ padding: '10px 14px', background: 'rgba(210,59,65,0.09)', border: '1px solid rgba(210,59,65,0.25)', color: 'var(--color-error)', borderRadius: 8, fontSize: 'var(--text-sm-size)' }} role="alert">{uploadError}</div>}

      <div className={styles.filterBar}>
        <input className={styles.searchInput} style={{ flex: 1 }} placeholder="Filter by transaction ID..."
          data-testid="attachments-transaction-filter" value={filters.transactionId}
          onChange={(e) => setFilters((f) => ({ ...f, transactionId: e.target.value, page: 1 }))} />
        <input className={styles.filterSelect} placeholder="File type..." data-testid="attachments-type-filter"
          value={filters.docType} onChange={(e) => setFilters((f) => ({ ...f, docType: e.target.value, page: 1 }))} />
      </div>

      {selected.length > 0 && canBulk && (
        <div className={styles.bulkBar}>
          <span>{selected.length} selected</span>
          <Button variant="danger" loading={bulkDeleteMutation.isPending}
            onClick={() => { if (window.confirm('Delete selected attachments?')) bulkDeleteMutation.mutate(); }}
            data-testid="attachments-bulk-delete-btn">Delete Selected</Button>
          <Button variant="ghost" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.skeleton}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}</div>
        ) : error ? (
          <div className={styles.errorState} role="alert">Failed to load attachments.</div>
        ) : attachments.length === 0 ? (
          <div className={styles.emptyState}>No attachments uploaded yet.</div>
        ) : (
          <table className={styles.table} data-testid="attachments-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={(e) => e.target.checked ? setSelected(attachments.map((a) => a.id)) : setSelected([])} /></th>
                <th>File Name</th>
                <th>Type</th>
                <th>Linked To</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((a: any) => (
                <tr key={a.id} className={styles.row}>
                  <td><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                  <td className={styles.userName}>{a.fileName || a.FileName}</td>
                  <td className={styles.dimCell}>{a.fileType || a.FileType || '—'}</td>
                  <td className={styles.dimCell}>{a.transactionId || a.TransactionId || '—'}</td>
                  <td className={styles.dimCell}>{a.uploadedBy || a.UploadedBy || '—'}</td>
                  <td className={styles.dimCell}>{a.uploadDate ? new Date(a.uploadDate).toLocaleDateString() : '—'}</td>
                  <td className={styles.dimCell}>v{a.version || 1}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      data-testid={`attachments-preview-btn-${a.id}`}
                      onClick={() => setPreviewUrl(a.filePath || '')}>Preview</button>
                    <button className={styles.actionLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                      onClick={() => { if (window.confirm('Delete this attachment?')) deleteMutation.mutate(a.id); }}
                      data-testid={`attachment-delete-btn-${a.id}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
