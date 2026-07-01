import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './CrmList.module.css';

const schema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email.').optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine((d) => d.phone || d.email, { message: 'At least one phone or email is required (BR-23).', path: ['phone'] });

export const ContactForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [apiError, setApiError] = useState('');
  const [dupWarning, setDupWarning] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
  });

  const { data } = useQuery({ queryKey: ['contact', id], queryFn: () => contactsApi.getById(Number(id)), enabled: isEdit });
  useEffect(() => { if (data?.data) { const c = data.data as any; reset({ name: c.name ?? c.ContactPerson ?? '', phone: c.phone ?? c.Phone1 ?? '', email: c.email ?? '', notes: c.notes ?? '' }); } }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (d: any) => isEdit ? contactsApi.update(Number(id), d) : contactsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); navigate('/crm/contacts'); },
    onError: (err: any) => setApiError(err?.response?.data?.error?.message || 'Failed to save contact.'),
  });

  const watchedName = watch('name');
  const watchedPhone = watch('phone');

  return (
    <div data-testid="contact-form-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Edit Contact' : 'New Contact'}</h1>
      </div>
      <div className={styles.formCard}>
        {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}
        {dupWarning && <div className={styles.errorBanner} role="alert" data-testid="contact-dup-warning">{dupWarning}</div>}
        <form onSubmit={handleSubmit((d) => { setApiError(''); setDupWarning(''); mutation.mutate(d); })} noValidate>
          <div className={styles.formGrid}>
            <Input label="Full Name *" placeholder="Contact name" data-testid="contact-name-input" error={errors.name?.message as string} {...register('name')} />
            <Input label="Phone" type="tel" placeholder="+971 50 000 0000" data-testid="contact-phone-input" error={errors.phone?.message as string} {...register('phone')} />
            <Input label="Email" type="email" placeholder="email@company.com" data-testid="contact-email-input" error={errors.email?.message as string} {...register('email')} />
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Notes</label>
              <textarea className={styles.select} rows={3} data-testid="contact-notes-input" {...register('notes')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/crm/contacts')}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending} data-testid="contact-submit-button">{isEdit ? 'Save Changes' : 'Create Contact'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
