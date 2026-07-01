import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingApi } from '../../api/banking';
import s from './Banking.module.css';

export default function BankReconciliation() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ accountId: '', fromDate: '', toDate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts-recon'],
    queryFn: () => bankingApi.bankAccountsForRecon(),
  });

  const { data: reconData, isLoading, refetch } = useQuery({
    queryKey: ['bank-reconciliation', filters],
    queryFn: () => bankingApi.reconDetails(filters),
    enabled: false,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['recon-attachments', (reconData as any)?.reconId],
    queryFn: () => bankingApi.reconAttachments((reconData as any)?.reconId),
    enabled: !!(reconData as any)?.reconId,
  });

  const importMut = useMutation({
    mutationFn: (data: any) => bankingApi.importStatement(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bank-reconciliation'] }),
    onError: (err: any) => setErrors({ file: err?.response?.data?.error?.message ?? 'Import failed' }),
  });

  const saveMut = useMutation({
    mutationFn: (data: any) => bankingApi.saveRecon(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bank-reconciliation'] }); alert('Reconciliation saved.'); },
  });

  const uploadMut = useMutation({
    mutationFn: (data: any) => bankingApi.uploadAttachment((reconData as any)?.reconId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recon-attachments'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => bankingApi.deleteAttachment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recon-attachments'] }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!filters.accountId) e.accountId = 'Account is required';
    if (!filters.fromDate || !filters.toDate) e.date = 'Date range is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const internal = (reconData as any)?.internal ?? [];
  const statement = (reconData as any)?.statement ?? [];
  const exceptions = (reconData as any)?.exceptions ?? [];

  return (
    <div data-testid="recon-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Bank Reconciliation</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} data-testid="recon-submit-btn" onClick={() => { if (validate()) refetch(); }} disabled={isLoading}>Load</button>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="recon-filter-account" value={filters.accountId} onChange={(e) => setFilters((p) => ({ ...p, accountId: e.target.value }))} style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minWidth: '220px' }}>
            <option value="">Bank Account *</option>
            {(bankAccounts as any[]).map((a: any) => (
              <option key={a.ID} value={String(a.ID)}>{a.HEAD} {a.CODES ? `(${a.CODES})` : ''}</option>
            ))}
          </select>
          <input type="date" data-testid="recon-filter-daterange" value={filters.fromDate} onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))} />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))} />
        </div>
        {errors.accountId && <div className={s.fieldError}>{errors.accountId}</div>}
        {errors.date && <div className={s.fieldError}>{errors.date}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <label className={`${s.btn} ${s.btnSecondary}`} style={{ cursor: 'pointer' }} data-testid="recon-upload-btn">
            Upload Statement <input type="file" style={{ display: 'none' }} accept=".csv,.xls,.xlsx,.ofx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="recon-import-btn" disabled={!file || importMut.isPending} onClick={() => file && importMut.mutate({ accountId: filters.accountId, fileData: file.name })}>
            Import
          </button>
          {errors.file && <div className={s.fieldError}>{errors.file}</div>}
        </div>

        {isLoading ? <div className={s.skeleton} style={{ height: '180px' }} /> : (
          <div className={s.reconGrid}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Internal Transactions</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.table}>
                  <thead><tr><th>Date</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {internal.map((r: any, i: number) => <tr key={i} data-testid={`recon-internal-table-row-${i}`}><td>{r.date}</td><td>{r.reference}</td><td>{r.amount}</td><td>{r.status}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bank Statement</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.table}>
                  <thead><tr><th>Date</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {statement.map((r: any, i: number) => <tr key={i} data-testid={`recon-statement-table-row-${i}`}><td>{r.date}</td><td>{r.reference}</td><td>{r.amount}</td><td>{r.status}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {exceptions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div className={`${s.alert}`}>Exceptions — {exceptions.length} unresolved entries</div>
            <table className={s.table}>
              <thead><tr><th>Reference</th><th>Amount</th><th>Reason</th></tr></thead>
              <tbody>{exceptions.map((r: any, i: number) => <tr key={i} data-testid={`recon-exception-row-${i}`}><td>{r.reference}</td><td>{r.amount}</td><td>{r.reason}</td></tr>)}</tbody>
            </table>
          </div>
        )}

        {(reconData as any)?.reconId && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Attachments</h3>
            <label className={`${s.btn} ${s.btnSecondary}`} style={{ cursor: 'pointer', display: 'inline-flex' }} data-testid="recon-attachment-upload-btn">
              + Upload <input type="file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMut.mutate({ fileName: f.name }); }} />
            </label>
            <table className={s.table} style={{ marginTop: '0.5rem' }}>
              <thead><tr><th>File</th><th>Uploaded By</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {(attachments as any[]).map((a: any, i: number) => (
                  <tr key={i} data-testid={`recon-attachment-list-row-${i}`}>
                    <td>{a.fileName}</td><td>{a.uploadedBy}</td><td>{a.uploadedAt}</td>
                    <td><button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(a.id); }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(reconData as any)?.reconId && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${s.btn} ${s.btnSuccess}`} onClick={() => saveMut.mutate({ reconId: (reconData as any).reconId, matches: [] })} disabled={saveMut.isPending}>Save Reconciliation</button>
          </div>
        )}
      </div>
    </div>
  );
}
