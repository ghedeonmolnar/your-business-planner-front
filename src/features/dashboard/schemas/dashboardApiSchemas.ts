import { z } from 'zod';
import { DashboardSummary } from '@/features/dashboard/types';

export const dashboardSummarySchema: z.ZodType<DashboardSummary> = z.object({
  upcoming_events_count: z.number().int().nonnegative(),
  projected_balance_due: z.number(),
  monthly_balance_due: z
    .array(
      z.object({
        month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
        balance_due: z.number().nonnegative(),
      }),
    )
    .default([]),
});
