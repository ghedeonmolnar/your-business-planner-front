import { z } from 'zod';

export const accountInvitationSchema = z
  .object({
    name: z.string().trim().min(1, 'Completează numele.').max(255),
    email: z.string().trim().email('Completează un email valid.'),
    role: z.enum(['admin', 'employee']),
    employee_id: z.string(),
  })
  .refine(value => value.role !== 'employee' || Boolean(value.employee_id), {
    path: ['employee_id'],
    message: 'Alege persoana din personal.',
  });
export type AccountInvitationValues = z.infer<typeof accountInvitationSchema>;
