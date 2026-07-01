import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dmsApi } from '../../api/messaging';
import s from './Messaging.module.css';

type Tab = 'documents' | 'linked-entities' | 'bulk-actions';

export default function DMSModule() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('documents');
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const { data: docs = [], isLoading } = useQuery({ queryKey: ['dms-documents', filter], queryFn: () => dmsApi.list({ search: filter }) });
  const deleteMut = useMutation({ mutationFn: (id: string) => dmsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['dms-documents'] }) });

  const toggleSelect = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div data-testid="dms-module-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Document Management System</h1></div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className={`${s.btn} ${tab === 'documents' ? s.btnPrimary : s.btnSecondary}`} data-testid="dms-documents-tab" onClick={() => setTab('documents')}>Documents</button>
        <button className={`${s.btn} ${tab === 'linked-entities' ? s.btnPrimary : s.btnSecondary}`} data-testid="dms-linked-entities-tab" onClick={() => setTab('linked-entities')}>Linked Entities</button>
        <button className={`${s.btn} ${tab === 'bulk-actions' ? s.btnPrimary : s.btnSecondary}`} data-testid="dms-bulk-actions-tab" onClick={() => setTab('bulk-actions')}>Bulk Actions</button>
      </div>

      {tab === 'documents' && (
        <div className={s.card}>
          <div className={s.filterBar}>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search documents..." />
          </div>
          {isLoading ? <div className={s.skeleton} style={{ height: '80px' }} /> : (docs as any[]).length === 0 ? (
            <div className={s.empty}>No documents found.</div>
          ) : (
            <table className={s.table} data-testid="dms-documents-table">
              <thead><tr><th>Select</th><th>Name</th><th>Linked To</th><th>Type</th><th>Uploaded</th><th>Actions</th></tr></thead>
              <tbody>
                {(docs as any[]).map((d: any, i: number) => (
                  <tr key={i} data-testid={`dms-doc-row-${d.ID ?? i}`}>
                    <td><input type="checkbox" checked={selected.includes(String(d.ID))} onChange={() => toggleSelect(String(d.ID))} /></td>
                    <td>{d.Remarks}</td><td>{d.Codes ?? '—'}</td><td>{d.Type}</td><td>{d.Path}</td>
                    <td>
                      <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} onClick={() => deleteMut.mutate(String(d.ID))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'linked-entities' && (
        <div className={s.card}>
          <div className={s.empty}>Select a document from the Documents tab to view linked entities.</div>
        </div>
      )}

      {tab === 'bulk-actions' && (
        <div className={s.card}>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
            {selected.length === 0 ? 'No documents selected. Go to Documents tab and select items.' : `${selected.length} document(s) selected.`}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`${s.btn} ${s.btnDanger}`}
              disabled={selected.length === 0}
              onClick={() => { selected.forEach((id) => deleteMut.mutate(id)); setSelected([]); }}
            >
              Delete Selected ({selected.length})
            </button>
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setSelected([])}>Clear Selection</button>
          </div>
        </div>
      )}
    </div>
  );
}
