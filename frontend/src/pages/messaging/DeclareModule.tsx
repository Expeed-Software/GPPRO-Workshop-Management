import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { declareApi } from '../../api/messaging';
import s from './Messaging.module.css';

const schema = z.object({
  Ordr: z.string().min(1, 'Order/code required'),
  Remarks: z.string().min(1, 'Remarks required'),
});
type Form = z.infer<typeof schema>;

export default function DeclareModule() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const { data: items = [], isLoading } = useQuery({ queryKey: ['declare-items'], queryFn: () => declareApi.list() });
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const createMut = useMutation({ mutationFn: declareApi.create, onSuccess: () => { reset(); qc.invalidateQueries({ queryKey: ['declare-items'] }); } });
  const updateMut = useMutation({ mutationFn: ({ id, ...d }: any) => declareApi.update(id, d), onSuccess: () => { setEditing(null); reset(); qc.invalidateQueries({ queryKey: ['declare-items'] }); } });
  const deleteMut = useMutation({ mutationFn: declareApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['declare-items'] }) });

  const onEdit = (item: any) => { setEditing(item); setValue('Ordr', item.Ordr); setValue('Remarks', item.Remarks); };
  const onSubmit = (d: Form) => editing ? updateMut.mutate({ id: editing.AdditionalRemarksId, ...d }) : createMut.mutate(d);

  return (
    <div data-testid="declare-module-page" className={s.page}>
      <div className={s.header}><h1 className={s.title}>Declare Items</h1></div>
      <div className={s.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label>Order / Code</label>
              <input {...register('Ordr')} placeholder="Order/Code" />
              {errors.Ordr && <span className={s.fieldError}>{errors.Ordr.message}</span>}
            </div>
            <div className={s.field}>
              <label>Remarks</label>
              <input {...register('Remarks')} placeholder="Remarks" />
              {errors.Remarks && <span className={s.fieldError}>{errors.Remarks.message}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} data-testid="declare-add-btn">{editing ? 'Update Item' : 'Add Item'}</button>
            {editing && <button type="button" className={`${s.btn} ${s.btnSecondary}`} onClick={() => { setEditing(null); reset(); }}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className={s.card}>
        {isLoading ? <div className={s.skeleton} style={{ height: '80px' }} /> : (items as any[]).length === 0 ? (
          <div className={s.empty}>No declared items.</div>
        ) : (
          <table className={s.table} data-testid="declare-table">
            <thead><tr><th>Order/Code</th><th>Remarks</th><th>Actions</th></tr></thead>
            <tbody>
              {(items as any[]).map((item: any, i: number) => (
                <tr key={i}>
                  <td>{item.Ordr}</td><td>{item.Remarks}</td>
                  <td style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className={`${s.btn} ${s.btnSecondary}`} style={{ fontSize: '0.75rem' }} data-testid="declare-edit-btn" onClick={() => onEdit(item)}>Edit</button>
                    <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: '0.75rem' }} data-testid="declare-delete-btn" onClick={() => deleteMut.mutate(String(item.AdditionalRemarksId))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
