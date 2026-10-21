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
  subscription: z
    .object({
      active: z.boolean(),
      ends_at: z.string().nullable(),
      suspended: z.boolean(),
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
