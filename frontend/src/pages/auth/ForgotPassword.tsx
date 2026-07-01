import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/Logo';
import styles from './Auth.module.css';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address.').min(1, 'Email is required.'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    setApiError('');
    try {
      await authApi.passwordReset(data.email);
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message;
      setApiError(msg || 'An error occurred — please try again.');
    }
  };

  return (
    <div className={styles.pageWrapper} data-testid="forgot-password-form">
      <div className={styles.glassCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoBackground}>
            <Logo size={44} showText={false} />
          </div>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>
            Enter your email to receive a reset link
          </p>
        </div>

        {sent ? (
          <div>
            <div className={styles.infoBanner} role="status">
              If that email is registered, a reset link has been sent. Check your inbox.
            </div>
            <div className={styles.cancelArea} style={{ marginTop: 16 }}>
              <Link to="/auth/sign-in" className={styles.link}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {apiError && (
              <div className={styles.errorBanner} role="alert">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={styles.fields}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your.email@company.com"
                  data-testid="forgot-password-email-input"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <div className={styles.actions}>
                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  data-testid="forgot-password-submit-button"
                  size="lg"
                >
                  Send Reset Link
                </Button>
              </div>
              <div className={styles.cancelArea}>
                <Link to="/auth/sign-in" className={styles.link}>
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
