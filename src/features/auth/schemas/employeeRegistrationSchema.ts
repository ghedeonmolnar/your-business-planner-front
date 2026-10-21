import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 10;

export const employeeRegistrationSchema = z
  .object({
    email: z.string().trim().email('Completează un email valid.'),
    code: z.string().trim().length(40, 'Copiază codul complet din invitație.'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'Parola trebuie să aibă minim 10 caractere.')
      .regex(/[a-zA-Z]/, 'Parola trebuie să conțină litere.')
      .regex(/[0-9]/, 'Parola trebuie să conțină cifre.'),
    password_confirmation: z.string().min(1, 'Confirmă parola.'),
  })
  .refine(values => values.password === values.password_confirmation, {
    message: 'Parolele nu coincid.',
    path: ['password_confirmation'],
  });

export type EmployeeRegistrationFormValues = z.infer<
  typeof employeeRegistrationSchema
>;
