import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import s from './Admin.module.css';

type LogType = 'account-mod' | 'change-log' | 'duplicate-removal' | 'user-action';

interface Props { logType: LogType; title: string; testidPrefix: string; adminOnly?: boolean; }

const FETCH_MAP: Record<LogType, (p: any) => Promise<any>> = {
  'account-mod': adminApi.accountModLog,
  'change-log': adminApi.changeLog,
  'duplicate-removal': adminApi.duplicateRemovalLog,
  'user-action': adminApi.userActionLog,
};

const EXPORT_MAP: Record<LogType, (p: any) => Promise<any>> = {
  'account-mod': adminApi.exportAccountModLog,
  'change-log': adminApi.exportChangeLog,
  'duplicate-removal': adminApi.exportDuplicateRemovalLog,
  'user-action': adminApi.exportUserActionLog,
};

export default function AuditLogViewer({ logType, title, testidPrefix, adminOnly = false }: Props) {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', user: '', action: '', entity: '' });
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({ queryKey: [logType, filters], queryFn: () => FETCH_MAP[logType](filters) });

  const annotate = useMutation({
    mutationFn: (d: any) => logType === 'duplicate-removal' ? adminApi.addDuplicateNote(d) : adminApi.annotateUserAction(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: [logType] }),
  });

  const restore = useMutation({
    mutationFn: (d: any) => adminApi.restoreDuplicate(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: [logType] }),
  });

  const set = (k: string) => (e: any) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export`} onClick={() => EXPORT_MAP[logType](filters)}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        {isLoading && <div className={s.skeleton} style={{ height: '8px', marginBottom: '0.5rem' }} />}
        <div className={s.filterBar}>
          <input type="date" value={filters.fromDate} onChange={set('fromDate')} />
          <input type="date" value={filters.toDate} onChange={set('toDate')} />
          <input placeholder="User" value={filters.user} onChange={set('user')} />
          <input placeholder="Action" value={filters.action} onChange={set('action')} />
          {(logType === 'change-log' || logType === 'duplicate-removal') && <input placeholder="Entity" value={filters.entity} onChange={set('entity')} />}
        </div>
        {(rows as any[]).length === 0 ? (
          <div className={s.empty} data-testid={`${testidPrefix}-empty-state`}>No log entries found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead>
                <tr>
                  <th>Date/Time</th><th>User</th>
                  {logType === 'account-mod' && <><th>Account</th><th>Action</th><th>Changed Fields</th><th>Old Value</th><th>New Value</th></>}
                  {logType === 'change-log' && <><th>Entity</th><th>Reference</th><th>Action</th><th>Summary</th></>}
                  {logType === 'duplicate-removal' && <><th>Entity Type</th><th>Source</th><th>Target</th><th>Action</th><th>Notes</th><th></th></>}
                  {logType === 'user-action' && <><th>Action</th><th>Entity</th><th>Details</th><th>Status</th><th>Annotation</th></>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <React.Fragment key={i}>
                    <tr data-testid={`${testidPrefix}-table-row-${r.id ?? i}`}>
                      <td>{r.LogDate ?? r.createdAt ?? r.date}</td>
                      <td>{logType === 'account-mod' ? (r.ChangedBy ?? r.user ?? r.userId ?? '—') : (r.UserName ?? r.user ?? r.userId ?? '—')}</td>
                      {logType === 'account-mod' && <><td>{r.HEAD ?? r.account ?? r.entityId ?? '—'}</td><td><span className={`${s.badge} ${s.badgeBlue}`}>{r.Action ?? r.action}</span></td><td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{'—'}</td><td><span className={s.diffOld}>{r.OldValue ?? r.before ?? '—'}</span></td><td><span className={s.diffNew}>{r.NewValue ?? r.after ?? '—'}</span></td></>}
                      {logType === 'change-log' && <><td>{'—'}</td><td>{'—'}</td><td><span className={`${s.badge} ${s.badgeBlue}`}>{r.Action ?? r.action}</span></td><td style={{ maxWidth: '200px' }}>{'—'}</td></>}
                      {logType === 'duplicate-removal' && <><td>{r.entityType}</td><td>{r.sourceRecord}</td><td>{r.targetRecord}</td><td>{r.action}</td><td>{r.notes ?? '—'}</td><td>{adminOnly && <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.7rem' }} data-testid={`duprmlog-undo-${r.id}`} onClick={() => restore.mutate({ mergeId: r.id, reason: 'Admin undo' })}>Undo</button>}</td></>}
                      {logType === 'user-action' && <><td><span className={`${s.badge} ${s.badgeBlue}`}>{r.Action ?? r.action}</span></td><td>{'—'}</td><td style={{ maxWidth: '160px' }}>{r.Details ?? r.details ?? '—'}</td><td>{r.status}</td><td>{'—'}</td></>}
                      <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3831c4', fontSize: '0.75rem' }} data-testid={`${testidPrefix}-table-expand-${r.id ?? i}`} onClick={() => setExpanded(expanded === String(r.id ?? i) ? null : String(r.id ?? i))}>▼</button></td>
                    </tr>
                    {expanded === String(r.id ?? i) && (
                      <tr><td colSpan={10}><div className={s.expandRow}><pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(r, null, 2)}</pre></div></td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export const AccountModificationLogPage = () => <AuditLogViewer logType="account-mod" title="Account Modification Log" testidPrefix="accountmodlog" />;
export const ChangeLogViewerPage = () => <AuditLogViewer logType="change-log" title="Edit Change Log Viewer" testidPrefix="changelogviewer" />;
export const DuplicateRemovalLogPage = () => <AuditLogViewer logType="duplicate-removal" title="Duplicate Record Removal Audit" testidPrefix="duprmlog" adminOnly />;
export const UserActionLogPage = () => <AuditLogViewer logType="user-action" title="User Action Log Report" testidPrefix="useractionlog" />;
