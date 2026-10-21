export type DistributionItem = {
  label: string;
  count: number;
  percent: number;
};

export type BusinessReport = {
  revenue_amount: number;
  advance_amount: number;
  outstanding_amount: number;
  team_cost_amount: number;
  transport_amount: number;
  profit_amount: number | null;
  profit_margin_percent: number | null;
  average_revenue_per_event: number | null;
  events: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
    cancellation_rate_percent: number;
  };
  clients: {
    active: number;
    new: number;
    returning: number;
    returning_rate_percent: number;
  };
  locations: DistributionItem[];
  event_types: DistributionItem[];
  client_sources: DistributionItem[];
  weekdays: DistributionItem[];
  mascots: { mascot_id: string; mascot_name: string; events_count: number }[];
  team: {
    employee_id: string;
    employee_name: string;
    events_count: number;
    worked_hours: number;
    cost_amount: number;
    profit_share_amount: number | null;
  }[];
  ratings: {
    internal_average: number | null;
    internal_count: number;
    client_average: number | null;
    client_count: number;
  };
};

export type ReportComparison = {
  previous_month: string;
  revenue_change_percent: number | null;
  profit_change_percent: number | null;
  events_change_percent: number | null;
};

export type MonthlyBusinessReport = BusinessReport & {
  month: string;
  comparison: ReportComparison;
};

export type AnnualBusinessSummary = BusinessReport & {
  year: number;
  best_month: { month: string; revenue_amount: number } | null;
  busiest_month: { month: string; events_count: number } | null;
};

export type AnalyticsYearReport = {
  year: number;
  available_years: number[];
  summary: AnnualBusinessSummary;
  months: MonthlyBusinessReport[];
};
