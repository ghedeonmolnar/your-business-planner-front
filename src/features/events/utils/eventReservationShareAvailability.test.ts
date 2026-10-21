import { canShareEventReservation } from '@/features/events/utils/eventReservationShareAvailability';

const now = new Date('2026-10-08T12:00:00').getTime();
const event = {
  date: '2026-10-08',
  start_time: '15:00:00',
  status: 'confirmed' as const,
};

test('allows only an admin to share an event before its start', () => {
  expect(canShareEventReservation(event, 'admin', now)).toBe(true);
  expect(canShareEventReservation(event, 'employee', now)).toBe(false);
  expect(canShareEventReservation(event, undefined, now)).toBe(false);
  expect(
    canShareEventReservation(
      event,
      'admin',
      new Date('2026-10-08T15:00:00').getTime(),
    ),
  ).toBe(false);
});

test('hides sharing for past, cancelled and completed events', () => {
  expect(
    canShareEventReservation({ ...event, date: '2026-10-07' }, 'admin', now),
  ).toBe(false);
  expect(
    canShareEventReservation({ ...event, status: 'cancelled' }, 'admin', now),
  ).toBe(false);
  expect(
    canShareEventReservation({ ...event, status: 'completed' }, 'admin', now),
  ).toBe(false);
});

test('keeps a partial booking without a start time available until its day ends', () => {
  expect(
    canShareEventReservation(
      { ...event, start_time: null, status: 'partial_details' },
      'admin',
      now,
    ),
  ).toBe(true);
  expect(
    canShareEventReservation(
      { ...event, date: '2026-10-07', start_time: null },
      'admin',
      now,
    ),
  ).toBe(false);
  expect(
    canShareEventReservation({ ...event, date: 'invalid' }, 'admin', now),
  ).toBe(false);
});
