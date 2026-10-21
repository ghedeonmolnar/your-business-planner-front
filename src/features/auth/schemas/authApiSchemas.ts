import { z } from 'zod';
import {
  AuthUser,
  LoginResponse,
  MessageResponse,
} from '@/features/auth/types';
import { messageResponseSchema } from '@/shared/api/responseSchemas';

export const authUserSchema: z.ZodType<AuthUser> = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['owner', 'admin', 'employee']),
  company: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      address: z.string().nullable(),
    })
    .nullable()
    .optional(),
  business_category: z
    .object({
      code: z.enum(['VENUE', 'ENTERTAINMENT', 'PHOTO_VIDEO', 'RENTAL']),
      name: z.string(),
    })
    .nullable()
    .optional(),
  features: z
    .array(z.enum(['staff', 'documents', 'finance', 'reminders']))
    .optional(),
  plan: z
    .object({
      id: z.string().nullable(),
      name: z.string(),
      user_limit: z.number().int().positive().nullable(),
      users_used: z.number().int().nonnegative(),
    })
    .nullable()
    .optional(),
  trial: z
    .object({
      days: z.number().int().nonnegative(),
      started_at: z.string().nullable(),
      ends_at: z.string().nullable(),
    })
    .nullable()
    .optional(),
  subscription: z
    .object({
      active: z.boolean(),
      ends_at: z.string().nullable(),
      suspended: z.boolean(),
      trial: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  blocked: z.boolean().optional(),
  support_email: z.string().nullable().optional(),
  support_phone: z.string().nullable().optional(),
  employee_id: z.string().nullable(),
});

export const loginResponseSchema: z.ZodType<LoginResponse> = z.object({
  token: z.string().min(1),
  user: authUserSchema.optional(),
});

export const authMessageResponseSchema: z.ZodType<MessageResponse> =
  messageResponseSchema;
