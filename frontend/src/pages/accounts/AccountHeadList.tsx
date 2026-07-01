import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import { useAuthStore } from '../../store/authStore';
import { downloadCsv } from '../../utils/export';
import s from './Accounts.module.css';

const ACCOUNT_HEAD_COLUMNS = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'parent', label: 'Parent' },
  { key: 'type', label: 'Type' },
  { key: 'group', label: 'Group' },
  { key: 'status', label: 'Status' },
];

function toAccountHeadExportRow(h: any) {
  return {
    code: h.CODES ?? h.code,
    name: h.HEAD ?? h.name,
    parent: h.HEADUNDER ?? h.parent ?? '',
    type: h.CORD ?? h.type,
    group: h.Group ?? h.group ?? '',
    status: (h.LOCKED || h.Freeze || h.lock) ? 'Locked' : 'Active',
  };
}

export default function AccountHeadList() {
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const isAdmin = user?.roles?.includes('Administrator');
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ search: '', type: '', group: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', name: '', type: '', group: '', parent: '', description: '', status: 'Active' });
  const [formError, setFormError] = useState('');

  const { data: heads = [], isLoading } = useQuery({
    queryKey: ['account-heads', filters],
    queryFn: () => accountsApi.listHeads(filters),
  });

  const saveMut = useMutation({
    mutationFn: (data: any) => editCode ? accountsApi.updateHead(editCode, data) : accountsApi.createHead(data),
    onSuccess: () => { setShowModal(false); qc.invalidateQueries({ queryKey: ['account-heads'] }); },
    onError: (err: any) => setFormError(err?.response?.data?.error?.message ?? 'Save failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (code: string) => accountsApi.deleteHead(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['account-heads'] }),
  });

  const openAdd = () => { setEditCode(null); setForm({ code: '', name: '', type: '', group: '', parent: '', description: '', status: 'Active' }); setFormError(''); setShowModal(true); };
  const openEdit = (h: any) => { const code = h.CODES ?? h.code; setEditCode(code); setForm({ code, name: h.HEAD ?? h.name, type: h.CORD ?? h.type, group: h.Group ?? h.group ?? '', parent: h.HEADUNDER ?? h.parent ?? '', description: h.DESCRIPTION ?? h.description ?? '', status: h.LOCKED ? 'Locked' : 'Active' }); setFormError(''); setShowModal(true); };

  return (
    <div data-testid="acheadlist-report-root" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Account Heads</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="acheadlist-print-btn" onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="acheadlist-export-btn" onClick={() => downloadCsv('account-heads.csv', (heads as any[]).map(toAccountHeadExportRow), ACCOUNT_HEAD_COLUMNS)}>Export</button>
          {isSupervisorOrAdmin && <button className={`${s.btn} ${s.btnPrimary}`} onClick={openAdd}>+ Add</button>}
        </div>
      </div>
      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search code/name..." value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {isLoading ? <div className={s.skeleton} style={{ height: '120px' }} /> : (heads as any[]).length === 0 ? (
          <div className={s.empty}>No account heads found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="acheadlist-table">
              <thead><tr><th>Code</th><th>Name</th><th>Parent</th><th>Type</th><th>Group</th><th>Status</th>{isSupervisorOrAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {(heads as any[]).map((h: any, i: number) => {
                  const code = h.CODES ?? h.code;
                  const locked = h.LOCKED || h.Freeze || h.lock;
                  return (
                  <tr key={code ?? i} data-testid={`acheadlist-row-${code}`}>
                    <td>{code}</td><td>{h.HEAD ?? h.name}</td><td>{h.HEADUNDER ?? h.parent ?? '—'}</td><td>{h.CORD ?? h.type}</td><td>{h.Group ?? h.group ?? '—'}</td>
                    <td><span className={`${s.badge} ${!locked ? s.badgeGreen : s.badgeYellow}`}>{locked ? 'Locked' : 'Active'}</span></td>
                    {isSupervisorOrAdmin && (
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => openEdit(h)}>Edit</button>
                        {isAdmin && <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(code); }}>Delete</button>}
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className={s.modal}>
          <div className={s.modalBox} data-testid={editCode ? 'account-edit-modal' : 'achead-new-modal'}>
            <h2 style={{ marginBottom: '1rem' }}>{editCode ? 'Edit Account Head' : 'New Account Head'}</h2>
            {formError && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{formError}</div>}
            <div className={s.form}>
              <div className={s.formRow}>
                <div className={s.field}><label>Code *</label><input data-testid="achead-new-code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} disabled={!!editCode} /></div>
                <div className={s.field}><label>Name *</label><input data-testid="achead-new-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className={s.field}><label>Type *</label>
                  <select data-testid="achead-new-type" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="">Select...</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className={s.field}><label>Group *</label><input data-testid="achead-new-group" value={form.group} onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))} /></div>
                <div className={s.field}><label>Parent Account</label><input value={form.parent} onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))} /></div>
                <div className={s.field}><label>Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className={s.field}><label>Description</label><textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`${s.btn} ${s.btnPrimary}`} data-testid="achead-new-save-btn" onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
