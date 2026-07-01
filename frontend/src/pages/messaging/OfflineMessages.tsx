import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mailApi } from '../../api/messaging';
import s from './Messaging.module.css';

export default function OfflineMessages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);

  const { data: _msgRes, isLoading } = useQuery({ queryKey: ['offline-messages'], queryFn: () => mailApi.list({ mode: 'offline' }) });
  const messages: any[] = (_msgRes as any)?.data ?? [];
  const markRead = useMutation({ mutationFn: (id: string) => mailApi.markRead(id, { read: true }), onSuccess: () => qc.invalidateQueries({ queryKey: ['offline-messages'] }) });
  const deleteMut = useMutation({ mutationFn: mailApi.delete, onSuccess: () => { setSelected(null); qc.invalidateQueries({ queryKey: ['offline-messages'] }); } });

  return (
    <div data-testid="offline-messages-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Offline Messages</h1>
        <button className={`${s.btn} ${s.btnSecondary}`} data-testid="offline-msg-refresh-btn" onClick={() => qc.invalidateQueries({ queryKey: ['offline-messages'] })}>Refresh</button>
      </div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (messages as any[]).length === 0 ? (
          <div className={s.empty}>No offline messages.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="offline-msg-table">
              <thead><tr><th>From</th><th>Subject</th><th>Linked Entity</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(messages as any[]).map((m: any, i: number) => (
                  <tr key={i} data-testid={`offline-msg-row-${m.ID ?? i}`}>
                    <td>{m.SendBy}</td><td>{m.Subject}</td><td>{m.linkedEntity ?? '—'}</td><td>{m.Date}</td>
                    <td><span className={`${s.badge} ${m.Read ? s.badgeGreen : s.badgeYellow}`}>{m.Read ? 'Read' : 'Unread'}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid="offline-msg-view-btn" onClick={() => setSelected(m)}>View</button>
                      <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid="offline-msg-flag-btn" onClick={() => markRead.mutate(String(m.ID))}>Mark Read</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selected && (
          <div data-testid="offline-msg-details-panel" className={s.card} style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{selected.Subject}</strong>
              <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} onClick={() => deleteMut.mutate(String(selected.ID))}>Delete</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>From: {selected.SendBy} | {selected.Date}</div>
            <div style={{ fontSize: '0.875rem' }}>{selected.Msg}</div>
          </div>
        )}
      </div>
    </div>
  );
}
