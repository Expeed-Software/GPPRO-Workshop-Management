import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labourIssueApi } from '../../api/labourIssue';
import s from '../jobs/Jobs.module.css';

// Exact DB column names from Delivery02
const emptyRow = (): Row => ({
  DoNo: '', Itemcode: '', Qty: 1, Rate: 0,
  Tdr: 0, Tda: 0, Amount: 0, Srl: 0,
  GdID: '', CCode: '', Ordr: '',
});

interface Row {
  ID?: number;
  DoNo: string;
  Itemcode: string;
  Qty: number;
  Rate: number;
  Tdr: number;
  Tda: number;
  Amount: number;
  Srl: number;
  GdID: string;
  CCode: string;
  Ordr: string;
}

export default function LabourIssue() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ Ordr: '', DoNo: '' });
  const [editRows, setEditRows] = useState<Row[]>([emptyRow()]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editInlineRow, setEditInlineRow] = useState<Row>(emptyRow());
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: _res, isLoading, refetch } = useQuery({
    queryKey: ['labour-issue', filter],
    queryFn: () => labourIssueApi.list(filter),
  });
  const rows: Row[] = (_res as any)?.data ?? [];

  const createMut = useMutation({
    mutationFn: (newRows: Row[]) => Promise.all(newRows.map((r) => labourIssueApi.create(r))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labour-issue'] });
      setShowForm(false);
      setEditRows([emptyRow()]);
      setError('');
    },
    onError: () => setError('Save failed. Check all required fields.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Row }) =>
      labourIssueApi.update(String(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labour-issue'] });
      setEditId(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => labourIssueApi.delete(String(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labour-issue'] }),
  });

  const setCell = (i: number, k: keyof Row, v: any, isInline = false) => {
    if (isInline) {
      setEditInlineRow((prev) => {
        const updated = { ...prev, [k]: v };
        if (k === 'Qty' || k === 'Rate') {
          updated.Amount = Number(updated.Qty) * Number(updated.Rate);
        }
        return updated;
      });
    } else {
      setEditRows((prev) => prev.map((row, idx) => {
        if (idx !== i) return row;
        const updated = { ...row, [k]: v };
        if (k === 'Qty' || k === 'Rate') {
          updated.Amount = Number(updated.Qty) * Number(updated.Rate);
        }
        return updated;
      }));
    }
  };

  const startEdit = (row: Row) => {
    setEditId(row.ID!);
    setEditInlineRow({ ...row });
  };

  return (
    <div data-testid="labourissue-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Labour Issue</h1>
        <button
          className={`${s.btn} ${s.btnPrimary}`}
          onClick={() => { setShowForm(true); setEditRows([emptyRow()]); setError(''); }}
          data-testid="labourissue-add-btn"
        >
          + New Issue
        </button>
      </div>

      {/* Filters */}
      <div className={s.card}>
        <div className={s.filterBar}>
          <input
            placeholder="Job / Order #"
            value={filter.Ordr}
            onChange={(e) => setFilter((p) => ({ ...p, Ordr: e.target.value }))}
            data-testid="labourissue-filter-ordr"
          />
          <input
            placeholder="DO Number"
            value={filter.DoNo}
            onChange={(e) => setFilter((p) => ({ ...p, DoNo: e.target.value }))}
            data-testid="labourissue-filter-dono"
          />
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => refetch()}>Search</button>
        </div>

        {isLoading ? (
          <div className={s.skeleton} style={{ height: 120 }} />
        ) : rows.length === 0 ? (
          <div className={s.empty}>No labour issue lines found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="labourissue-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DO No</th>
                  <th>Item Code</th>
                  <th>Job/Ordr</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Tdr</th>
                  <th>Tda</th>
                  <th>Amount</th>
                  <th>Srl</th>
                  <th>GdID</th>
                  <th>CCode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  editId === row.ID ? (
                    <tr key={row.ID}>
                      <td>{row.ID}</td>
                      <td><input value={editInlineRow.DoNo} onChange={(e) => setCell(0, 'DoNo', e.target.value, true)} style={{ width: 80 }} /></td>
                      <td><input value={editInlineRow.Itemcode} onChange={(e) => setCell(0, 'Itemcode', e.target.value, true)} style={{ width: 90 }} /></td>
                      <td><input value={editInlineRow.Ordr} onChange={(e) => setCell(0, 'Ordr', e.target.value, true)} style={{ width: 80 }} /></td>
                      <td><input type="number" value={editInlineRow.Qty} onChange={(e) => setCell(0, 'Qty', Number(e.target.value), true)} style={{ width: 55 }} /></td>
                      <td><input type="number" value={editInlineRow.Rate} onChange={(e) => setCell(0, 'Rate', Number(e.target.value), true)} style={{ width: 65 }} /></td>
                      <td><input type="number" value={editInlineRow.Tdr} onChange={(e) => setCell(0, 'Tdr', Number(e.target.value), true)} style={{ width: 55 }} /></td>
                      <td><input type="number" value={editInlineRow.Tda} onChange={(e) => setCell(0, 'Tda', Number(e.target.value), true)} style={{ width: 55 }} /></td>
                      <td style={{ textAlign: 'right' }}>{editInlineRow.Amount.toFixed(2)}</td>
                      <td><input type="number" value={editInlineRow.Srl} onChange={(e) => setCell(0, 'Srl', Number(e.target.value), true)} style={{ width: 45 }} /></td>
                      <td><input value={editInlineRow.GdID} onChange={(e) => setCell(0, 'GdID', e.target.value, true)} style={{ width: 55 }} /></td>
                      <td><input value={editInlineRow.CCode} onChange={(e) => setCell(0, 'CCode', e.target.value, true)} style={{ width: 55 }} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className={`${s.btn} ${s.btnPrimary}`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => updateMut.mutate({ id: row.ID!, data: editInlineRow })}
                          disabled={updateMut.isPending}
                        >
                          Save
                        </button>
                        <button
                          className={`${s.btn} ${s.btnSecondary}`}
                          style={{ fontSize: '0.75rem', marginLeft: 4 }}
                          onClick={() => setEditId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.ID} data-testid={`labourissue-row-${row.ID}`}>
                      <td>{row.ID}</td>
                      <td>{row.DoNo}</td>
                      <td>{row.Itemcode}</td>
                      <td>{row.Ordr}</td>
                      <td>{row.Qty}</td>
                      <td>{row.Rate}</td>
                      <td>{row.Tdr}</td>
                      <td>{row.Tda}</td>
                      <td style={{ textAlign: 'right' }}>{Number(row.Amount).toFixed(2)}</td>
                      <td>{row.Srl}</td>
                      <td>{row.GdID}</td>
                      <td>{row.CCode}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className={`${s.btn} ${s.btnSecondary}`}
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => startEdit(row)}
                          data-testid={`labourissue-edit-${row.ID}`}
                        >
                          Edit
                        </button>
                        <button
                          className={`${s.btn} ${s.btnDanger}`}
                          style={{ fontSize: '0.75rem', marginLeft: 4 }}
                          onClick={() => { if (window.confirm('Delete this line?')) deleteMut.mutate(row.ID!); }}
                          data-testid={`labourissue-delete-${row.ID}`}
                          disabled={deleteMut.isPending}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Issue Form */}
      {showForm && (
        <div className={s.card} data-testid="labourissue-form">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>New Labour Issue Lines</h2>
          {error && <div className={s.error}>{error}</div>}
          <div style={{ overflowX: 'auto' }}>
            <table className={s.itemsTable}>
              <thead>
                <tr>
                  <th>DO No</th>
                  <th>Item Code</th>
                  <th>Job/Ordr</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Tdr</th>
                  <th>Tda</th>
                  <th>Amount</th>
                  <th>Srl</th>
                  <th>GdID</th>
                  <th>CCode</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {editRows.map((row, i) => (
                  <tr key={i}>
                    <td><input value={row.DoNo} onChange={(e) => setCell(i, 'DoNo', e.target.value)} style={{ width: 80 }} data-testid={`labourissue-new-DoNo-${i}`} /></td>
                    <td><input value={row.Itemcode} onChange={(e) => setCell(i, 'Itemcode', e.target.value)} style={{ width: 90 }} data-testid={`labourissue-new-Itemcode-${i}`} /></td>
                    <td><input value={row.Ordr} onChange={(e) => setCell(i, 'Ordr', e.target.value)} style={{ width: 80 }} data-testid={`labourissue-new-Ordr-${i}`} /></td>
                    <td><input type="number" value={row.Qty} onChange={(e) => setCell(i, 'Qty', Number(e.target.value))} style={{ width: 55 }} /></td>
                    <td><input type="number" value={row.Rate} onChange={(e) => setCell(i, 'Rate', Number(e.target.value))} style={{ width: 65 }} /></td>
                    <td><input type="number" value={row.Tdr} onChange={(e) => setCell(i, 'Tdr', Number(e.target.value))} style={{ width: 55 }} /></td>
                    <td><input type="number" value={row.Tda} onChange={(e) => setCell(i, 'Tda', Number(e.target.value))} style={{ width: 55 }} /></td>
                    <td style={{ textAlign: 'right' }}>{row.Amount.toFixed(2)}</td>
                    <td><input type="number" value={row.Srl} onChange={(e) => setCell(i, 'Srl', Number(e.target.value))} style={{ width: 45 }} /></td>
                    <td><input value={row.GdID} onChange={(e) => setCell(i, 'GdID', e.target.value)} style={{ width: 55 }} /></td>
                    <td><input value={row.CCode} onChange={(e) => setCell(i, 'CCode', e.target.value)} style={{ width: 55 }} /></td>
                    <td>
                      {editRows.length > 1 && (
                        <button
                          className={`${s.btn} ${s.btnDanger}`}
                          onClick={() => setEditRows((p) => p.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.actions} style={{ marginTop: '1rem' }}>
            <button
              className={`${s.btn} ${s.btnSecondary}`}
              onClick={() => setEditRows((p) => [...p, emptyRow()])}
            >
              + Add Row
            </button>
            <button
              className={`${s.btn} ${s.btnPrimary}`}
              onClick={() => createMut.mutate(editRows)}
              disabled={createMut.isPending}
              data-testid="labourissue-save-btn"
            >
              {createMut.isPending ? 'Saving…' : 'Save All'}
            </button>
            <button
              className={`${s.btn} ${s.btnSecondary}`}
              onClick={() => { setShowForm(false); setError(''); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
