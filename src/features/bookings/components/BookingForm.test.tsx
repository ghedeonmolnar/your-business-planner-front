import React from 'react';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { renderedText } from '@/shared/test/renderedText';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { catalogsFixture } from '@/shared/test/apiFixtures';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('păstrează numele sălii alese din calendar când directorul încărcat nu o conține', async () => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (path.endsWith('/catalogs'))
      return Promise.resolve(jsonResponse(200, catalogsFixture));
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <BookingForm
      date="2027-11-13"
      hallId="hall-25"
      selectedHall={{
        id: 'hall-25',
        name: 'Sala din pagina a doua',
        is_active: true,
      }}
      onClose={() => undefined}
    />,
  );
  await waitForUi(() =>
    expect(
      renderer.root.findAllByType(SearchableSelect).length,
    ).toBeGreaterThan(0),
  );
  const hall = renderer.root
    .findAllByType(SearchableSelect)
    .find(field => field.props.label === 'Sală');
  expect(hall?.props.selectedValues).toEqual(['hall-25']);
  expect(renderer.root.findByType(FormModalFrame).props.progress).toEqual({
    current: 1,
    total: 4,
  });
  expect(renderedText(renderer)).toContain('1/4');
  expect(renderedText(renderer)).not.toContain('Pasul');
  expect(renderedText(renderer)).not.toContain('Orele sunt în fusul României.');
  expect(hall?.props.options).toEqual(
    expect.arrayContaining([{ id: 'hall-25', name: 'Sala din pagina a doua' }]),
  );
  await unmount();
});

test('editarea păstrează pasul Personal și progresul din cinci pași', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      String(url).endsWith('/me')
        ? jsonResponse(200, plannerAccount)
        : String(url).endsWith('/catalogs')
          ? jsonResponse(200, catalogsFixture)
          : paginatedResponse([]),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(
    <BookingForm
      date={plannerBooking.date}
      booking={plannerBooking}
      onClose={() => undefined}
    />,
  );
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(FormModalFrame)).toHaveLength(1),
    );
    expect(renderer.root.findByType(FormModalFrame).props.progress).toEqual({
      current: 1,
      total: 5,
    });
  } finally {
    await unmount();
  }
});
