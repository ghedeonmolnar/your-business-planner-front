import { z } from 'zod';
import { toCents } from '@/shared/utils/money';

export const moneySchema = z
  .string()
  .regex(/^-?\d{1,14}(?:\.\d{1,2})?$/)
  .refine(value => Number.isSafeInteger(toCents(value)));
