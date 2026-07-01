import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApi, purchaseDOApi } from '../../api/purchase';
import { suppliersApi } from '../../api/customers';
import { useAuthStore } from '../../store/authStore';
import s from '../sales/Sales.module.css';

export default function PendingPurchaseDO() {
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ supplier: '', date: '', doNumber: '' });
  const [selected, setSelected] = useState<string[]>([]);

  const { data: _suppRes } = useQuery({ queryKey: ['suppliers-dropdown'], queryFn: () => suppliersApi.list({ limit: 500 }) });
  const suppliers: any[] = (_suppRes as any)?.data ?? [];

  const { data: _dosRes, isLoading } = useQuery({
    queryKey: ['pending-dos', filters],
    queryFn: () => purchaseOrdersApi.pendingDOs(filters),
  });
  const dos: any[] = (_dosRes as any)?.data ?? [];

  const receiptMut = useMutation({
    mutationFn: (ids: string[]) => purchaseDOApi.bulkReceipt({ doIds: ids, userId: user?.id }),
    onSuccess: () => { setSelected([]); qc.invalidateQueries({ queryKey: ['pending-dos'] }); },
  });

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div data-testid="pendingpdo-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Pending Purchase Delivery Orders</h1>
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <select data-testid="pendingpdo-filter-supplier" value={filters.supplier} onChange={(e) => setFilters((p) => ({ ...p, supplier: e.target.value }))}>
            <option value="">All Suppliers</option>
            {suppliers.map((s2: any) => <option key={s2.ID ?? s2.id} value={String(s2.ID ?? s2.id)}>{s2.Name ?? s2.SupplierName ?? s2.name}</option>)}
          </select>
          <input type="date" data-testid="pendingpdo-filter-date" value={filters.date} onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))} />
          <input placeholder="DO Number" data-testid="pendingpdo-filter-pdonum" value={filters.doNumber} onChange={(e) => setFilters((p) => ({ ...p, doNumber: e.target.value }))} />
        </div>

        {isSupervisorOrAdmin && selected.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem' }}>{selected.length} selected</span>
            <button className={`${s.btn} ${s.btnSuccess}`} data-testid="pendingpdo-bulk-markreceived" onClick={() => receiptMut.mutate(selected)} disabled={receiptMut.isPending}>Mark Received</button>
          </div>
        )}

        {isLoading ? (
          <div data-testid="pendingpdo-loading-skeleton" className={s.skeleton} style={{ height: '120px' }} />
        ) : (dos as any[]).length === 0 ? (
          <div data-testid="pendingpdo-nodata-message" className={s.empty}>No pending delivery orders.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="pendingpdo-table">
              <thead>
                <tr>
                  {isSupervisorOrAdmin && <th><input type="checkbox" onChange={() => setSelected((dos as any[]).map((d: any) => String(d.ID ?? d.id)))} /></th>}
                  <th data-testid="pendingpdo-table-col-pdonum">DO Number</th>
                  <th>PO Number</th><th>Supplier</th><th>Expected</th><th>Status</th>
                  {isSupervisorOrAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(dos as any[]).map((d: any, i: number) => (
                  <tr key={d.id ?? i}>
                    {isSupervisorOrAdmin && <td><input type="checkbox" checked={selected.includes(String(d.ID ?? d.id))} onChange={() => toggleSelect(String(d.id))} /></td>}
                    <td>{d.PDONo ?? d.doNumber ?? d.ID ?? d.id}</td>
                    <td>{d.Ref ?? d.poNumber}</td>
                    <td>{d.SupplierName ?? d.supplier}</td>
                    <td>{d.POrdt ?? d.expectedDate ?? '—'}</td>
                    <td><span className={`${s.badge} ${s.badgeYellow}`}>{d.Closed === 0 || d.Closed == null ? 'Pending' : 'Closed'}</span></td>
                    {isSupervisorOrAdmin && (
                      <td><button className={`${s.btn} ${s.btnSuccess}`} style={{ fontSize: '0.75rem' }} data-testid={`pendingpdo-row-markreceived-${d.ID ?? d.id}`} onClick={() => receiptMut.mutate([String(d.ID ?? d.id)])}>Mark Received</button></td>
                    )}
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
