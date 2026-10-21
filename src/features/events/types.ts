import { Mascot } from '@/features/mascots/types';
import { Employee, EmployeeGender } from '@/features/employees/types';
import { CommunicationChannel } from '@/shared/types/contact';
import { MapLocation } from '@/shared/types/mapLocation';

export type EventStatus =
  'partial_details' | 'confirmed' | 'completed' | 'cancelled';

export type EventAssignment = {
  mascot_id: string;
  employee_id: string | null;
  mascot_name?: string | null;
  employee_name?: string | null;
};

export type Event = {
  id: string;
  client_id: string | null;
  client_contact_id?: string | null;
  communication_channel?: CommunicationChannel | null;
  contact_value?: string | null;
  contact_phone?: string | null;
  employee_id: string | null;
  employee_ids?: string[];
  mascot_id: string | null;
  mascot_ids?: string[];
  date: string;
  event_month?: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes?: number;
  price_per_hour: number;
  transport_cost?: number;
  employee_hourly_rate?: number;
  total_amount?: number;
  employee_cost?: number;
  profit_amount?: number;
  paid_amount?: number;
  outgoing_amount?: number;
  cash_profit_amount?: number;
  balance_due?: number;
  payments_count?: number;
  documents_count?: number;
  location: string | null;
  address?: string | null;
  map_location?: MapLocation | null;
  type: string;
  status?: EventStatus;
  rating?: number | null;
  assignments?: EventAssignment[];
  employees?: Employee[];
  mascot?: Mascot | null;
  mascots?: Mascot[];
  notes?: string | null;
};

export type EventPayload = {
  communication_channel?: CommunicationChannel;
  contact_value?: string | null;
  contact_phone?: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  price_per_hour: number;
  transport_cost: number;
  location: string | null;
  address: string | null;
  type: string;
  status: EventStatus;
  assignments: EventAssignment[];
  notes?: string;
};

export type EventTimeframe = 'upcoming' | 'past' | 'all';

export type EventListFilters = {
  date_from?: string;
  date_to?: string;
  status?: EventStatus;
  timeframe?: EventTimeframe;
};

export type AvailabilityQuery = {
  date: string;
  start_time: string;
  end_time: string;
  exclude_event_id?: string;
};

export type AvailabilityConflict = {
  event_id: string;
  location: string | null;
  start_time: string;
  end_time: string;
};

export type AvailabilityDayEvent = {
  id: string;
  employee_id: string | null;
  employee_ids?: string[];
  employee_name?: string | null;
  employee_names?: string[];
  mascot_id: string | null;
  mascot_ids?: string[];
  mascot_name?: string | null;
  mascot_names?: string[];
  location: string | null;
  status: EventStatus;
  start_time: string | null;
  end_time: string | null;
};

export type AvailabilityEmployee = {
  id: string;
  name: string;
  gender?: EmployeeGender | null;
  hourly_rate: number | null;
  is_available: boolean;
  availability_status?: 'available' | 'busy';
  conflict: AvailabilityConflict | null;
  warnings?: string[];
};

export type AvailabilityMascot = {
  id: string;
  name: string;
  price_per_hour: number;
  is_available: boolean;
  conflict: AvailabilityConflict | null;
};

export type AvailabilitySummary = {
  date: string;
  start_time: string;
  end_time: string;
  events: AvailabilityDayEvent[];
  employees: AvailabilityEmployee[];
  mascots: AvailabilityMascot[];
};

export type EventPaymentType = 'incoming' | 'outgoing';
export type EventPaymentStatus = 'pending' | 'completed' | 'cancelled';

export type EventPaymentOvertime = {
  duration_minutes: number;
  hourly_rate: number;
  employee_ids: string[];
};

export type EventPayment = {
  id: string;
  event_id: string;
  type: EventPaymentType;
  category: string;
  amount: number;
  overtime?: (EventPaymentOvertime & { amount: number }) | null;
  paid_at: string;
  method?: string | null;
  status: EventPaymentStatus;
  notes?: string | null;
};

export type EventPaymentPayload = {
  type: EventPaymentType;
  category: string;
  amount: number;
  paid_at: string;
  method?: string | null;
  status: EventPaymentStatus;
  notes?: string | null;
  rating?: number | null;
  overtime?: EventPaymentOvertime | null;
};

export type EventReview = {
  event_id: string;
  url: string;
  share_message: string;
  submitted_at: string | null;
  reviewer_name: string | null;
  source: string | null;
  source_details: string | null;
  entertainers_rating: number | null;
  entertainers_comment: string | null;
  improvement_suggestion: string | null;
  website_consent: boolean | null;
};

export type ReviewNotification = {
  id: string;
  event_id: string;
  reviewer_name: string;
  submitted_at: string;
  delivered_at: string | null;
};

export type EventDocumentType = 'contract' | 'invoice' | 'other';

export type EventDocument = {
  id: string;
  event_id: string;
  document_type: EventDocumentType;
  title: string;
  original_name: string;
  mime_type?: string | null;
  size_bytes: number;
  document_date?: string | null;
  notes?: string | null;
};

export type EventDocumentMetadataPayload = {
  document_type: EventDocumentType;
  title: string;
  document_date?: string | null;
  notes?: string | null;
};
