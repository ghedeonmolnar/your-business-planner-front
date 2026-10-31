import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Introdu parola actuală.').max(255),
    password: z
      .string()
      .min(8, 'Parola trebuie să aibă cel puțin 8 caractere.')
      .max(255),
    password_confirmation: z.string().min(1, 'Confirmă parola nouă.'),
  })
  .superRefine((values, context) => {
    if (values.password !== values.password_confirmation) {
      context.addIssue({
        code: 'custom',
        path: ['password_confirmation'],
        message: 'Parolele nu coincid.',
      });
    }
    if (values.password === values.current_password) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Alege o parolă diferită de cea actuală.',
      });
    }
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
