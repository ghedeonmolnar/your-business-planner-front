import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Completează un email valid.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email('Completează un email valid.'),
    code: z.string().regex(/^\d{6}$/, 'Codul trebuie să aibă 6 cifre.'),
    password: z.string().min(8, 'Parola trebuie să aibă minim 8 caractere.'),
    password_confirmation: z.string().min(1, 'Confirmă parola nouă.'),
  })
  .refine(values => values.password === values.password_confirmation, {
    message: 'Parolele nu coincid.',
    path: ['password_confirmation'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
