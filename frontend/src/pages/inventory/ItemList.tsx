import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../../api/inventory';
import { useAuthStore } from '../../store/authStore';
import s from './Inventory.module.css';


export default function ItemList() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('Administrator');
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ search: '', category: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ itemCode: '', description: '', unit: '', category: '', reorderQty: '' });
  const [formError, setFormError] = useState('');

  const { data: catData = [] } = useQuery({ queryKey: ['item-categories'], queryFn: () => itemsApi.categories() });
  const categories: any[] = catData as any[];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemsApi.list(filters),
  });

  const saveMut = useMutation({
    mutationFn: (data: any) => editItem ? itemsApi.update(editItem.itemCode, data) : itemsApi.create(data),
    onSuccess: () => { setShowModal(false); setEditItem(null); qc.invalidateQueries({ queryKey: ['items'] }); },
    onError: (err: any) => setFormError(err?.response?.data?.error?.message ?? 'Save failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (itemCode: string) => itemsApi.delete(itemCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });

  const openEdit = (item: any) => { setEditItem(item); setForm({ itemCode: item.ItemCode ?? item.itemCode, description: item.Description ?? item.description, unit: item.Denom ?? item.unit, category: item.CatID ?? item.category ?? '', reorderQty: item.ReOrder ?? item.reorderQty ?? '' }); setFormError(''); setShowModal(true); };
  const openAdd = () => { setEditItem(null); setForm({ itemCode: '', description: '', unit: '', category: '', reorderQty: '' }); setFormError(''); setShowModal(true); };

  return (
    <div data-testid="itemlist-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Item List</h1>
        {isSupervisorOrAdmin && <button className={`${s.btn} ${s.btnPrimary}`} data-testid="itemlist-add-btn" onClick={openAdd}>+ Add Item</button>}
      </div>

      <div className={s.card}>
        <div className={s.filterBar}>
          <input placeholder="Search items..." data-testid="itemlist-search" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
          <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.CatID} value={c.CatID}>{c.CatID}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div data-testid="itemlist-skeleton" className={s.skeleton} style={{ height: '120px' }} />
        ) : (items as any[]).length === 0 ? (
          <div data-testid="itemlist-empty" className={s.empty}>No items found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table} data-testid="itemlist-table">
              <thead>
                <tr>
                  <th>Item Code</th><th>Description</th><th>Unit</th><th>Category</th><th>Reorder Qty</th>
                  {isSupervisorOrAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {(items as any[]).map((item: any, i: number) => {
                  const itemCode = item.ItemCode ?? item.itemCode;
                  return (
                  <tr key={itemCode ?? i} data-testid={`itemlist-row-${itemCode}`}>
                    <td>{itemCode}</td>
                    <td>{item.Description ?? item.description}</td>
                    <td>{item.Denom ?? item.unit}</td>
                    <td>{item.CatID ?? item.category ?? '—'}</td>
                    <td>{item.ReOrder ?? item.reorderQty ?? '—'}</td>
                    {isSupervisorOrAdmin && (
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid={`itemlist-edit-${itemCode}`} onClick={() => openEdit(item)}>Edit</button>
                        {isAdmin && <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} data-testid={`itemlist-delete-${itemCode}`} onClick={() => { if (window.confirm('Delete item?')) deleteMut.mutate(itemCode); }}>Delete</button>}
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
          <div className={s.modalBox} data-testid="itemlist-modal">
            <h2 style={{ marginBottom: '1rem' }}>{editItem ? 'Edit Item' : 'Add Item'}</h2>
            {formError && <div className={s.fieldError} style={{ marginBottom: '0.75rem' }}>{formError}</div>}
            <div className={s.form}>
              <div className={s.formRow}>
                <div className={s.field}><label>Item Code *</label><input data-testid="itemlist-modal-itemcode" value={form.itemCode} onChange={(e) => setForm((p) => ({ ...p, itemCode: e.target.value }))} disabled={!!editItem} /></div>
                <div className={s.field}><label>Description *</label><input data-testid="itemlist-modal-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
                <div className={s.field}><label>Unit *</label><input data-testid="itemlist-modal-unit" value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} /></div>
                <div className={s.field}><label>Category</label><input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} /></div>
                <div className={s.field}><label>Reorder Qty</label><input type="number" value={form.reorderQty} onChange={(e) => setForm((p) => ({ ...p, reorderQty: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className={`${s.btn} ${s.btnSecondary}`} data-testid="itemlist-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={`${s.btn} ${s.btnPrimary}`} data-testid="itemlist-modal-save" onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
