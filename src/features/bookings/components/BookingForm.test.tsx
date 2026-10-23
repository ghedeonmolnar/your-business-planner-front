import React from 'react';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
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
  expect(hall?.props.options).toEqual(
    expect.arrayContaining([{ id: 'hall-25', name: 'Sala din pagina a doua' }]),
  );
  await unmount();
});
