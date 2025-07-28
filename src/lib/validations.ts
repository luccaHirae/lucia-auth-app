import { z } from 'zod';

// User registration schema
export const registerSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// User login schema
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// 2FA verification schema
export const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.email('Invalid email address'),
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Profile update schema
export const profileUpdateSchema = z.object({
  email: z.email('Invalid email address'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
