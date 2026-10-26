import { EmployeeEvent } from '@/features/employeeWorkspace/types';
import { EmployeeProfile } from '@/features/employees/types';
import { Event } from '@/features/events/types';
import { MascotProfile } from '@/features/mascots/types';

export const jsonResponse = (status: number, payload: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve(payload),
    text: () => Promise.resolve(JSON.stringify(payload)),
  }) as unknown as Response;

export const eventFixture: Event = {
  id: 'event-1',
  client_id: 'client-1',
  client_contact_id: 'contact-1',
  communication_channel: 'whatsapp',
  contact_value: '0712345678',
  contact_phone: '0712345678',
  employee_id: 'employee-1',
  employee_ids: ['employee-1'],
  mascot_id: 'mascot-1',
  mascot_ids: ['mascot-1'],
  date: '2026-10-20',
  start_time: '10:00',
  end_time: '12:00',
  duration_minutes: 120,
  price_per_hour: 150,
  transport_cost: 20,
  employee_hourly_rate: 50,
  total_amount: 320,
  employee_cost: 100,
  profit_amount: 200,
  paid_amount: 0,
  outgoing_amount: 0,
  cash_profit_amount: 0,
  balance_due: 320,
  payments_count: 0,
  documents_count: 0,
  location: 'Oradea',
  address: 'Strada Test 1',
  type: 'aniversare',
  status: 'confirmed',
  rating: null,
  assignments: [{ mascot_id: 'mascot-1', employee_id: 'employee-1' }],
  employees: [
    {
      id: 'employee-1',
      version: 1,
      name: 'Ana Test',
      gender: 'female',
      hourly_rate: 50,
      birth_date: '2000-01-01',
      is_active: true,
    },
  ],
  mascots: [
    {
      id: 'mascot-1',
      name: 'Minnie',
      slug: 'minnie',
      image_path: null,
      image_url: null,
      price_per_hour: 150,
      is_active: true,
    },
  ],
  notes: null,
};

export const employeeEventFixture: EmployeeEvent = {
  id: 'event-1',
  date: '2026-10-20',
  start_time: '10:00',
  end_time: '12:00',
  duration_minutes: 120,
  location: 'Oradea',
  address: 'Strada Test 1',
  type: 'aniversare',
  type_label: 'Aniversare',
  status: 'confirmed',
  status_label: 'Rezervat',
  client_name: 'Client Test',
  contact_phone: '0712345678',
  mascot: { id: 'mascot-1', name: 'Minnie' },
  coworkers: [],
  earnings: null,
  projected_earnings: 100,
  amount_to_collect: null,
};

export const employeeProfileFixture: EmployeeProfile = {
  id: 'employee-1',
  version: 1,
  name: 'Ana Test',
  gender: 'female',
  hourly_rate: 50,
  birth_date: '2000-01-01',
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
  total_earnings: 100,
  events: [
    {
      id: 'event-1',
      date: '2026-09-20',
      location: 'Oradea',
      address: 'Strada Test 1',
      start_time: '10:00',
      end_time: '12:00',
      duration_minutes: 120,
      earnings: 100,
      mascot_names: ['Minnie'],
    },
  ],
  account: { status: 'active', email: 'ana@example.com', expires_at: null },
};

export const mascotProfileFixture: MascotProfile = {
  id: 'mascot-1',
  name: 'Minnie',
  slug: 'minnie',
  image_path: null,
  image_url: null,
  price_per_hour: 150,
  is_active: true,
  created_at: '2026-01-01T10:00:00Z',
  total_earnings: 200,
  events: [
    {
      id: 'event-1',
      date: '2026-09-20',
      location: 'Oradea',
      address: 'Strada Test 1',
      start_time: '10:00',
      end_time: '12:00',
      duration_minutes: 120,
      earnings: 200,
      employee_names: ['Ana Test'],
    },
  ],
};

export const catalogsFixture = {
  event_types: [{ id: 'aniversare', name: 'Aniversare' }],
  client_sources: [],
  event_statuses: [{ id: 'confirmed', name: 'Rezervat' }],
  communication_channels: [{ id: 'whatsapp', name: 'WhatsApp' }],
  event_hour_times: [
    { id: '10:00', name: '10:00' },
    { id: '12:00', name: '12:00' },
  ],
  bihor_localities: [{ id: 'Oradea', name: 'Oradea' }],
};
