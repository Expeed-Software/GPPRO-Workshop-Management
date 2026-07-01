import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/auth';
import styles from './UserForm.module.css';

const createSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email.').min(1, 'Email is required.'),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required.'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters.')
    .regex(/[A-Z]/, 'Password must include uppercase.')
    .regex(/[a-z]/, 'Password must include lowercase.')
    .regex(/[0-9]/, 'Password must include a number.')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character.'),
  status: z.string().default('active'),
});

const editSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Enter a valid email.'),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required.'),
  status: z.string(),
});

const ROLES = ['Administrator', 'Supervisor', 'Standard User'];

export const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const qc = useQueryClient();
  const { hasAnyRole } = useAuthStore();
  const isAdmin = hasAnyRole(['Administrator']);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const schema = isEdit ? editSchema : createSchema;
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: { roles: ['Standard User'], status: 'active' },
  });

  const { data: userRes, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (userRes?.data) {
      const u = userRes.data as any;
      reset({ name: u.name, email: u.email, phone: u.phone || '', roles: u.roles, status: u.status });
    }
  }, [userRes, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setSuccess('User created successfully.');
      setTimeout(() => navigate('/admin/users'), 1500);
    },
    onError: (err: any) => {
      setApiError(err?.response?.data?.error?.message || 'Failed to create user.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setSuccess('User updated successfully.');
      setTimeout(() => navigate('/admin/users'), 1500);
    },
    onError: (err: any) => {
      setApiError(err?.response?.data?.error?.message || 'Failed to update user.');
    },
  });

  const onSubmit = (data: any) => {
    setApiError('');
    setSuccess('');
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  if (isEdit && loadingUser) {
    return <div className={styles.loading}>Loading user...</div>;
  }

  return (
    <div data-testid="user-management-form" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{isEdit ? 'Edit User' : 'Create New User'}</h1>
        <p className={styles.subtitle}>{isEdit ? 'Update user details and permissions' : 'Add a new user to the system'}</p>
      </div>

      <div className={styles.formCard}>
        {success && <div className={styles.successBanner} role="status">{success}</div>}
        {apiError && <div className={styles.errorBanner} role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGrid}>
            <Input
              label="Full Name"
              placeholder="e.g. John Smith"
              data-testid="user-form-name-input"
              error={errors.name?.message as string}
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john.smith@company.com"
              data-testid="user-form-email-input"
              error={errors.email?.message as string}
              {...register('email')}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+971 50 000 0000"
              data-testid="user-form-phone-input"
              error={errors.phone?.message as string}
              {...register('phone')}
            />

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Status</label>
              <select className={styles.select} data-testid="user-form-status-select" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {!isEdit && (
              <div className={styles.fullWidth}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 10 chars, upper/lower/number/symbol"
                  data-testid="user-form-password-input"
                  error={(errors as any).password?.message as string}
                  hint="Min 10 characters, must include uppercase, lowercase, number, and special character"
                  {...register('password')}
                />
              </div>
            )}

            {isAdmin && (
              <div className={styles.fullWidth}>
                <label className={styles.fieldLabel}>Roles</label>
                <div className={styles.rolesGrid} data-testid="user-form-roles">
                  {ROLES.map((role) => (
                    <label key={role} className={styles.roleCheckbox}>
                      <Controller
                        name="roles"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            value={role}
                            checked={(field.value as string[]).includes(role)}
                            onChange={(e) => {
                              const current = field.value as string[];
                              if (e.target.checked) field.onChange([...current, role]);
                              else field.onChange(current.filter((r) => r !== role));
                            }}
                          />
                        )}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
                {(errors as any).roles && (
                  <span className={styles.fieldError}>{(errors as any).roles.message as string}</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
              data-testid="user-form-submit-button"
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
