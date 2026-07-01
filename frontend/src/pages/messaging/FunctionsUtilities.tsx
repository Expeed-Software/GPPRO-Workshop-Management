import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { utilApi } from '../../api/messaging';
import s from './Messaging.module.css';

const TOOLS = [
  { name: 'BulkMergeCleanup', label: 'Bulk Merge Cleanup', desc: 'Remove duplicate/merged records from staging tables.' },
  { name: 'RebuildIndexes', label: 'Rebuild Indexes', desc: 'Rebuild fragmented DB indexes for performance.' },
  { name: 'RefreshSummaryTables', label: 'Refresh Summary Tables', desc: 'Recalculate aggregated summary data.' },
  { name: 'ArchiveOldLogs', label: 'Archive Old Logs', desc: 'Move audit logs older than 1 year to archive.' },
  { name: 'ReconcileBalances', label: 'Reconcile Balances', desc: 'Verify and reconcile account balances.' },
];

export default function FunctionsUtilities() {
  const [results, setResults] = useState<Record<string, any>>({});
  const runMut = useMutation({ mutationFn: (name: string) => utilApi.runFunction(name), onSuccess: (data: any, name: string) => setResults((r) => ({ ...r, [name]: data ?? 'Done' })) });

  return (
    <div data-testid="functions-utilities-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Functions &amp; Utilities</h1></div>
      <div className={s.tileGrid}>
        {TOOLS.map((t) => (
          <div key={t.name} className={s.tile} data-testid={`functions-toolcard-${t.name}`}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e1b4b', marginBottom: '0.3rem' }}>{t.label}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>{t.desc}</div>
            {results[t.name] && <div style={{ fontSize: '0.75rem', color: '#15803d', marginBottom: '0.5rem' }}>✓ {typeof results[t.name] === 'string' ? results[t.name] : JSON.stringify(results[t.name])}</div>}
            <button
              className={`${s.btn} ${s.btnPrimary}`}
              style={{ fontSize: '0.78rem', width: '100%' }}
              data-testid="functions-tool-run-btn"
              disabled={runMut.isPending}
              onClick={() => runMut.mutate(t.name)}
            >
              {runMut.isPending ? 'Running...' : 'Run'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
