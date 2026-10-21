import { z } from 'zod';

const emailSchema = z.string().trim().email();
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s().-]+$/);
const normalizedPhoneSchema = z.string().regex(/^\+?\d{7,15}$/);

export function supportEmail(value?: string | null): string | null {
  const result = emailSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function supportPhone(value?: string | null): string | null {
  const result = phoneSchema.safeParse(value);
  if (!result.success) {
    return null;
  }
  const normalized = result.data.replace(/[\s().-]/g, '');
  return normalizedPhoneSchema.safeParse(normalized).success
    ? normalized
    : null;
}
