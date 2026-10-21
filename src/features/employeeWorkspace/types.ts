import { EventStatus, EventTimeframe } from '@/features/events/types';
import { MapLocation } from '@/shared/types/mapLocation';

export type EmployeeEvent = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  location: string | null;
  address: string | null;
  map_location?: MapLocation | null;
  type: string | null;
  type_label: string | null;
  status: EventStatus;
  status_label: string;
  client_name: string | null;
  contact_phone: string | null;
  mascot: { id: string; name: string } | null;
  coworkers: Array<{ id: string; name: string }>;
  earnings: number | null;
  projected_earnings: number | null;
  amount_to_collect: number | null;
};

export type EmployeeAgendaSummary = {
  upcoming_events_count: number;
  projected_earnings: number;
};

export type EmployeeEventFilters = {
  timeframe?: EventTimeframe;
  date_from?: string;
  date_to?: string;
};

export type EmployeeStatistics = {
  period: 'month' | 'all';
  month: string | null;
  earnings: number;
  events_count: number;
  worked_minutes: number;
  top_coworker: { id: string; name: string; events_count: number } | null;
  top_mascot: { id: string; name: string; events_count: number } | null;
};
