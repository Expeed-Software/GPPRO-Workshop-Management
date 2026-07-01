import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters.')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must include at least one number.')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must include at least one special character.'
  );

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.errors.map((e) => e.message),
  };
}
