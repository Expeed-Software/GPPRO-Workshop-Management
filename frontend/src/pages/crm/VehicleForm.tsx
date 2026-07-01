import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/customers';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './CrmList.module.css';

const schema = z.object({
  regNo: z.string().min(1, 'Registration number is required.'),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  custId: z.string().min(1, 'Customer link is required (BR-25).'),
  vin: z.string().optional(),
  color: z.string().optional(),
});

export const VehicleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
  });

  const { data } = useQuery({ queryKey: ['vehicle', id], queryFn: () => vehiclesApi.getById(Number(id)), enabled: isEdit });
  useEffect(() => { if (data?.data) { const v = data.data as any; reset({ regNo: v.VehNo || v.RegNo || v.regNo, make: v.Make || v.make || '', model: v.RegType || v.Model || v.model || '', year: String(v.ManYear || v.Year || v.year || ''), custId: String(v.Ccode || v.CustId || v.custId || ''), vin: v.EngineNo || v.VIN || v.vin || '', color: v.Colour || v.Color || v.color || '' }); } }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (d: any) => isEdit ? vehiclesApi.update(Number(id), { ...d, custId: Number(d.custId) }) : vehiclesApi.create({ ...d, custId: Number(d.custId) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); navigate('/crm/vehicles'); },
    onError: (err: any) => setApiError(err?.response?.data?.error?.message || 'Failed to save vehicle.'),
  });

  return (
    <div data-testid="vehicle-form-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Edit Vehicle' : 'New Vehicle'}</h1>
        <p className={styles.subtitle}>{isEdit ? 'Update vehicle details' : 'Add a new vehicle and link to a customer'}</p>
      </div>
      <div className={styles.formCard}>
        {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}
        <form onSubmit={handleSubmit((d) => { setApiError(''); mutation.mutate(d); })} noValidate>
          <div className={styles.formGrid}>
            <Input label="Reg No *" placeholder="e.g. ABC-1234" data-testid="vehicle-regno-input" error={errors.regNo?.message as string} {...register('regNo')} />
            <Input label="Customer ID *" placeholder="Customer ID (BR-25)" data-testid="vehicle-custid-input" error={errors.custId?.message as string} hint="Vehicle must be linked to one customer" {...register('custId')} />
            <Input label="Make" placeholder="e.g. Toyota" data-testid="vehicle-make-input" {...register('make')} />
            <Input label="Model" placeholder="e.g. Corolla" data-testid="vehicle-model-input" {...register('model')} />
            <Input label="Year" placeholder="e.g. 2022" data-testid="vehicle-year-input" {...register('year')} />
            <Input label="Color" placeholder="e.g. White" data-testid="vehicle-color-input" {...register('color')} />
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <Input label="VIN" placeholder="Vehicle Identification Number" data-testid="vehicle-vin-input" {...register('vin')} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/crm/vehicles')}>Cancel</Button>
            <Button type="submit" loading={isSubmitting || mutation.isPending} data-testid="vehicle-submit-button">{isEdit ? 'Save Changes' : 'Add Vehicle'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
