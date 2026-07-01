import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { estimationsApi } from '../../api/jobs';
import { useAuthStore } from '../../store/authStore';
import s from './Jobs.module.css';

export default function EstimationApproval() {
  const { estimationId } = useParams<{ estimationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisorOrAdmin = user?.roles?.some((r: string) => ['Administrator', 'Supervisor'].includes(r));

  const { data: est, isLoading, error } = useQuery({
    queryKey: ['estimation', estimationId],
    queryFn: () => estimationsApi.get(estimationId!),
    enabled: !!estimationId,
  });

  const { data: auditLog } = useQuery({
    queryKey: ['estimation-audit', estimationId],
    queryFn: () => estimationsApi.auditLog(estimationId!),
    enabled: !!estimationId && isSupervisorOrAdmin,
  });

  const [action, setAction] = useState<'approve' | 'reject' | 'revision'>('approve');
  const [comment, setComment] = useState('');
  const [assignTo, setAssignTo] = useState('');

  const approveMut = useMutation({
    mutationFn: () => estimationsApi.approve(estimationId!, action, comment, assignTo || undefined),
    onSuccess: () => navigate('/jobs/estimation-entry'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((action === 'reject' || action === 'revision') && comment.length < 16) return;
    approveMut.mutate();
  };

  if (isLoading) return <div data-testid="estapproval-loading" className={s.page}><div className={s.skeleton} style={{ height: '200px' }} /></div>;
  if (error || !est) return <div data-testid="estapproval-error" className={s.page}><div className={s.error}>Estimation not found.</div></div>;

  if (!isSupervisorOrAdmin) {
    return (
      <div data-testid="estapproval-page" className={s.page}>
        <div className={s.error} data-testid="estapproval-perm-error">Only Supervisor or Administrator can approve estimations (BR-40).</div>
      </div>
    );
  }

  return (
    <div data-testid="estapproval-page" className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Estimation Approval</h1>
      </div>

      <div className={s.card} data-testid="estapproval-details">
        <div className={s.formGrid}>
          <div className={s.formGroup}><label>Customer</label><input readOnly value={est.custId ?? ''} /></div>
          <div className={s.formGroup}><label>Vehicle</label><input readOnly value={est.vehicleId ?? ''} /></div>
          <div className={`${s.formGroup} ${s.formFull}`}><label>Service Description</label><textarea readOnly value={est.serviceDescription ?? ''} /></div>
        </div>

        <table className={s.itemsTable} data-testid="estapproval-items-table">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Discount %</th><th>Total</th></tr></thead>
          <tbody>
            {(est.items || []).map((it: any, i: number) => (
              <tr key={i}>
                <td>{it.description}</td>
                <td>{it.qty}</td>
                <td>{it.unitPrice}</td>
                <td>{it.discount}%</td>
                <td>{(it.qty * it.unitPrice * (1 - it.discount / 100)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={s.card}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Decision</h2>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Action *</label>
              <select data-testid="estapproval-action-select" value={action} onChange={(e) => setAction(e.target.value as any)}>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="revision">Request Revision</option>
              </select>
            </div>
            <div className={s.formGroup}>
              <label>Assign To (if revising)</label>
              <input data-testid="estapproval-assignto" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="User ID" />
            </div>
            <div className={`${s.formGroup} ${s.formFull}`}>
              <label>Comment {(action === 'reject' || action === 'revision') ? '* (min 16 chars)' : ''}</label>
              <textarea
                data-testid="estapproval-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required={action === 'reject' || action === 'revision'}
                minLength={action === 'reject' || action === 'revision' ? 16 : undefined}
              />
            </div>
          </div>
          {approveMut.error && <div className={s.error} data-testid="estapproval-error">An error occurred.</div>}
          <div className={s.actions}>
            <button type="submit" className={`${s.btn} ${action === 'approve' ? s.btnSuccess : s.btnDanger}`} data-testid="estapproval-submit-btn" disabled={approveMut.isPending}>
              {approveMut.isPending ? 'Processing…' : `Submit ${action}`}
            </button>
            <button type="button" className={`${s.btn} ${s.btnSecondary}`} data-testid="estapproval-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </form>

      {isSupervisorOrAdmin && auditLog && (
        <div className={s.card} data-testid="estapproval-audit">
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Audit Log</h2>
          {(auditLog as any[]).map((entry: any, i: number) => (
            <div key={i} className={s.auditEntry}>
              <span className={s.auditTime}>{entry.createdAt}</span>
              <span>{entry.action} by {entry.userId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
