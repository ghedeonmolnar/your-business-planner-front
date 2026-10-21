import { z } from 'zod';

export const directorySchema = z
  .object({
    kind: z.enum(['clients', 'employees', 'halls']),
    name: z.string().trim().min(1, 'Completează numele.').max(255),
    phone: z.string().trim().max(15, 'Telefonul este prea lung.'),
    notes: z.string().max(20000),
    job_role: z.string(),
    hourly_rate: z
      .string()
      .regex(/^\d+([.,]\d{1,2})?$/, 'Introdu o sumă validă.'),
    capacity: z.string(),
    address: z.string().max(255),
    active: z.enum(['yes', 'no']),
  })
  .superRefine((value, context) => {
    if (
      value.kind === 'halls' &&
      (!/^\d+$/.test(value.capacity) ||
        Number(value.capacity) < 1 ||
        Number(value.capacity) > 100000)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['capacity'],
        message: 'Capacitatea trebuie să fie între 1 și 100.000.',
      });
    }
  });
export type DirectoryFormValues = z.infer<typeof directorySchema>;

export const newClientSchema = z.object({
  name: z.string().trim().min(1, 'Completează numele.').max(255),
  phone: z.string().trim().max(15, 'Telefonul este prea lung.'),
});
export type NewClientValues = z.infer<typeof newClientSchema>;
