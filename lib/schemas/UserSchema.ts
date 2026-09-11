import * as z from 'zod';

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Enter a valid email address' }));

export const createUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { error: 'Name must be at least 3 characters in length' })
      .max(30, { error: 'Name must not exceed 30 characters in length' }),
    email: emailSchema,
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters in length' })
      .max(128, { error: 'Password must not exceed 128 characters in length' }),
    confirmPassword: z.string(),
    callbackURL: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInUserSchema = z.object({
  email: emailSchema,
  password: z.string(),
  callbackURL: z.string().optional(),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});
