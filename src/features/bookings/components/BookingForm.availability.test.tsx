import ReactTestRenderer from 'react-test-renderer';
import { Calendar } from 'react-native-calendars';
import { plannerBooking } from '@/features/bookings/utils/plannerTestFixtures';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { jsonResponse } from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { clearCalendarAvailability } from '@/shared/storage/calendarAvailabilityStorage';
import {
  calendar,
  calendarRequests,
  field,
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

let loadCalendar: (params: URLSearchParams) => Promise<Response>;

beforeEach(async () => {
  await clearCalendarAvailability();
  loadCalendar = params => Promise.resolve(jsonResponse(200, summary(params)));
  mockBookingCalendar(params => loadCalendar(params));
});

test('încarcă șase luni și refuză alegerea unei zile rezervate', async () => {
  const { renderer, unmount } = await mount();
  try {
    expect(calendarRequests()).toHaveLength(0);
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    expect(new URL(calendarRequests()[0]).searchParams.get('date_from')).toBe(
      '2027-11-01',
    );
    expect(new URL(calendarRequests()[0]).searchParams.get('date_to')).toBe(
      '2028-04-30',
    );
    expect(calendar(renderer).props.markedDates['2027-11-14']).toMatchObject({
      disabled: true,
      disableTouchEvent: true,
    });
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-14' }),
    );
    expect(field(renderer).props.value).toBe('2027-11-13');
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-15' }),
    );
    expect(field(renderer).props.value).toBe('2027-11-15');
  } finally {
    await unmount();
  }
});

test('schimbarea sălii resetează data și programul și reface disponibilitatea', async () => {
  const { renderer, unmount } = await mount(true);
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findAllByType(SearchableSelect)
        .find(select => select.props.label === 'Sală')
        ?.props.onChange(['hall-2']);
    });
    expect(field(renderer).props.value).toBe('');
    expect(renderer.root.findAllByType(Calendar)).toHaveLength(0);
    for (const name of ['starts_at', 'ends_at']) {
      expect(
        renderer.root
          .findAllByType(SearchableSelect)
          .find(input => input.props.testID === `select:${name}`)?.props
          .selectedValues,
      ).toEqual([]);
    }
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    const request = new URL(calendarRequests().slice(-1)[0]);
    expect(request.searchParams.get('hall_id')).toBe('hall-2');
    const month = request.searchParams.get('date_from')?.slice(0, 7);
    expect(calendar(renderer).props.markedDates[`${month}-18`]?.disabled).toBe(
      true,
    );
    expect(
      calendar(renderer).props.markedDates[`${month}-13`]?.disabled,
    ).toBeUndefined();
  } finally {
    await unmount();
  }
});

test('schimbarea lunii blochează alegerea până la răspuns și ignoră răspunsul lunii vechi', async () => {
  let resolveOld: (response: Response) => void = () => undefined;
  loadCalendar = params =>
    params.get('date_from') === '2027-11-01'
      ? new Promise(resolve => {
          resolveOld = resolve;
        })
      : Promise.resolve(jsonResponse(200, summary(params)));
  const { renderer, unmount } = await mount();
  try {
    await openCalendar(renderer);
    expect(calendar(renderer).props.disabledByDefault).toBe(true);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-15' }),
    );
    expect(field(renderer).props.value).toBe('2027-11-13');
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onMonthChange({ dateString: '2028-05-01' }),
    );
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    await ReactTestRenderer.act(async () =>
      resolveOld(
        jsonResponse(
          200,
          summary(
            new URLSearchParams({
              date_from: '2027-11-01',
              hall_id: 'hall-1',
            }),
          ),
        ),
      ),
    );
    expect(calendar(renderer).props.markedDates['2028-05-14']?.disabled).toBe(
      true,
    );
    expect(calendar(renderer).props.markedDates['2027-11-14']).toBeUndefined();
  } finally {
    await unmount();
  }
});

test('eroarea de disponibilitate blochează calendarul și permite reîncercarea', async () => {
  loadCalendar = () =>
    Promise.resolve(
      jsonResponse(503, { error: { code: 'SERVICE_UNAVAILABLE' } }),
    );
  const { renderer, unmount } = await mount();
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(renderer.root.findAllByType(ErrorBanner)).toHaveLength(1),
    );
    expect(calendar(renderer).props.disabledByDefault).toBe(true);
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-15' }),
    );
    expect(field(renderer).props.value).toBe('2027-11-13');
    loadCalendar = params =>
      Promise.resolve(jsonResponse(200, summary(params)));
    await ReactTestRenderer.act(async () => {
      await renderer.root.findByType(ErrorBanner).props.onRetry();
    });
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
  } finally {
    await unmount();
  }
});

test('editarea exclude rezervarea curentă și redeschiderea refolosește disponibilitatea', async () => {
  const { renderer, unmount } = await mount(true);
  try {
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    expect(
      new URL(calendarRequests()[0]).searchParams.get('exclude_event_id'),
    ).toBe(plannerBooking.id);
    expect(
      calendar(renderer).props.markedDates['2027-11-13']?.disabled,
    ).toBeUndefined();
    expect(calendar(renderer).props.markedDates['2027-11-14']?.disabled).toBe(
      true,
    );
    await ReactTestRenderer.act(async () =>
      calendar(renderer).props.onDayPress({ dateString: '2027-11-15' }),
    );
    await openCalendar(renderer);
    await waitForUi(() =>
      expect(calendar(renderer).props.disabledByDefault).toBe(false),
    );
    expect(calendarRequests()).toHaveLength(1);
  } finally {
    await unmount();
  }
});
