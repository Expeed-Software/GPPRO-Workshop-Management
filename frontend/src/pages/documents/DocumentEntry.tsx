import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../../api/documents';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './Documents.module.css';

const schema = z.object({
  docType: z.string().min(1, 'Document type is required.'),
  status: z.string().default('draft'),
  date: z.string().min(1, 'Date is required.'),
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
});

const DOC_STATUSES = ['draft', 'pending', 'approved', 'rejected', 'archived'];

export const DocumentEntry: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!docId;
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: { status: 'draft', date: new Date().toISOString().split('T')[0] },
  });

  const { data } = useQuery({ queryKey: ['document', docId], queryFn: () => documentsApi.list({ id: docId }), enabled: isEdit });
  useEffect(() => {
    if (data?.data) {
      const d = (data.data as any)?.[0];
      if (d) reset({ docType: d.docType || d.DocType, status: d.status || d.Status || 'draft', date: d.date || d.Date?.split('T')[0] || '', transactionRef: d.transactionRef || d.TransactionRef || '', remarks: d.remarks || d.Remarks || '' });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (d: any) => isEdit ? documentsApi.edit(Number(docId), d) : documentsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); navigate('/documents/list'); },
    onError: (err: any) => setApiError(err?.response?.data?.error?.message || 'Failed to save document.'),
  });

  return (
    <div data-testid="document-entry-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Document' : 'New Document'}</h1>
          <p className={styles.subtitle}>{isEdit ? 'Update document details' : 'Create a new document entry'}</p>
        </div>
      </div>
      <div className={styles.formCard}>
        {apiError && <div className={styles.errorBanner} role="alert" data-testid="docentry-error-banner">{apiError}</div>}
        <form onSubmit={handleSubmit((d) => { setApiError(''); mutation.mutate(d); })} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Document Type *</label>
              <input className={styles.select} placeholder="e.g. Invoice, Report" data-testid="docentry-type-field" {...register('docType')} />
              {errors.docType && <span style={{ fontSize: 11, color: 'var(--color-error)' }}>{errors.docType.message as string}</span>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <select className={styles.select} data-testid="docentry-status-field" {...register('status')}>
                {DOC_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <Input label="Date *" type="date" data-testid="docentry-date-field" error={errors.date?.message as string} {...register('date')} />
            <Input label="Transaction Reference" placeholder="e.g. INV-001, JOB-123" data-testid="docentry-transref-field" {...register('transactionRef')} />
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Remarks / Comments</label>
              <textarea className={styles.select} rows={4} data-testid="docentry-remarks-field" placeholder="Add remarks..." maxLength={1000} {...register('remarks')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/documents/menu')} data-testid="docentry-cancel-btn">Cancel</Button>
            {isEdit && <Button type="button" variant="danger" onClick={() => { documentsApi.delete(Number(docId)); navigate('/documents/list'); }} data-testid="docentry-delete-btn">Delete</Button>}
            <Button type="submit" loading={isSubmitting || mutation.isPending} data-testid="docentry-save-btn">{isEdit ? 'Save Changes' : 'Create Document'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
