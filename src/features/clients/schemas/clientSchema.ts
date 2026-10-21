import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'Completează numele clientului.'),
  phone: z.string().optional(),
  oras: z.string().optional(),
  strada: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  last_contract_date: z.string().nullable().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const emptyClientForm: ClientFormValues = {
  name: '',
  phone: '',
  oras: '',
  strada: '',
  source: '',
  notes: '',
  last_contract_date: null,
};
