import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { deliveryApi } from '../../api/sales';
import { useAuthStore } from '../../store/authStore';
import s from './Sales.module.css';

export default function DeliveryNotePrint() {
  const { noteId } = useParams<{ noteId: string }>();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));

  const { data: note, isLoading } = useQuery({ queryKey: ['delivery-note-print', noteId], queryFn: () => deliveryApi.print(noteId!) });
  const { data: auditLog } = useQuery({ queryKey: ['delivery-note-audit', noteId], queryFn: () => deliveryApi.audit(noteId!), enabled: isSupervisorOrAdmin });

  const exportMut = useMutation({ mutationFn: () => deliveryApi.export(noteId!), onSuccess: () => {} });

  if (isLoading) return <div data-testid="deliverynoteprint-loading" className={s.page}><div className={s.skeleton} style={{ height: '200px' }} /></div>;

  return (
    <div data-testid="deliverynoteprint-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Delivery Note #{noteId}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={`${s.btn} ${s.btnPrimary}`} data-testid="deliverynoteprint-print-btn" onClick={() => window.print()}>Print</button>
          <button className={`${s.btn} ${s.btnSecondary}`} data-testid="deliverynoteprint-export-btn" onClick={() => exportMut.mutate()} disabled={exportMut.isPending}>
            {exportMut.isPending ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>

      {note && (
        <div className={s.card} data-testid="deliverynoteprint-details">
          {(note as any).isCopy && (
            <div style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, color: '#dc2626', opacity: 0.3, position: 'absolute', transform: 'rotate(-30deg)', pointerEvents: 'none' }}>COPY</div>
          )}
          <div className={s.formGrid}>
            <div className={s.formGroup}><label>Order #</label><input readOnly value={(note as any).orderId ?? ''} /></div>
            <div className={s.formGroup}><label>Delivery Date</label><input readOnly value={(note as any).deliveryDate ?? ''} /></div>
            <div className={s.formGroup}><label>Recipient</label><input readOnly value={(note as any).recipientName ?? ''} /></div>
            <div className={s.formGroup}><label>Delivered By</label><input readOnly value={(note as any).deliveredBy ?? ''} /></div>
            {(note as any).remarks && <div className={`${s.formGroup} ${s.formFull}`}><label>Remarks</label><textarea readOnly value={(note as any).remarks} /></div>}
          </div>
          <table className={s.itemsTable} style={{ marginTop: '1rem' }}>
            <thead><tr><th>Product</th><th>Qty Ordered</th><th>Qty Delivered</th></tr></thead>
            <tbody>
              {((note as any).products || []).map((p: any, i: number) => (
                <tr key={i}><td>{p.product}</td><td>{p.orderedQty}</td><td>{p.deliveredQty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isSupervisorOrAdmin && auditLog && (
        <div className={s.card} data-testid="deliverynoteprint-audit">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Audit Log</h2>
          {(auditLog as any[]).map((entry: any, i: number) => (
            <div key={i} className={s.auditEntry}><span className={s.auditTime}>{entry.createdAt}</span><span>{entry.action} by {entry.userId}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
