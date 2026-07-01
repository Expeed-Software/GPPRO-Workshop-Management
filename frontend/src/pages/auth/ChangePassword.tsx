import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/Logo';
import styles from './Auth.module.css';

const changePasswordSchema = z
  .object({
    currentPwd: z.string().min(1, 'Enter your current password.'),
    newPwd: z
      .string()
      .min(10, 'Password must be at least 10 characters and include uppercase, lowercase, number, and a special character.')
      .regex(/[A-Z]/, 'Password must be at least 10 characters and include uppercase, lowercase, number, and a special character.')
      .regex(/[a-z]/, 'Password must be at least 10 characters and include uppercase, lowercase, number, and a special character.')
      .regex(/[0-9]/, 'Password must be at least 10 characters and include uppercase, lowercase, number, and a special character.')
      .regex(/[^A-Za-z0-9]/, 'Password must be at least 10 characters and include uppercase, lowercase, number, and a special character.'),
    confirmPwd: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((d) => d.newPwd === d.confirmPwd, {
    message: 'Both passwords must match.',
    path: ['confirmPwd'],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordForm) => {
    setApiError('');
    try {
      const res = await authApi.changePassword(data.currentPwd, data.newPwd);
      if (!res.success) {
        setApiError(res.error?.message || 'Could not change password. Please try again.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message;
      setApiError(msg || 'Could not change password. Please try again.');
    }
  };

  return (
    <div className={styles.pageWrapper} data-testid="change-password-form">
      <div className={styles.glassCard}>
        <div className={styles.logoArea}>
          <div className={styles.logoBackground}>
            <Logo size={44} showText={false} />
          </div>
          <h1 className={styles.title}>Change Password</h1>
          <p className={styles.subtitle}>Update your account password</p>
        </div>

        {success && (
          <div className={styles.infoBanner} role="status">
            Password changed successfully. Redirecting...
          </div>
        )}

        {apiError && (
          <div
            className={styles.errorBanner}
            data-testid="change-password-error-message"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <div
          className={styles.policyHint}
          data-testid="change-password-policy"
        >
          <span className={styles.policyTitle}>Password Requirements</span>
          <ul className={styles.policyList}>
            <li>At least 10 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.fields}>
            <div className={styles.passwordField}>
              <Input
                label="Current Password"
                placeholder="Current password"
                type={showCurrent ? 'text' : 'password'}
                data-testid="change-password-current-input"
                error={errors.currentPwd?.message}
                {...register('currentPwd')}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.passwordField}>
              <Input
                label="New Password"
                placeholder="New password"
                type={showNew ? 'text' : 'password'}
                data-testid="change-password-new-input"
                error={errors.newPwd?.message}
                {...register('newPwd')}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.passwordField}>
              <Input
                label="Confirm Password"
                placeholder="Re-type new password"
                type={showConfirm ? 'text' : 'password'}
                data-testid="change-password-confirm-input"
                error={errors.confirmPwd?.message}
                {...register('confirmPwd')}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              data-testid="change-password-submit-button"
              size="lg"
            >
              Change Password
            </Button>
          </div>

          <div className={styles.links}>
            <button
              type="button"
              className={styles.cancelBtn}
              data-testid="change-password-cancel-button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.helpButton}
              data-testid="change-password-help-button"
              aria-label="Help"
            >
              Help
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
