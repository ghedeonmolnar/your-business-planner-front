export type BookingStatus =
  'tentative' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
export type StaffAssignment = {
  id?: string;
  employee_id: string;
  employee_name?: string | null;
  job_role: string;
  pay_type: 'fixed' | 'hourly';
  rate: string;
  starts_at: string;
  ends_at: string;
  estimated_cost?: string;
};
export type Booking = {
  id: string;
  hall_id: string;
  hall_name: string | null;
  client_id: string;
  client_name: string | null;
  client_phone: string | null;
  date: string;
  type: string;
  status: BookingStatus;
  starts_at: string | null;
  ends_at: string | null;
  expires_at: string | null;
  notes: string | null;
  staff: StaffAssignment[];
  minimum_guests?: number;
  final_guests?: number | null;
  menu_price?: string;
  menu_name?: string | null;
  minimum_amount?: string;
  total_amount?: string;
  agreed_advance?: string;
  advance_due_at?: string | null;
  extra_services?: { name: string; amount: string }[];
  paid_amount?: string;
  outgoing_amount?: string;
  cash_profit_amount?: string;
  employee_cost?: string;
  balance_due?: string;
  documents_count?: number;
};
export type BookingPayload = {
  hall_id: string;
  client_id: string;
  date: string;
  type: string;
  status: Exclude<BookingStatus, 'expired'>;
  starts_at: string | null;
  ends_at: string | null;
  expires_at: string | null;
  minimum_guests: number;
  final_guests: number | null;
  menu_price: string;
  menu_name: string | null;
  agreed_advance: string;
  advance_due_at: string | null;
  extra_services: { name: string; amount: string }[];
  staff: StaffAssignment[];
  notes: string;
};
export type BookingFilters = {
  date_from?: string;
  date_to?: string;
  hall_id?: string;
  client_id?: string;
  status?: string;
};
export type BookingPaymentPayload = {
  type: 'incoming' | 'outgoing';
  category: string;
  amount: string;
  paid_at: string;
  method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
};
export type CalendarDay = {
  date: string;
  confirmed: number;
  tentative: number;
  free: number;
};
export type CalendarSummary = {
  halls: { id: string; name: string; is_active: boolean }[];
  days: CalendarDay[];
};
