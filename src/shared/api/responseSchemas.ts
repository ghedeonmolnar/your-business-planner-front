import { z } from 'zod';

export const messageResponseSchema = z.object({
  message: z.string(),
});

export const actionResponseSchema = z.union([
  z.object({ status: z.enum(['deleted', 'archived']) }),
  messageResponseSchema,
]);

export const identifierSchema = z.string().min(1);
export const nullableStringSchema = z.string().nullable();
