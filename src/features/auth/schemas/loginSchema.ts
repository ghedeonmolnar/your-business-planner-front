import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().email('Completează un email valid.'),
  password: z.string().min(1, 'Parola este obligatorie.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
