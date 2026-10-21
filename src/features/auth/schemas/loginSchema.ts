import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().email('Introdu emailul contului.'),
  password: z.string().min(1, 'Parola este obligatorie.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
