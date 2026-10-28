import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingsScreen } from '@/features/bookings/screens/BookingsScreen';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { SearchableSelect } from '@/shared/components/ControlledSelectField';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ accessibilityLabel: label }).props.onPress();
  });
};
const fill = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onChangeText(value);
  });
};
const select = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await waitForUi(() => {
    const field = renderer.root
      .findByType(BookingForm)
      .findAllByType(SearchableSelect)
      .find(item => item.props.label === label);
    expect(
      field?.props.options.some(
        (option: { id: string }) => option.id === value,
      ),
    ).toBe(true);
  });
  await ReactTestRenderer.act(async () => {
    const field = renderer.root
      .findByType(BookingForm)
      .findAllByType(SearchableSelect)
      .find(item => item.props.label === label);
    if (!field) {
      throw new Error('Lipseste selectorul ' + label);
    }
    field.props.onChange([value]);
  });
};

beforeEach(() => {
  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);
    if (path.endsWith('/me')) {
      return Promise.resolve(jsonResponse(200, plannerAccount));
    }
    if (path.includes('/catalogs')) {
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [{ id: 'nunta', name: 'Nuntă' }],
          client_sources: [],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [],
        }),
      );
    }
    if (path.includes('/events') && init?.method === 'POST') {
      return Promise.resolve(jsonResponse(201, plannerBooking));
    }
    if (path.includes('/halls')) {
      return Promise.resolve(
        paginatedResponse([
          {
            id: 'hall-1',
            name: 'Sala Imperial',
            capacity: 350,
            address: null,
            is_active: true,
          },
        ]),
      );
    }
    if (path.includes('/clients')) {
      return Promise.resolve(
        paginatedResponse([
          { id: 'client-1', name: 'Client test', phone: '+40712345678' },
        ]),
      );
    }
    return Promise.resolve(paginatedResponse([]));
  }) as typeof globalThis.fetch;
});

test('creates an overnight reservation through all five steps with the API mocked', async () => {
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  await press(renderer, 'Rezervare nouă');
  await select(renderer, 'Sală', 'hall-1');
  await select(renderer, 'Stare rezervare', 'confirmed');
  await ReactTestRenderer.act(async () => {
    const date = renderer.root
      .findByType(BookingForm)
      .findAllByType(DatePickerField)
      .find(field => field.props.label === 'Data evenimentului');
    if (!date) {
      throw new Error('Lipsește selectorul datei.');
    }
    date.props.onChange('2027-11-13');
  });
  await select(renderer, 'Ora de început', '2027-11-13 18:00');
  await select(renderer, 'Ora de sfârșit', '2027-11-14 04:00');
  await press(renderer, 'Continuă');
  await select(renderer, 'Client', 'client-1');
  await press(renderer, 'Continuă');
  await fill(renderer, 'Invitați minimi', '200');
  await fill(renderer, 'Preț meniu / persoană (lei)', '350');
  await press(renderer, 'Continuă');
  await press(renderer, 'Continuă');
  await press(renderer, 'Salvează rezervarea');
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(
      ([url, init]) =>
        String(url).endsWith('/events') && init?.method === 'POST',
    );
  expect(request).toBeDefined();
  const payload = JSON.parse(String(request?.[1]?.body));
  expect(payload).toMatchObject({
    hall_id: 'hall-1',
    client_id: 'client-1',
    minimum_guests: 200,
    menu_price: '350',
    starts_at: '2027-11-13T16:00:00.000Z',
    ends_at: '2027-11-14T02:00:00.000Z',
  });
  expect(payload).not.toHaveProperty('company_id');
  expect(renderer.root.findAllByType(BookingForm)).toHaveLength(0);
  await unmount();
});

test('oprește o rezervare nouă la clientul fără telefon și oferă completarea lui', async () => {
  const { renderer, unmount } = await renderWithProviders(<BookingsScreen />);
  await press(renderer, 'Rezervare nouă');
  const form = renderer.root.findByType(BookingForm);
  await ReactTestRenderer.act(async () => {
    const fields = form.findAllByType(SearchableSelect);
    fields
      .find(field => field.props.label === 'Sală')
      ?.props.onChange(['hall-1']);
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByType(DatePickerField)
      .find(field => field.props.label === 'Data evenimentului')
      ?.props.onChange('2027-11-13');
  });
  await press(renderer, 'Continuă');
  await select(renderer, 'Client', 'client-1');
  const selected = renderer.root
    .findByType(BookingForm)
    .findByType(BookingClientFields);
  await ReactTestRenderer.act(async () => {
    selected.props.onSelected({
      id: 'client-1',
      name: 'Client test',
      phone: null,
    });
  });
  await press(renderer, 'Continuă');
  expect(renderedText(renderer)).toContain(
    'Completează telefonul clientului înainte de rezervare.',
  );
  expect(
    renderer.root.findByProps({ accessibilityLabel: 'Completează telefonul' }),
  ).toBeDefined();
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'POST'),
  ).toBe(false);
  await unmount();
});
