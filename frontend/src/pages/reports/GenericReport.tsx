import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import s from './Reports.module.css';

export interface Col { key: string; label: string; format?: 'currency' | 'date'; }

interface Props {
  title: string;
  queryKey: string;
  fetchFn: (p: any) => Promise<any>;
  testidPrefix: string;
  filters?: { key: string; label: string; type?: 'date' | 'text' | 'select'; options?: string[] }[];
  columns: Col[];
  totals?: string[];
  adminOnly?: boolean;
}

export default function GenericReport({ title, queryKey, fetchFn, testidPrefix, filters = [], columns, totals = [] }: Props) {
  const [params, setParams] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetchFn(params),
    enabled: false,
  });

  const totalsMap: Record<string, number> = {};
  totals.forEach((k) => { totalsMap[k] = (rows as any[]).reduce((s, r) => s + Number(r[k] ?? 0), 0); });

  return (
    <div data-testid={`${testidPrefix}-page`} className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-print-btn`} onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid={`${testidPrefix}-export-btn`}>Export</button>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          {filters.map((f) => f.type === 'select' ? (
            <select key={f.key} value={params[f.key] ?? ''} onChange={(e) => setParams((p) => ({ ...p, [f.key]: e.target.value }))}>
              <option value="">{f.label}</option>
              {f.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input key={f.key} type={f.type ?? 'text'} placeholder={f.label} value={params[f.key] ?? ''} onChange={(e) => setParams((p) => ({ ...p, [f.key]: e.target.value }))} />
          ))}
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid={`${testidPrefix}-generate-btn`} onClick={() => refetch()}>Generate</button>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (rows as any[]).length === 0 ? (
          <div className={s.empty}>No data. Apply filters and click Generate.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid={`${testidPrefix}-table`}>
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {(rows as any[]).map((r: any, i: number) => (
                  <tr key={i} data-testid={`${testidPrefix}-row-${i}`}>
                    {columns.map((c) => (
                      <td key={c.key}>{c.format === 'currency' ? Number(r[c.key] ?? 0).toFixed(2) : r[c.key] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {totals.length > 0 && (
                <tfoot>
                  <tr>
                    {columns.map((c, i) => <td key={c.key}>{i === 0 ? <strong>Total</strong> : totals.includes(c.key) ? <strong>{totalsMap[c.key].toFixed(2)}</strong> : null}</td>)}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
