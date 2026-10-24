import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingAdvancedFilters } from '@/features/bookings/components/BookingAdvancedFilters';
import { EMPTY_BOOKING_ADVANCED_FILTERS } from '@/features/bookings/schemas/bookingFilterSchema';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { DatePickerField } from '@/shared/components/DatePickerField';
import {
  getVisibleDialog,
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
});

test('offers payment filtering only when finance is enabled', async () => {
  const { renderer, unmount } = await renderWithProviders(
    <BookingAdvancedFilters
      values={EMPTY_BOOKING_ADVANCED_FILTERS}
      eventTypes={[]}
      financeEnabled={false}
      onApply={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(
    renderer.root
      .findAllByType(SearchableSelect)
      .map(field => field.props.label),
  ).toEqual(['Tipul evenimentului']);
  await unmount();
});

test('retains an invalid draft and explains an inverted interval without applying it', async () => {
  const onApply = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingAdvancedFilters
      values={{
        ...EMPTY_BOOKING_ADVANCED_FILTERS,
        date_from: '2027-12-31',
        date_to: '2027-11-01',
      }}
      eventTypes={[]}
      financeEnabled
      onApply={onApply}
      onClose={jest.fn()}
    />,
  );
  await ReactTestRenderer.act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Aplică filtrele' })
      .props.onPress(),
  );
  expect(onApply).not.toHaveBeenCalled();
  expect(getVisibleDialog(renderer)?.title).toBe('Eroare');
  expect(
    renderer.root
      .findAllByType(DatePickerField)
      .find(field => field.props.label === 'De la')?.props.value,
  ).toBe('2027-12-31');
  await unmount();
});
