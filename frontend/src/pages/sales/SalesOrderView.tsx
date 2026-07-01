import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesOrdersApi, deliveryApi } from '../../api/sales';
import { useAuthStore } from '../../store/authStore';
import s from './Sales.module.css';

export default function SalesOrderView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({ queryKey: ['sales-order', orderId], queryFn: () => salesOrdersApi.get(orderId!) });
  const { data: auditLog } = useQuery({ queryKey: ['order-audit', orderId], queryFn: () => salesOrdersApi.auditTrail(orderId!), enabled: isSupervisorOrAdmin });
  const { data: deliveryNotes = [] } = useQuery({ queryKey: ['delivery-notes', orderId], queryFn: () => deliveryApi.listForOrder(orderId!) });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', reason: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);

  const deleteMut = useMutation({ mutationFn: () => salesOrdersApi.delete(orderId!), onSuccess: () => navigate('/sales/orders') });
  const statusMut = useMutation({ mutationFn: () => salesOrdersApi.changeStatus(orderId!, statusData.status, statusData.reason), onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales-order', orderId] }); setShowStatusModal(false); } });

  const getBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'delivered') return s.badgeGreen;
    if (st === 'confirmed' || st === 'in progress') return s.badgeBlue;
    if (st === 'pending' || st === 'draft') return s.badgeYellow;
    if (st === 'cancelled' || st === 'void') return s.badgeRed;
    return s.badgeGray;
  };

  if (isLoading) return <div data-testid="salesorderview-loading" className={s.page}><div className={s.skeleton} style={{ height: '200px' }} /></div>;
  if (!order) return <div data-testid="salesorderview-notfound" className={s.page}><div className={s.error}>Order not found.</div></div>;

  return (
    <div data-testid="salesorderview-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Sales Order #{order.ID ?? order.id}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(order.StatusDescription ?? order.status) !== 'Delivered' && (
            <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => navigate(`/sales/orders/${orderId}/edit`)}>Edit</button>
          )}
          {isSupervisorOrAdmin && (order.StatusDescription ?? order.status) !== 'Delivered' && (
            <button className={`${s.btn} ${s.btnSecondary}`} data-testid="orderstatus-update-btn" onClick={() => { setStatusData({ status: order.StatusDescription ?? order.status, reason: '' }); setShowStatusModal(true); }}>Change Status</button>
          )}
          {isSupervisorOrAdmin && (
            <button className={`${s.btn} ${s.btnDanger}`} data-testid="orderstatus-delete-btn" onClick={() => setShowDeleteConfirm(true)}>Delete/Void</button>
          )}
        </div>
      </div>

      <div className={s.card} data-testid="salesorderview-details">
        <div className={s.formGrid}>
          <div className={s.formGroup}><label>Customer</label><input readOnly value={order.CustomerName ?? order.CustId ?? order.customerId ?? ''} /></div>
          <div className={s.formGroup}><label>Order Date</label><input readOnly value={order.Ordt ?? order.orderDate ?? ''} /></div>
          <div className={s.formGroup}><label>Status</label><span className={`${s.badge} ${getBadge(order.StatusDescription ?? order.status)}`}>{order.StatusDescription ?? order.status}</span></div>
          <div className={s.formGroup} />
          {(order.CustNote ?? order.notes) && <div className={`${s.formGroup} ${s.formFull}`}><label>Notes</label><textarea readOnly value={order.CustNote ?? order.notes} /></div>}
        </div>
      </div>

      <div className={s.card}>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Products</h2>
        <table className={s.itemsTable} data-testid="salesorderview-items-table">
          <thead><tr><th>Product</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Amount</th></tr></thead>
          <tbody>
            {(order.items || []).map((it: any, i: number) => (
              <tr key={i}><td>{it.product}</td><td>{it.description}</td><td>{it.qty}</td><td>{it.unitPrice}</td><td>{it.discount}%</td><td>{(it.qty * it.unitPrice * (1 - it.discount / 100)).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {(deliveryNotes as any[]).length > 0 && (
        <div className={s.card} data-testid="salesorderview-delivery-notes">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Delivery Notes</h2>
          <table className={s.table}>
            <thead><tr><th>Note #</th><th>Delivery Date</th><th>Recipient</th><th>Actions</th></tr></thead>
            <tbody>
              {(deliveryNotes as any[]).map((dn: any, i: number) => (
                <tr key={i}><td>{dn.id}</td><td>{dn.DODt ?? dn.deliveryDate}</td><td>{dn.Remarks ?? dn.recipientName}</td>
                  <td><button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} onClick={() => navigate(`/sales/delivery-notes/${dn.id}/print`)}>Print</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isSupervisorOrAdmin && auditLog && (
        <div className={s.card} data-testid="salesorderview-audit">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Audit Log</h2>
          {(auditLog as any[]).map((entry: any, i: number) => (
            <div key={i} className={s.auditEntry}><span className={s.auditTime}>{entry.StatusDate ?? entry.createdAt}</span><span>{entry.StatusDescription ?? entry.action} by {entry.StatusId ?? entry.userId}</span></div>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={s.card} style={{ minWidth: 320 }} data-testid="salesorderview-delete-modal">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Confirm Delete/Void</h2>
            <p>This will permanently delete the order. Cannot be undone if no delivery note exists (BR-51).</p>
            <div className={s.actions}>
              <button className={`${s.btn} ${s.btnDanger}`} onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>Confirm Delete</button>
              <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className={s.card} style={{ minWidth: 360 }} data-testid="salesorderview-status-modal">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Change Status</h2>
            <div className={s.formGroup} style={{ marginBottom: '1rem' }}>
              <label>New Status</label>
              <select value={statusData.status} onChange={(e) => setStatusData((p) => ({ ...p, status: e.target.value }))}>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className={s.formGroup} style={{ marginBottom: '1rem' }}>
              <label>Reason (BR-56)</label>
              <textarea value={statusData.reason} onChange={(e) => setStatusData((p) => ({ ...p, reason: e.target.value }))} />
            </div>
            <div className={s.actions}>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => statusMut.mutate()} disabled={statusMut.isPending}>Update</button>
              <button className={`${s.btn} ${s.btnSecondary}`} onClick={() => setShowStatusModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
