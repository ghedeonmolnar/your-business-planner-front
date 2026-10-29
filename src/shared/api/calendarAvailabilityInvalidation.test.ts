import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  reconcilePlannerCalendar,
  invalidatePlannerBooking,
} from '@/shared/api/queryInvalidation';
import { CalendarAvailabilityWindow } from '@/shared/storage/calendarAvailabilitySchema';

test('tranziția temporală a calendarului nu invalidează disponibilitatea neschimbată', () => {
  const client = new QueryClient();
  const key = queryKeys.planner.dateAvailability('company-1', 'owner', {
    hall_id: 'hall-1',
    date_from: '2027-11-01',
    date_to: '2028-04-30',
  });
  const window: CalendarAvailabilityWindow = {
    owner: 'api|company-1|owner|owner|',
    hallId: 'hall-1',
    from: '2027-11-01',
    to: '2028-04-30',
    revision: 'a'.repeat(64),
    occupiedDates: [],
    invalidated: false,
    lastUsedAt: 1,
  };
  client.setQueryData(key, window);
  reconcilePlannerCalendar(
    client,
    'company-1',
    'new-day-revision',
    window.revision,
  );
  expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  reconcilePlannerCalendar(
    client,
    'company-1',
    'new-write-revision',
    'b'.repeat(64),
  );
  expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  client.clear();
});

test('modificarea locală invalidează numai disponibilitatea companiei curente', () => {
  const client = new QueryClient();
  const own = queryKeys.planner.dateAvailability('company-1', 'owner-1', {});
  const foreign = queryKeys.planner.dateAvailability(
    'company-2',
    'owner-2',
    {},
  );
  client.setQueryData(own, { revision: 'a'.repeat(64) });
  client.setQueryData(foreign, { revision: 'b'.repeat(64) });
  invalidatePlannerBooking(client, 'company-1', 'event-1');
  expect(client.getQueryState(own)?.isInvalidated).toBe(true);
  expect(client.getQueryState(foreign)?.isInvalidated).toBe(false);
  client.clear();
});
