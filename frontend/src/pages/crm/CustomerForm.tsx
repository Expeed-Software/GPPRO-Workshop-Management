import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './CrmList.module.css';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email.').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('active'),
}).refine((d) => d.phone || d.email, { message: 'At least one phone or email is required (BR-23).', path: ['phone'] });

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: { status: 'active' },
  });

  const { data } = useQuery({ queryKey: ['customer', id], queryFn: () => customersApi.getById(Number(id)), enabled: isEdit });
  useEffect(() => { if (data?.data) { const c = data.data as any; reset({ name: c.CustName || c.name, phone: c.Phone1 || '', email: c.email || '', address: c.Address1 || '', notes: c.Remarks || '', status: c.Active === 0 ? 'inactive' : 'active' }); } }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (d: any) => isEdit ? customersApi.update(Number(id), d) : customersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); navigate('/crm/customers'); },
    onError: (err: any) => setApiError(err?.response?.data?.error?.message || 'Failed to save customer.'),
  });

  return (
    <div data-testid="customer-form-page" className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Customer' : 'New Customer'}</h1>
          <p className={styles.subtitle}>{isEdit ? 'Update customer details' : 'Add a new customer account'}</p>
        </div>
      </div>
      <div className={styles.formCard}>
        {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit((d) => { setApiError(''); mutation.mutate(d); })} noValidate>
          <div className={styles.formGrid}>
            <Input label="Full Name *" placeholder="Customer name" data-testid="customer-name-input" error={errors.name?.message as string} {...register('name')} />
            <Input label="Phone" type="tel" placeholder="+971 50 000 0000" data-testid="customer-phone-input" error={errors.phone?.message as string} {...register('phone')} />
            <Input label="Email" type="email" placeholder="email@company.com" data-testid="customer-email-input" error={errors.email?.message as string} {...register('email')} />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <select className={styles.select} data-testid="customer-status-select" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <Input label="Address" placeholder="Street, City, Country" data-testid="customer-address-input" error={errors.address?.message as string} {...register('address')} />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Notes</label>
              <textarea className={styles.select} rows={3} data-testid="customer-notes-input" placeholder="Additional notes..." {...register('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/crm/customers')}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending} data-testid="customer-submit-button">{isEdit ? 'Save Changes' : 'Create Customer'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
