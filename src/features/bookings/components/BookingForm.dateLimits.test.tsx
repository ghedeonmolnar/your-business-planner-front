import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { BookingFormEditor } from '@/features/bookings/components/BookingFormEditor';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import {
  calendar,
  calendarRequests,
  field,
  mockBookingCalendar,
  openCalendar,
  summary,
} from '@/features/bookings/components/bookingAvailabilityTestHelpers';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import * as dateFormatting from '@/shared/utils/formatDate';
import { clearCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';

jest.mock('@/shared/utils/formatDate', () => ({
  ...jest.requireActual<typeof import('@/shared/utils/formatDate')>(
    '@/shared/utils/formatDate',
  ),
  companyNow: jest.fn(),
}));

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(async () => {
  await clearCalendarAvailability();
  jest
    .mocked(dateFormatting.companyNow)
    .mockReturnValue(dayjs.utc('2026-10-29T00:15:00'));
  mockBookingCalendar(params =>
    Promise.resolve(jsonResponse(200, summary(params))),
  );
});
afterEach(() => jest.restoreAllMocks());

test('o rezervare nouă pornește cel mai devreme azi și blochează săgeata și gestul spre trecut', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <BookingFormEditor date="2020-01-01" hallId="hall-1" onClose={jest.fn()} />,
  );
  try {
    await waitForUi(() => expect(field(renderer).props.disabled).toBe(false));
    expect(field(renderer).props.value).toBe('2026-10-29');
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    expect(calendar(renderer).props.minDate).toBe('2026-10-29');
    expect(calendar(renderer).props.disableArrowLeft).toBe(true);
    const navigate = jest.fn();
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onPressArrowLeft(navigate),
    );
    expect(navigate).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2026-10-28' }),
    );
    expect(field(renderer).props.value).toBe('2026-10-29');
    expect(calendarRequests()).toHaveLength(1);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({ dateString: '2026-11-01' }),
    );
    expect(calendar(renderer).props.disableArrowLeft).toBe(false);
  } finally {
    await unmount();
  }
});

test('editarea unei rezervări istorice păstrează data și accesul la lunile precedente', async () => {
  jest
    .mocked(dateFormatting.companyNow)
    .mockReturnValue(dayjs.utc('2028-01-20T10:00:00'));
  const { renderer, unmount } = await renderWithProviders(
    <BookingFormEditor
      date={plannerBooking.date}
      hallId={plannerBooking.hall_id}
      booking={plannerBooking}
      onClose={jest.fn()}
    />,
  );
  try {
    await openCalendar(renderer);
    expect(field(renderer).props.value).toBe(plannerBooking.date);
    expect(calendar(renderer).props.minDate).toBeUndefined();
    expect(calendar(renderer).props.disableArrowLeft).toBe(false);
  } finally {
    await unmount();
  }
});
