export type DashboardSummary = {
  upcoming_events_count: number;
  projected_balance_due: number;
  monthly_balance_due: Array<{ month: string; balance_due: number }>;
};
