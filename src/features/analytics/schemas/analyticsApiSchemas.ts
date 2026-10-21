import { z } from 'zod';
import { AnalyticsYearReport } from '@/features/analytics/types';

const distributionItemSchema = z.object({
  label: z.string(),
  count: z.number().int().nonnegative(),
  percent: z.number(),
});

const businessReportFields = {
  revenue_amount: z.number(),
  advance_amount: z.number(),
  outstanding_amount: z.number(),
  team_cost_amount: z.number(),
  transport_amount: z.number(),
  profit_amount: z.number().nullable(),
  profit_margin_percent: z.number().nullable(),
  average_revenue_per_event: z.number().nullable(),
  events: z.object({
    total: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    upcoming: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
    cancellation_rate_percent: z.number(),
  }),
  clients: z.object({
    active: z.number().int().nonnegative(),
    new: z.number().int().nonnegative(),
    returning: z.number().int().nonnegative(),
    returning_rate_percent: z.number(),
  }),
  locations: z.array(distributionItemSchema),
  event_types: z.array(distributionItemSchema),
  client_sources: z.array(distributionItemSchema),
  weekdays: z.array(distributionItemSchema),
  mascots: z.array(
    z.object({
      mascot_id: z.string().min(1),
      mascot_name: z.string(),
      events_count: z.number().int().nonnegative(),
    }),
  ),
  team: z.array(
    z.object({
      employee_id: z.string().min(1),
      employee_name: z.string(),
      events_count: z.number().int().nonnegative(),
      worked_hours: z.number(),
      cost_amount: z.number(),
      profit_share_amount: z.number().nullable(),
    }),
  ),
  ratings: z.object({
    internal_average: z.number().nullable(),
    internal_count: z.number().int().nonnegative(),
    client_average: z.number().nullable(),
    client_count: z.number().int().nonnegative(),
  }),
};

const monthlyReportSchema = z.object({
  ...businessReportFields,
  month: z.string(),
  comparison: z.object({
    previous_month: z.string(),
    revenue_change_percent: z.number().nullable(),
    profit_change_percent: z.number().nullable(),
    events_change_percent: z.number().nullable(),
  }),
});

const annualSummarySchema = z.object({
  ...businessReportFields,
  year: z.number().int(),
  best_month: z
    .object({ month: z.string(), revenue_amount: z.number() })
    .nullable(),
  busiest_month: z
    .object({ month: z.string(), events_count: z.number().int().nonnegative() })
    .nullable(),
});

export const analyticsYearReportSchema: z.ZodType<AnalyticsYearReport> =
  z.object({
    year: z.number().int(),
    available_years: z.array(z.number().int()),
    summary: annualSummarySchema,
    months: z.array(monthlyReportSchema),
  });
