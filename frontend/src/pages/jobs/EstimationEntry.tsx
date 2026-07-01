import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { estimationsApi } from '../../api/jobs';
import { customersApi, vehiclesApi } from '../../api/customers';
import s from './Jobs.module.css';

// Exact DB column names from Estimation02 (no Type column in DB)
const emptyItem = () => ({ Description: '', Qty: 1, UnitPrice: 0, LabourAmt: 0 });

// --- Inline searchable dropdown component ---
interface DropdownOption { value: string; label: string; }
interface SearchDropdownProps {
  value: string;
  placeholder: string;
  onSearch: (text: string) => Promise<DropdownOption[]>;
  onSelect: (value: string, label: string) => void;
  testId?: string;
}
function SearchDropdown({ value, placeholder, onSearch, onSelect, testId }: SearchDropdownProps) {
  const [text, setText] = useState(value);
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setText(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setText(t);
    if (debounce.current) clearTimeout(debounce.current);
    if (!t.trim()) { setOptions([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const opts = await onSearch(t);
        setOptions(opts);
        setOpen(opts.length > 0);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const pick = (opt: DropdownOption) => {
    setText(opt.label);
    onSelect(opt.value, opt.label);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        data-testid={testId}
        value={text}
        onChange={handleChange}
        onFocus={() => { if (options.length) setOpen(true); }}
        placeholder={placeholder}
        style={{ width: '100%' }}
        autoComplete="off"
      />
      {loading && (
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#999' }}>…</span>
      )}
      {open && options.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 999, left: 0, right: 0,
          background: '#fff', border: '1px solid #ddd', borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 220, overflowY: 'auto',
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onMouseDown={() => pick(opt)}
              style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EstimationEntry() {
  const { jobCardNo } = useParams<{ jobCardNo?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support opening from EstimationList via ?jobCard=xxx
  const jobCardParam = jobCardNo || searchParams.get('jobCard') || undefined;
  const isEdit = Boolean(jobCardParam);

  const { data: est, isLoading } = useQuery({
    queryKey: ['estimation', jobCardParam],
    queryFn: () => estimationsApi.get(jobCardParam!),
    enabled: isEdit,
  });

  // Exact DB column names from Estimation01
  const [form, setForm] = useState({
    CustomerId: '',
    VehicleId:  '',
    Remarks:    '',
    Addition:   '',
  });
  // Display labels for the dropdowns (not sent in payload)
  const [customerLabel, setCustomerLabel] = useState('');
  const [vehicleLabel,  setVehicleLabel]  = useState('');

  const [items, setItems] = useState([emptyItem()]);
  const [error, setError] = useState('');
  const hasExisting = est !== null && est !== undefined;

  useEffect(() => {
    if (est) {
      setForm({
        CustomerId: String(est.CustomerId ?? ''),
        VehicleId:  String(est.VehicleId  ?? ''),
        Remarks:    est.Remarks    ?? '',
        Addition:   est.Addition   ?? '',
      });
      if (est.CustomerName) setCustomerLabel(`${est.CustomerName} (${est.CustomerId})`);
      if (est.VehicleId)    setVehicleLabel(String(est.VehicleId));
      if (est.items?.length) setItems(est.items);
    }
  }, [est]);

  // Customer search: calls customersApi.list({ search }) → CustId, CustName
  const searchCustomers = async (text: string): Promise<DropdownOption[]> => {
    const res = await customersApi.list({ search: text, limit: 20 });
    const rows: any[] = (res as any)?.data ?? [];
    return rows.map((r: any) => ({
      value: String(r.CustId),
      label: `${r.CustName || r.custname} (${r.CustId})`,
    }));
  };

  // Vehicle search: calls vehiclesApi.search({ search, custId }) → VehID, VehNo, Make
  const searchVehicles = async (text: string): Promise<DropdownOption[]> => {
    const params: any = { search: text, limit: 20 };
    if (form.CustomerId) params.custId = form.CustomerId;
    const res = await vehiclesApi.search(params);
    const rows: any[] = (res as any)?.data ?? [];
    return rows.map((r: any) => ({
      value: String(r.VehID),
      label: `${r.VehNo} — ${r.Make || ''} (${r.VehID})`,
    }));
  };

  const createMut = useMutation({
    mutationFn: (d: any) => estimationsApi.create(d),
    onSuccess: () => navigate('/jobs/estimations'),
  });
  const updateMut = useMutation({
    mutationFn: (d: any) => estimationsApi.update(jobCardParam!, d),
    onSuccess: () => navigate('/jobs/estimations'),
  });
  const submitMut = useMutation({
    mutationFn: () => estimationsApi.submit(jobCardParam!),
    onSuccess: () => navigate('/jobs/estimations'),
  });

  const f = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.CustomerId) { setError('Customer is required (BR-39).');            return; }
    if (!form.VehicleId)  { setError('Vehicle is required (BR-39).');             return; }
    if (!form.Remarks)    { setError('Service description is required (BR-39).'); return; }
    if (!items.length)    { setError('At least one line item is required (BR-39).'); return; }
    const payload = { ...form, items, jobCardNo: jobCardParam ?? '' };
    if (isEdit && hasExisting) updateMut.mutate(payload); else createMut.mutate(payload);
  };

  const addItem    = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const setItem    = (i: number, k: string, v: any) =>
    setItems((p) => p.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  // Total = (Qty × UnitPrice) + LabourAmt per line
  const grandTotal = items.reduce((acc, it) => acc + it.Qty * it.UnitPrice + it.LabourAmt, 0);

  if (isLoading)
    return (
      <div data-testid="estimationentry-loading" className={s.page}>
        <div className={s.skeleton} style={{ height: '200px' }} />
      </div>
    );

  return (
    <div data-testid="estimationentry-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>
          {isEdit && hasExisting
            ? `Edit Estimation — Job #${jobCardParam}`
            : isEdit
            ? `New Estimation — Job #${jobCardParam}`
            : 'New Service Estimation'}
        </h1>
      </div>

      {(error || createMut.error || updateMut.error) && (
        <div data-testid="estimationentry-error" className={s.error}>
          {error || 'An error occurred.'}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Customer *</label>
              <SearchDropdown
                testId="estimationentry-custid"
                value={customerLabel || form.CustomerId}
                placeholder="Search customer by name or ID…"
                onSearch={searchCustomers}
                onSelect={(val, label) => {
                  setForm((p) => ({ ...p, CustomerId: val, VehicleId: '' }));
                  setCustomerLabel(label);
                  setVehicleLabel('');
                }}
              />
            </div>
            <div className={s.formGroup}>
              <label>Vehicle *</label>
              <SearchDropdown
                testId="estimationentry-vehicleid"
                value={vehicleLabel || form.VehicleId}
                placeholder="Search vehicle by plate or make…"
                onSearch={searchVehicles}
                onSelect={(val, label) => {
                  setForm((p) => ({ ...p, VehicleId: val }));
                  setVehicleLabel(label);
                }}
              />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Service Description *</label>
              <textarea
                data-testid="estimationentry-description"
                value={form.Remarks}
                onChange={f('Remarks')}
                required
              />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Notes / Addition</label>
              <textarea
                data-testid="estimationentry-notes"
                value={form.Addition}
                onChange={f('Addition')}
              />
            </div>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.header}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Line Items (Parts &amp; Labour)</h2>
            <button
              type="button"
              className={`${s.btn} ${s.btnPrimary}`}
              data-testid="estimationentry-add-item"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={s.itemsTable} data-testid="estimationentry-items-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Description</th>
                  <th style={{ width: 60 }}>Qty</th>
                  <th style={{ width: 100 }}>Unit Price</th>
                  <th style={{ width: 100 }}>Labour Amt</th>
                  <th style={{ width: 90 }}>Line Total</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        value={it.Description}
                        onChange={(e) => setItem(i, 'Description', e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="Part name or labour description"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={it.Qty}
                        min={0}
                        onChange={(e) => setItem(i, 'Qty', Number(e.target.value))}
                        style={{ width: 55 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={it.UnitPrice}
                        min={0}
                        step="0.01"
                        onChange={(e) => setItem(i, 'UnitPrice', Number(e.target.value))}
                        style={{ width: 85 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={it.LabourAmt}
                        min={0}
                        step="0.01"
                        onChange={(e) => setItem(i, 'LabourAmt', Number(e.target.value))}
                        style={{ width: 85 }}
                        data-testid={`estimationentry-labouramt-${i}`}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(it.Qty * it.UnitPrice + it.LabourAmt).toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${s.btn} ${s.btnDanger}`}
                        onClick={() => removeItem(i)}
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Grand Total</td>
                  <td data-testid="estimationentry-total" style={{ fontWeight: 700, textAlign: 'right' }}>
                    {grandTotal.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className={s.actions}>
          <button
            type="submit"
            className={`${s.btn} ${s.btnPrimary}`}
            data-testid="estimationentry-save-btn"
            disabled={createMut.isPending || updateMut.isPending}
          >
            {createMut.isPending || updateMut.isPending ? 'Saving…' : 'Save Estimation'}
          </button>
          {isEdit && hasExisting && (
            <button
              type="button"
              className={`${s.btn} ${s.btnSuccess}`}
              data-testid="estimationentry-submit-btn"
              onClick={() => submitMut.mutate()}
              disabled={submitMut.isPending}
            >
              {submitMut.isPending ? 'Submitting…' : 'Submit for Approval'}
            </button>
          )}
          <button
            type="button"
            className={`${s.btn} ${s.btnSecondary}`}
            data-testid="estimationentry-cancel-btn"
            onClick={() => navigate('/jobs/estimations')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
