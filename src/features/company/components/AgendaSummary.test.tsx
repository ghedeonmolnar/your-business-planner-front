import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AgendaSummary } from '@/features/company/components/AgendaSummary';
import { AgendaMetric } from '@/features/company/components/AgendaMetric';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { agendaSummaryFixture } from '@/features/company/utils/agendaTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => true,
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('cele patru carduri folosesc sumarul serverului și deschid perioada și lista potrivite', async () => {
  mockNavigate.mockClear();
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      jsonResponse(
        200,
        String(url).endsWith('/me')
          ? { ...plannerAccount, features: ['finance'] }
          : agendaSummaryFixture,
      ),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AgendaSummary />);
  await waitForUi(() =>
    expect(renderer.root.findAllByType(AgendaMetric)).toHaveLength(4),
  );
  expect(renderedText(renderer)).toContain('3 rămase');
  expect(renderedText(renderer)).toContain('2 avansuri restante');
  expect(renderedText(renderer)).not.toContain('Fără avans');
  const cards = renderer.root.findAllByType(AgendaMetric);
  for (const [index, view] of [
    'events',
    'attention',
    'received',
    'due',
  ].entries()) {
    await ReactTestRenderer.act(async () => cards[index].props.onPress());
    expect(mockNavigate).toHaveBeenLastCalledWith('AgendaDetails', {
      view,
      month: '2026-10',
    });
  }
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(AppButton).props.onPress(),
  );
  expect(mockNavigate).toHaveBeenLastCalledWith('AgendaWeekend', {
    date: '2026-10-31',
  });
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) => String(url).endsWith('/agenda/summary')),
  ).toBe(true);
  await unmount();
});

test('fără modul financiar rămân indicatorii operaționali și accesul la calendar', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(
      jsonResponse(
        200,
        String(url).endsWith('/me')
          ? { ...plannerAccount, features: [] }
          : {
              ...agendaSummaryFixture,
              attention_count: 2,
              overdue_advances_count: 0,
              received_amount: null,
              due_amount: null,
              due_count: null,
            },
      ),
    ),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AgendaSummary />);
  await waitForUi(() =>
    expect(renderer.root.findAllByType(AgendaMetric)).toHaveLength(2),
  );
  expect(renderedText(renderer)).toContain(
    '2 evenimente cu meniuri de confirmat',
  );
  expect(
    renderer.root.findAllByType(AgendaMetric).map(card => card.props.label),
  ).toEqual(['Evenimente luna aceasta', 'De rezolvat']);
  await unmount();
});
