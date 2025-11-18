import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים'),
});

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'סיסמה היא שדה חובה'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
