import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi } from '../../api/purchase';
import { suppliersApi } from '../../api/customers';
import { useAuthStore } from '../../store/authStore';
import s from '../sales/Sales.module.css';

export default function LocalPOManagement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ status: '', supplier: '', search: '' });
  const [selected, setSelected] = useState<string[]>([]);

  const { data: _suppRes } = useQuery({ queryKey: ['suppliers-dropdown'], queryFn: () => suppliersApi.list({ limit: 500 }) });
  const suppliers: any[] = (_suppRes as any)?.data ?? [];

  const { data: _ordersRes, isLoading } = useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: () => purchaseOrdersApi.list(filters),
  });
  const orders: any[] = (_ordersRes as any)?.data ?? [];

  const approveMut = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.approve(id, 'Approved by supervisor.'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['purchase-orders'] }); setSelected([]); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });

  const getBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'approved') return s.badgeGreen;
    if (st === 'submitted') return s.badgeBlue;
    if (st === 'draft') return s.badgeGray;
    if (st === 'rejected') return s.badgeRed;
    return s.badgeGray;
  };

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div data-testid="localpomanage-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Local Purchase Order Management</h1>
        <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => navigate('/purchase/orders/local')}>+ New PO</button>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="localpomanage-filter-status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select data-testid="localpomanage-filter-supplier" value={filters.supplier} onChange={(e) => setFilters((p) => ({ ...p, supplier: e.target.value }))}>
            <option value="">All Suppliers</option>
            {suppliers.map((s2: any) => <option key={s2.ID ?? s2.id} value={String(s2.ID ?? s2.id)}>{s2.Name ?? s2.SupplierName ?? s2.name}</option>)}
          </select>
          <input placeholder="Search…" data-testid="localpomanage-searchbar" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
        </div>

        {isSupervisorOrAdmin && selected.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem' }}>{selected.length} selected</span>
            <button className={`${s.btn} ${s.btnSuccess}`} data-testid="localpomanage-bulk-approve" onClick={() => selected.forEach((id) => approveMut.mutate(id))}>Bulk Approve</button>
            <button className={`${s.btn} ${s.btnDanger}`} data-testid="localpomanage-bulk-reject" onClick={() => {}}>Bulk Reject</button>
          </div>
        )}

        {isLoading ? (
          <div data-testid="localpomanage-loading-skeleton" className={s.skeleton} style={{ height: '150px' }} />
        ) : (orders as any[]).length === 0 ? (
          <div data-testid="localpomanage-nodata-message" className={s.empty}>No purchase orders found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="localpomanage-table">
              <thead>
                <tr>
                  {isSupervisorOrAdmin && <th><input type="checkbox" onChange={() => setSelected((orders as any[]).map((o: any) => String(o.ID)))} /></th>}
                  <th data-testid="localpomanage-table-col-pono">PO Number</th>
                  <th data-testid="localpomanage-table-col-supplier">Supplier</th>
                  <th data-testid="localpomanage-table-col-status">Status</th>
                  <th data-testid="localpomanage-table-col-date">Date</th>
                  <th data-testid="localpomanage-table-col-total">Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(orders as any[]).map((o: any) => (
                  <tr key={o.ID}>
                    {isSupervisorOrAdmin && <td><input type="checkbox" checked={selected.includes(String(o.ID))} onChange={() => toggleSelect(String(o.ID))} /></td>}
                    <td>{o.Invoice ?? o.ID}</td>
                    <td>{o.SupplierName}</td>
                    <td><span className={`${s.badge} ${getBadge(o.Closed ? 'Closed' : 'Open')}`}>{o.Closed ? 'Closed' : 'Open'}</span></td>
                    <td>{o.InvDt}</td>
                    <td>{o.Total?.toFixed(2) ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`localpomanage-row-edit-${o.ID}`} onClick={() => navigate(`/purchase/orders/${o.ID}/edit`)}>Edit</button>
                        {isSupervisorOrAdmin && !o.Closed && (
                          <button className={`${s.btn} ${s.btnSuccess}`} style={{ fontSize: '0.75rem' }} data-testid={`localpomanage-row-approve-${o.ID}`} onClick={() => approveMut.mutate(String(o.ID))}>Approve</button>
                        )}
                        {isSupervisorOrAdmin && (
                          <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} data-testid={`localpomanage-row-reject-${o.ID}`} onClick={() => deleteMut.mutate(String(o.ID))}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
