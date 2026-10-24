import { z } from 'zod';
import { buildContactUrl } from '@/shared/utils/contactLinks';

export const requiredPhoneSchema = z
  .string()
  .trim()
  .max(15, 'Telefonul este prea lung.')
  .refine(
    value => Boolean(buildContactUrl('call', value)),
    'Completează un număr de telefon valid.',
  );
