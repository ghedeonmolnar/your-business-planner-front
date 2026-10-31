import { clearEventReminders } from '@/features/events/notifications/clearEventReminders';
import { ensureNotificationPermissions } from '@/features/events/notifications/notificationPermissions';
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
  ensureNotificationPermissions: jest.fn(() => Promise.resolve(true)),
}));
jest.mock('@/features/events/notifications/syncTriggerNotifications', () => ({
  ensureChannel: () => Promise.resolve('booking-reminders'),
  syncTriggerNotifications: jest.fn(() => Promise.resolve(1)),
}));

jest.mock('@/features/events/notifications/clearEventReminders', () => ({
  clearEventReminders: jest.fn(() => Promise.resolve()),
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

test('disabling reminders cancels scheduled notifications without asking for permissions', async () => {
  jest.clearAllMocks();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventRemindersSync enabled={false} role="owner" />,
    );
  });
  expect(clearEventReminders).toHaveBeenCalledTimes(1);
  expect(ensureNotificationPermissions).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

test('o rezervare finalizată financiar păstrează reminderele pentru evenimentul viitor', async () => {
  jest.clearAllMocks();
  const previous = mockReminderBooking.status;
  mockReminderBooking.status = 'completed';
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <EventRemindersSync enabled role="employee" />,
      );
    });
    expect(
      jest.mocked(syncTriggerNotifications).mock.calls[0]?.[2],
    ).toHaveLength(3);
  } finally {
    mockReminderBooking.status = previous;
    await ReactTestRenderer.act(async () => renderer?.unmount());
  }
});
