import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EventRemindersSync } from '@/features/events/notifications/EventRemindersSync';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { syncTriggerNotifications } from '@/features/events/notifications/syncTriggerNotifications';

const mockReminderBooking = {
  ...plannerBooking,
  starts_at: '2098-11-13T16:00:00Z',
  ends_at: '2098-11-14T02:00:00Z',
};

jest.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/features/bookings/hooks/useBookingReminders', () => ({
  useBookingReminders: () => ({ data: [mockReminderBooking] }),
}));
jest.mock('@/features/events/notifications/notificationPermissions', () => ({
  ensureNotificationPermissions: () => Promise.resolve(true),
}));
jest.mock('@/features/events/notifications/syncTriggerNotifications', () => ({
  ensureChannel: () => Promise.resolve('booking-reminders'),
  syncTriggerNotifications: jest.fn(() => Promise.resolve(1)),
}));

test('staff reminders use full timestamps and exclude payment reminders', async () => {
  jest.clearAllMocks();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventRemindersSync enabled role="employee" />,
    );
  });
  const planned =
    jest.mocked(syncTriggerNotifications).mock.calls[0]?.[2] ?? [];
  expect(planned).toHaveLength(3);
  expect(
    planned.every(notification => !notification.id.endsWith('-payment')),
  ).toBe(true);
  expect(
    planned.every(notification => notification.eventId === plannerBooking.id),
  ).toBe(true);
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
