import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/Logo';
import styles from './Auth.module.css';

const signInSchema = z.object({
  username: z.string().min(1, 'Username or email is required.'),
  password: z.string().min(1, 'Password is required.'),
  mfa: z.string().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const sessionExpired = searchParams.get('reason') === 'session_expired';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInForm) => {
    setApiError('');
    try {
      const res = await authApi.signIn(data.username, data.password);
      if (!res.success || !res.data) {
        setApiError(res.error?.message || 'An error occurred — please try again.');
        return;
      }

      if (res.error?.code === 'MFA_REQUIRED') {
        setMfaRequired(true);
        setPendingUserId(res.data.user?.id ?? null);
        return;
      }

      setAuth(res.data.token, res.data.refreshToken, res.data.user);

      if (res.data.user.mustChangePassword) {
        navigate('/auth/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message;
      if (code === 'ACCOUNT_LOCKED') {
        setApiError('Account locked after multiple failed attempts.');
      } else if (code === 'INVALID_CREDENTIALS') {
        setApiError('Incorrect username or password.');
      } else if (code === 'MFA_REQUIRED') {
        setMfaRequired(true);
      } else {
        setApiError(msg || 'An error occurred — please try again.');
      }
    }
  };

  return (
    <div className={styles.pageWrapper} data-testid="sign-in-form">
      <div className={styles.glassCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoBackground}>
            <Logo size={44} showText={false} />
          </div>
          <h1 className={styles.title}>GPPRO Workshop Management</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {sessionExpired && (
          <div className={styles.infoBanner} role="status">
            Session expired. Please sign in again.
          </div>
        )}

        {apiError && (
          <div
            className={styles.errorBanner}
            data-testid="sign-in-error-message"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.fields}>
            <div className={styles.fieldWrapper}>
              <Input
                label="Username or Email"
                placeholder="e.g. riya.shetty@company.com"
                type="text"
                autoComplete="username"
                data-testid="sign-in-username-input"
                error={errors.username?.message}
                {...register('username')}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <div className={styles.passwordField}>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  data-testid="sign-in-password-input"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="sign-in-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mfaRequired && (
              <div className={styles.fieldWrapper}>
                <Input
                  label="MFA Code"
                  placeholder="6-digit code"
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  data-testid="sign-in-mfa-input"
                  error={errors.mfa?.message}
                  {...register('mfa')}
                />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              data-testid="sign-in-submit-button"
              size="lg"
            >
              Sign In
            </Button>
          </div>

          <div className={styles.links}>
            <Link
              to="/auth/forgot-password"
              className={styles.link}
              data-testid="sign-in-forgot-link"
            >
              Forgot Password?
            </Link>
            <button
              type="button"
              className={styles.helpButton}
              data-testid="sign-in-help-button"
              aria-label="Help"
            >
              <HelpCircle size={15} />
              Help
            </button>
          </div>

          <div className={styles.cancelArea}>
            <button
              type="button"
              className={styles.cancelBtn}
              data-testid="sign-in-cancel-button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
