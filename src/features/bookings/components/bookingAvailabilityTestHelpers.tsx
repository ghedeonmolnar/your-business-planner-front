import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { Calendar } from 'react-native-calendars';
import { BookingFormEditor } from '@/features/bookings/components/BookingFormEditor';
import { CalendarSummary } from '@/features/bookings/types';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

const halls = [
  { id: 'hall-1', name: 'Sala Imperial', is_active: true },
  { id: 'hall-2', name: 'Sala Garden', is_active: true },
];

export function summary(params: URLSearchParams): CalendarSummary {
  const first = dayjs(params.get('date_from'));
  const last = dayjs(
    params.get('date_to') ||
      first.add(5, 'month').endOf('month').format('YYYY-MM-DD'),
  );
  const blockedDays = params.get('hall_id') === 'hall-2' ? [18] : [13, 14];
  return {
    revision: 'a'.repeat(64),
    availability_revision: 'a'.repeat(64),
    halls,
    days: Array.from({ length: last.diff(first, 'day') + 1 }, (_, index) => {
      const date = first.add(index, 'day');
      const occupied =
        blockedDays.includes(date.date()) &&
        !(
          date.format('YYYY-MM-DD') === '2027-11-13' &&
          params.has('exclude_event_id')
        )
          ? 1
          : 0;
      return {
        date: date.format('YYYY-MM-DD'),
        confirmed: occupied,
        tentative: 0,
        occupied_halls: occupied,
        free: 1 - occupied,
      };
    }),
  };
}

export function mockBookingCalendar(
  loadCalendar: (params: URLSearchParams) => Promise<Response>,
  loadRevision = () =>
    Promise.resolve(
      jsonResponse(200, {
        revision: 'a'.repeat(64),
        availability_revision: 'a'.repeat(64),
      }),
    ),
) {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    if (path.endsWith('/calendar/revision')) return loadRevision();
    if (path.includes('/calendar?'))
      return loadCalendar(new URL(path).searchParams);
    return Promise.resolve(paginatedResponse(halls));
  }) as typeof globalThis.fetch;
}

export const field = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(DatePickerField);
export const calendar = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(Calendar);
export const calendarRequests = () =>
  (globalThis.fetch as jest.Mock).mock.calls
    .map(([url]) => String(url))
    .filter(url => url.includes('/calendar?'));

export async function openCalendar(
  renderer: ReactTestRenderer.ReactTestRenderer,
) {
  await ReactTestRenderer.act(async () => {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: 'Data evenimentului' })
      .find(node => typeof node.props.onPress === 'function');
    if (!button) throw new Error('Lipsește câmpul pentru data evenimentului.');
    button.props.onPress();
  });
}

export async function mount(edit = false) {
  const result = await renderWithProviders(
    <BookingFormEditor
      date="2027-11-13"
      hallId="hall-1"
      booking={edit ? plannerBooking : undefined}
      onClose={jest.fn()}
    />,
  );
  await waitForUi(() =>
    expect(
      result.renderer.root
        .findAllByType(SearchableSelect)
        .find(select => select.props.label === 'Sală')?.props.options,
    ).toHaveLength(2),
  );
  return result;
}
