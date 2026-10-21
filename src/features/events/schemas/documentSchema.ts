import { z } from 'zod';
import { isValidIsoDate } from '@/shared/utils/dateInput';

export const documentSchema = z.object({
  document_type: z.enum(['contract', 'invoice', 'other']),
  title: z.string().trim().min(1, 'Completează titlul documentului.').max(255),
  document_date: z
    .string()
    .trim()
    .refine(value => value === '' || isValidIsoDate(value), {
      message: 'Completează o dată validă.',
    }),
  notes: z.string().trim(),
});

export type DocumentFormInput = z.input<typeof documentSchema>;
export type DocumentFormValues = z.output<typeof documentSchema>;

export const emptyDocumentForm: DocumentFormInput = {
  document_type: 'contract',
  title: '',
  document_date: '',
  notes: '',
};
