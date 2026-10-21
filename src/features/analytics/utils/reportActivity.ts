import { MonthlyBusinessReport } from '@/features/analytics/types';

export const monthHasActivity = (month: MonthlyBusinessReport) =>
  month.events.total > 0 ||
  month.events.cancelled > 0 ||
  month.revenue_amount !== 0 ||
  month.advance_amount !== 0 ||
  month.outstanding_amount !== 0;
