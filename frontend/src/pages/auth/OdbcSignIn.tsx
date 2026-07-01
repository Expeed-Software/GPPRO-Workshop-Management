import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/Logo';
import styles from './Auth.module.css';

const odbcSchema = z.object({
  dataSource: z.string().min(1, 'Data source is required.'),
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type OdbcForm = z.infer<typeof odbcSchema>;

export const OdbcSignIn: React.FC = () => {
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OdbcForm>({ resolver: zodResolver(odbcSchema) });

  const onSubmit = async (_data: OdbcForm) => {
    setApiError('');
    setLoading(true);
    try {
      // ODBC auth stub — extend with real ODBC auth endpoint
      setApiError('ODBC authentication is configured by your administrator. Contact support.');
    } catch (err: any) {
      setApiError('ODBC authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper} data-testid="odbc-sign-in-form">
      <div className={styles.glassCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoBackground}>
            <Logo size={44} showText={false} />
          </div>
          <h1 className={styles.title}>ODBC Sign In</h1>
          <p className={styles.subtitle}>Connect via external data source</p>
        </div>

        {apiError && (
          <div
            className={styles.errorBanner}
            data-testid="odbc-sign-in-error-message"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.fields}>
            <Input
              label="Data Source Name"
              placeholder="e.g. IBOSUITE_DSN"
              type="text"
              data-testid="odbc-sign-in-datasource-input"
              error={errors.dataSource?.message}
              {...register('dataSource')}
            />
            <Input
              label="Username"
              placeholder="Database username"
              type="text"
              autoComplete="username"
              data-testid="odbc-sign-in-username-input"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Password"
              placeholder="Database password"
              type="password"
              autoComplete="current-password"
              data-testid="odbc-sign-in-password-input"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting || loading}
              data-testid="odbc-sign-in-submit-button"
              size="lg"
            >
              Connect
            </Button>
          </div>

          <div className={styles.cancelArea}>
            <Link to="/auth/sign-in" className={styles.link}>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
