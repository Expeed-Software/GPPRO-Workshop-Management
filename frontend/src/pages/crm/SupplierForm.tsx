import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './CrmList.module.css';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email.').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.string().default('active'),
}).refine((d) => d.phone || d.email, { message: 'At least one phone or email is required (BR-23).', path: ['phone'] });

export const SupplierForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: { status: 'active' },
  });

  const { data } = useQuery({ queryKey: ['supplier', id], queryFn: () => suppliersApi.getById(Number(id)), enabled: isEdit });
  useEffect(() => { if (data?.data) { const s = data.data as any; reset({ name: s.SuppName || s.SupplierName || s.name, phone: s.Phone1 || s.Phone || s.phone || '', email: s.Email || s.email || '', address: s.Address1 || s.Address || s.address || '', status: s.Active !== undefined ? (s.Active ? 'active' : 'inactive') : (s.Status || s.status || 'active') }); } }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (d: any) => isEdit ? suppliersApi.update(Number(id), d) : suppliersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); navigate('/crm/suppliers'); },
    onError: (err: any) => setApiError(err?.response?.data?.error?.message || 'Failed to save supplier.'),
  });

  return (
    <div data-testid="supplier-form-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Edit Supplier' : 'New Supplier'}</h1>
      </div>
      <div className={styles.formCard}>
        {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit((d) => { setApiError(''); mutation.mutate(d); })} noValidate>
          <div className={styles.formGrid}>
            <Input label="Supplier Name *" placeholder="Supplier name" data-testid="supplier-name-input" error={errors.name?.message as string} {...register('name')} />
            <Input label="Phone" type="tel" placeholder="+971 50 000 0000" data-testid="supplier-phone-input" error={errors.phone?.message as string} {...register('phone')} />
            <Input label="Email" type="email" placeholder="email@company.com" data-testid="supplier-email-input" error={errors.email?.message as string} {...register('email')} />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <select className={styles.select} {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <Input label="Address" placeholder="Street, City, Country" data-testid="supplier-address-input" {...register('address')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/crm/suppliers')}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending} data-testid="supplier-submit-button">{isEdit ? 'Save Changes' : 'Create Supplier'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
