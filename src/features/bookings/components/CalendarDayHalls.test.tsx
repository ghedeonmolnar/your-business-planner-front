import React from 'react';
import { CalendarDayHalls } from '@/features/bookings/components/CalendarDayHalls';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

const mockQuery = {
  data: undefined as { pages: { items: never[] }[] } | undefined,
  isLoading: false,
  isSuccess: false,
  isError: false,
  fetchStatus: 'paused' as 'paused' | 'idle',
  dataUpdatedAt: 0,
  isFetching: false,
  isFetchNextPageError: false,
  error: null,
  refetch: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/features/bookings/hooks/useBookings', () => ({
  useHallDay: () => mockQuery,
}));
jest.mock('@/features/catalogs/hooks/useCatalogs', () => ({
  useCatalogs: () => ({ data: undefined, error: null, refetch: jest.fn() }),
}));

test('ziua neîncărcată offline nu este prezentată ca lipsă de săli', async () => {
  mockQuery.data = undefined;
  mockQuery.fetchStatus = 'paused';
  mockQuery.isSuccess = false;
  const { renderer, unmount } = await renderWithProviders(
    <CalendarDayHalls date="2026-11-01" onReserve={jest.fn()} />,
  );
  try {
    const text = JSON.stringify(renderer.toJSON());
    expect(text).toContain('Datele zilei nu sunt disponibile fără conexiune');
    expect(text).not.toContain('Nicio sală disponibilă');
    expect(text).not.toContain('Adaugă o sală din Mai multe');
  } finally {
    await unmount();
  }
});

test('răspunsul reușit și gol permite afișarea stării fără săli', async () => {
  mockQuery.data = { pages: [{ items: [] }] };
  mockQuery.fetchStatus = 'idle';
  mockQuery.isSuccess = true;
  const { renderer, unmount } = await renderWithProviders(
    <CalendarDayHalls date="2026-11-01" onReserve={jest.fn()} />,
  );
  try {
    expect(JSON.stringify(renderer.toJSON())).toContain(
      'Nicio sală disponibilă',
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      'Datele zilei nu sunt disponibile fără conexiune',
    );
  } finally {
    await unmount();
  }
});

test('datele deja încărcate offline sunt marcate ca imposibil de reverificat', async () => {
  mockQuery.data = { pages: [{ items: [] }] };
  mockQuery.fetchStatus = 'paused';
  mockQuery.isSuccess = true;
  mockQuery.dataUpdatedAt = Date.parse('2026-10-30T12:00:00Z');
  const { renderer, unmount } = await renderWithProviders(
    <CalendarDayHalls date="2026-11-01" onReserve={jest.fn()} />,
  );
  try {
    expect(JSON.stringify(renderer.toJSON())).toContain(
      'Fără conexiune. Datele nu pot fi reverificate',
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      'Datele zilei nu sunt disponibile fără conexiune',
    );
  } finally {
    await unmount();
  }
});
