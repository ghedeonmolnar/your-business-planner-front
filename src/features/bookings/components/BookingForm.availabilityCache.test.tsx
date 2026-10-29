import ReactTestRenderer from 'react-test-renderer';
import { onlineManager } from '@tanstack/react-query';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { jsonResponse } from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { clearCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';
import { queryKeys } from '@/shared/api/queryKeys';
import { invalidatePlannerBooking } from '@/shared/api/queryInvalidation';
import {
  calendar,
  calendarRequests,
  mockBookingCalendar,
  mount,
  openCalendar,
  summary,
} from '@/features/bookings/components/bookingAvailabilityTestHelpers';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

let revision: string;
beforeEach(async () => {
  onlineManager.setOnline(true);
  await clearCalendarAvailability();
  revision = 'a'.repeat(64);
  mockBookingCalendar(
    params =>
      Promise.resolve(
        jsonResponse(200, {
          ...summary(params),
          availability_revision: revision,
        }),
      ),
    () =>
      Promise.resolve(
        jsonResponse(200, { revision, availability_revision: revision }),
      ),
  );
});
afterEach(() => onlineManager.setOnline(true));

test('navigarea în cele șase luni nu reîncarcă sumarul, iar depășirea intervalului încarcă următorul bloc', async () => {
  const { renderer, unmount } = await mount();
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    for (const month of [
      '2027-12',
      '2028-01',
      '2028-02',
      '2028-03',
      '2028-04',
    ]) {
      await ReactTestRenderer.act(async () =>
        calendar(renderer).props.onMonthChange({ dateString: `${month}-01` }),
      );
      expect(calendar(renderer).props.disabledByDefault).toBe(false);
    }
    expect(calendarRequests()).toHaveLength(1);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({ dateString: '2028-05-01' }),
    );
    await waitForUi(() => expect(calendarRequests()).toHaveLength(2));
    expect(new URL(calendarRequests()[1]).searchParams.get('date_to')).toBe(
      '2028-10-31',
    );
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({ dateString: '2027-11-01' }),
    );
    expect(calendarRequests()).toHaveLength(2);
  } finally {
    await unmount();
  }
});

test('o nouă instanță a aplicației restaurează cache-ul fără reîncărcarea sumarului când revizia este aceeași', async () => {
  const first = await mount();
  await openCalendar(first.renderer);
  await waitForUi(() =>
    expect(calendar(first.renderer).props.disabledByDefault).toBe(false),
  );
  await first.unmount();
  const second = await mount();
  try {
    await openCalendar(second.renderer);
    await waitForUi(() =>
      expect(calendar(second.renderer).props.disabledByDefault).toBe(false),
    );
    expect(calendarRequests()).toHaveLength(1);
    expect(
      calendar(second.renderer).props.markedDates['2027-11-14'].disabled,
    ).toBe(true);
  } finally {
    await second.unmount();
  }
});

test('o modificare locală și o revizie schimbată de coleg reîncarcă doar disponibilitatea activă', async () => {
  const { renderer, queryClient, unmount } = await mount();
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    revision = 'b'.repeat(64);
    await ReactTestRenderer.act(async () =>
      invalidatePlannerBooking(queryClient, 'company-1', 'event-1'),
    );
    await waitForUi(() => expect(calendarRequests()).toHaveLength(2));
    await waitForUi(() =>
      expect(
        renderer.root.findByType(DatePickerField).props.availability.loading,
      ).toBe(false),
    );
    revision = 'c'.repeat(64);
    await ReactTestRenderer.act(async () => {
      await queryClient.fetchQuery({
        queryKey: queryKeys.planner.calendarRevision('company-1'),
      });
    });
    await waitForUi(() => expect(calendarRequests()).toHaveLength(3));
    await ReactTestRenderer.act(async () => {
      await queryClient.fetchQuery({
        queryKey: queryKeys.planner.calendarRevision('company-1'),
      });
    });
    expect(calendarRequests()).toHaveLength(3);
  } finally {
    await unmount();
  }
});

test('cache-ul permite alegerea fără conexiune și blochează lunile necunoscute', async () => {
  const { renderer, unmount } = await mount();
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-15' }),
    );
    await ReactTestRenderer.act(async () => onlineManager.setOnline(false));
    await openCalendar(renderer);
    expect(
      renderer.root.findByType(DatePickerField).props.availability.unverified,
    ).toBe(true);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-16' }),
    );
    expect(renderer.root.findByType(DatePickerField).props.value).toBe(
      '2027-11-16',
    );
    await openCalendar(renderer);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({
        dateString: '2028-05-01',
      }),
    );
    expect(calendar(renderer).props.disabledByDefault).toBe(true);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2028-05-16' }),
    );
    expect(renderer.root.findByType(DatePickerField).props.value).toBe(
      '2027-11-16',
    );
    expect(calendarRequests()).toHaveLength(1);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({
        dateString: '2027-11-01',
      }),
    );
    await ReactTestRenderer.act(async () => onlineManager.setOnline(true));
    await waitForUi(() =>
      expect(
        renderer.root.findByType(DatePickerField).props.availability
          .unverified,
      ).toBe(false),
    );
    expect(calendarRequests()).toHaveLength(1);
  } finally {
    await unmount();
  }
});
