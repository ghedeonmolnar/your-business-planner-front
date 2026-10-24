import { AuthUser } from '@/features/auth/types';
import { Booking } from '@/features/bookings/types';

export const plannerAccount: AuthUser = {
  id: 'owner-1',
  name: 'Proprietar test',
  email: 'owner@example.test',
  role: 'owner',
  employee_id: null,
  company: {
    id: 'company-1',
    name: 'Restaurant test',
    email: null,
    phone: null,
    address: null,
  },
  subscription: {
    active: true,
    ends_at: '2099-12-31T23:59:59Z',
    suspended: false,
  },
};

export const plannerBooking: Booking = {
  id: 'event-1',
  version: 1,
  hall_id: 'hall-1',
  hall_name: 'Sala Imperial',
  client_id: 'client-1',
  client_version: 1,
  client_name: 'Client test',
  client_phone: null,
  date: '2027-11-13',
  type: 'nunta',
  status: 'confirmed',
  starts_at: '2027-11-13T16:00:00Z',
  ends_at: '2027-11-14T02:00:00Z',
  expires_at: null,
  notes: null,
  staff: [],
  minimum_guests: 200,
  final_guests: null,
  menu_price: '350.00',
  total_amount: '70000.00',
  minimum_amount: '70000.00',
  agreed_advance: '10000.00',
  paid_amount: '10000.00',
  employee_cost: '0.00',
  balance_due: '60000.00',
};
