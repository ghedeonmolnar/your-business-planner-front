import React from 'react';
import { renderedText } from '@/shared/test/renderedText';
import ReactTestRenderer from 'react-test-renderer';
import { CustomersScreen } from '@/features/company/screens/CustomersScreen';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { SearchField } from '@/shared/components/SearchField';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import {
  getVisibleDialog,
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const ana = {
  id: 'client-1',
  version: 1,
  name: 'Ana',
  phone: '0720000011',
  bookings_count: 7,
};
const zoe = {
  id: 'client-2',
  version: 1,
  name: 'Zoe',
  phone: '0720000012',
  bookings_count: 3,
};

beforeEach(() => {
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    const items = path.includes('date_from=2027-01-01')
      ? []
      : path.includes('date_from=') || path.includes('search=Ana')
        ? [ana]
        : [ana, zoe];
    return Promise.resolve(paginatedResponse(items));
  }) as typeof globalThis.fetch;
});

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onPress();
  });
};

const chooseRange = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  from: string,
  to: string,
) => {
  await press(renderer, 'Filtrează după evenimente');
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByType(DatePickerField)
      .find(field => field.props.label === 'De la')
      ?.props.onChange(from);
    renderer.root
      .findAllByType(DatePickerField)
      .find(field => field.props.label === 'Până la')
      ?.props.onChange(to);
  });
};

const requests = () =>
  jest.mocked(globalThis.fetch).mock.calls.map(([url]) => String(url));

test('intervalul se aplică explicit, păstrează totalul istoric și se elimină din indicator', async () => {
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  await waitForUi(() => expect(renderedText(renderer)).toContain('Zoe'));
  expect(renderer.root.findAllByType(DatePickerField)).toHaveLength(0);
  await chooseRange(renderer, '2026-11-01', '2026-11-30');
  expect(requests().some(path => path.includes('date_from='))).toBe(false);
  await press(renderer, 'Aplică filtrul');
  await waitForUi(() => {
    expect(
      requests().some(
        path =>
          path.includes('date_from=2026-11-01') &&
          path.includes('date_to=2026-11-30'),
      ),
    ).toBe(true);
    expect(renderedText(renderer)).not.toContain('Zoe');
    expect(
      renderer.root.findAllByProps({ label: '7 rezervări' }).length,
    ).toBeGreaterThan(0);
  });
  expect(renderer.root.findAllByType(DatePickerField)).toHaveLength(0);
  expect(
    renderer.root.findAllByProps({ label: '7 rezervări' }).length,
  ).toBeGreaterThan(0);
  await press(renderer, 'Elimină filtrul de evenimente');
  await waitForUi(() => expect(renderedText(renderer)).toContain('Zoe'));
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Elimină filtrul de evenimente',
    }),
  ).toHaveLength(0);
  await unmount();
});

test('intervalul inversat afișează validare și nu trimite cererea filtrată', async () => {
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  await chooseRange(renderer, '2026-11-30', '2026-11-01');
  await press(renderer, 'Aplică filtrul');
  expect(getVisibleDialog(renderer)?.message).toContain('Data de sfârșit');
  expect(requests().some(path => path.includes('date_from='))).toBe(false);
  await unmount();
});

test('căutarea și sortarea rămân în cerere împreună cu intervalul', async () => {
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  expect(renderer.root.findAllByType(SearchField)).toHaveLength(0);
  await press(renderer, 'Caută în clienți');
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(SearchField).props.onChange('Ana');
  });
  await waitForUi(() =>
    expect(requests().some(path => path.includes('search=Ana'))).toBe(true),
  );
  await chooseRange(renderer, '2026-11-01', '2026-11-30');
  await press(renderer, 'Aplică filtrul');
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByType(SearchableSelect)
      .props.onChange(['bookings_desc']);
  });
  await waitForUi(() =>
    expect(
      requests().some(
        path =>
          path.includes('search=Ana') &&
          path.includes('sort=bookings_desc') &&
          path.includes('date_from=2026-11-01') &&
          path.includes('date_to=2026-11-30'),
      ),
    ).toBe(true),
  );
  await press(renderer, 'Închide căutarea');
  expect(renderer.root.findAllByType(SearchField)).toHaveLength(0);
  await waitForUi(() => {
    const latestRequest = requests()
      .filter(path => path.includes('/clients?'))
      .at(-1);
    expect(latestRequest).not.toContain('search=Ana');
    expect(latestRequest).toContain('sort=bookings_desc');
    expect(latestRequest).toContain('date_from=2026-11-01');
    expect(latestRequest).toContain('date_to=2026-11-30');
  });
  await unmount();
});

test('rezultatul gol oferă resetare și revine la lista completă', async () => {
  const { renderer, unmount } = await renderWithProviders(<CustomersScreen />);
  await chooseRange(renderer, '2027-01-01', '2027-01-31');
  await press(renderer, 'Aplică filtrul');
  await waitForUi(() =>
    expect(renderedText(renderer)).toContain(
      'Niciun client pentru filtrele alese',
    ),
  );
  await press(renderer, 'Resetează filtrele');
  await waitForUi(() => expect(renderedText(renderer)).toContain('Zoe'));
  await unmount();
});
