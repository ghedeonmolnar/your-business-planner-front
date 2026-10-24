import { Hall } from '@/features/halls/types';

export const hallFixture: Hall = {
  id: 'hall-1',
  version: 1,
  name: 'Sala test',
  capacity: 350,
  minimum_guests: 200,
  address: null,
  is_active: true,
  description: null,
  area_sqm: null,
  arrangement: null,
  amenities: ['Scenă'],
  business_hours: [
    { weekday: 5, start_time: '18:00', end_time: '04:00', ends_next_day: true },
  ],
  setup_minutes: null,
  cleanup_minutes: null,
  internal_notes: 'Notă privată',
  future_bookings_count: 1,
  tentative_bookings_count: 0,
  has_history: true,
  permissions: {
    can_edit: true,
    can_duplicate: true,
    can_deactivate: true,
    can_delete: false,
  },
  images: [],
  next_bookings: [
    {
      id: 'event-1',
      date: '2026-10-24',
      client_name: 'Client test',
      type: 'nunta',
      status: 'confirmed',
      starts_at: '2026-10-24T15:00:00Z',
      ends_at: '2026-10-25T02:00:00Z',
    },
  ],
};
