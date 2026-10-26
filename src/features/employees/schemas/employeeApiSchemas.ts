import { z } from 'zod';
import {
  Employee,
  EmployeeAccessChange,
  EmployeeInvitation,
  EmployeeProfile,
  EmployeeProfileEvent,
} from '@/features/employees/types';

export const employeeSchema: z.ZodType<Employee> = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  name: z.string(),
  gender: z.enum(['male', 'female']).nullable(),
  hourly_rate: z.number().nullable(),
  birth_date: z.string(),
  is_active: z.boolean(),
});

const employeeProfileEventSchema: z.ZodType<EmployeeProfileEvent> = z.object({
  id: z.string().min(1),
  date: z.string(),
  location: z.string().nullable(),
  address: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  duration_minutes: z.number().int().nonnegative(),
  earnings: z.number(),
  mascot_names: z.array(z.string()),
});

export const employeeProfileSchema: z.ZodType<EmployeeProfile> =
  employeeSchema.and(
    z.object({
      created_at: z.string(),
      total_earnings: z.number(),
      events: z.array(employeeProfileEventSchema),
      account: z.object({
        status: z.enum([
          'not_invited',
          'pending',
          'expired',
          'active',
          'blocked',
        ]),
        email: z.string().nullable(),
        expires_at: z.string().nullable(),
      }),
    }),
  );

export const employeeInvitationSchema: z.ZodType<EmployeeInvitation> = z.object(
  {
    status: z.literal('pending'),
    email: z.string().email(),
    expires_at: z.string(),
  },
);

export const employeeAccessChangeSchema: z.ZodType<EmployeeAccessChange> =
  z.object({
    status: z.enum(['active', 'blocked']),
    email: z.string().email(),
  });
