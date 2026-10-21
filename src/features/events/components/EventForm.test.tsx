import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { EventForm } from '@/features/events/components/EventForm';
import {
  jsonResponse,
  paginatedResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const lookupResponse = {
  matched: true,
  events_count: 3,
  client: {
    id: 'client-1',
    name: 'Familia Popescu',
    phone: '0732652339',
    judet: 'Bihor',
    oras: 'Oradea',
    strada: null,
    source: null,
    notes: null,
  },
  suggestion: { location: 'Oradea', address: 'Rasaritului nr20' },
};

const lookupCalls = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([url]) => String(url).includes('/clients-lookup'));

beforeEach(() => {
  globalThis.fetch = jest.fn(url => {
    if (String(url).includes('/clients-lookup')) {
      return Promise.resolve(jsonResponse(200, lookupResponse));
    }

    if (String(url).includes('/catalogs')) {
      return Promise.resolve(
        jsonResponse(200, {
          event_types: [],
          client_sources: [],
          event_statuses: [],
          communication_channels: [],
          event_hour_times: [],
          bihor_localities: [],
        }),
      );
    }

    return Promise.resolve(paginatedResponse([]));
  }) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

const settleLookup = async (
  renderer?: ReactTestRenderer.ReactTestRenderer,
  expectedText?: string,
) => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await ReactTestRenderer.act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    if (
      renderer &&
      expectedText &&
      getRenderedText(renderer.toJSON()).includes(expectedText)
    ) {
      return;
    }
  }
};

const renderForm = (initialValues: Record<string, unknown>) =>
  renderWithProviders(
    <EventForm
      initialValues={initialValues}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
      saving={false}
      visible
    />,
  );

test('recunoaște clientul după telefon chiar dacă a venit de pe Facebook', async () => {
  const { renderer, unmount } = await renderForm({
    communication_channel: 'facebook',
    contact_phone: '0732652339',
  });

  await settleLookup(renderer, 'Ai mai interacționat');

  expect(getRenderedText(renderer.toJSON())).toContain(
    'Ai mai interacționat cu această persoană. (3)',
  );
  expect(lookupCalls()).toHaveLength(1);
  expect(String(lookupCalls()[0][0])).toContain('channel=call');

  await unmount();
});

test('nu caută clientul cât timp contactul e prea scurt', async () => {
  const { unmount } = await renderForm({
    communication_channel: 'whatsapp',
    contact_phone: '073',
  });

  await settleLookup();

  expect(lookupCalls()).toHaveLength(0);

  await unmount();
});

test('nu caută clientul la editarea unui eveniment existent', async () => {
  const { unmount } = await renderWithProviders(
    <EventForm
      initialEvent={{
        id: 'event-1',
        client_id: 'client-1',
        communication_channel: 'whatsapp',
        contact_value: '0732652339',
        employee_id: null,
        mascot_id: null,
        date: '2026-09-18',
        start_time: '16:00',
        end_time: '18:00',
        price_per_hour: 250,
        location: 'Alesd',
        address: 'Bona Villa',
        type: 'aniversare',
      }}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
      saving={false}
      visible
    />,
  );

  await settleLookup();

  expect(lookupCalls()).toHaveLength(0);

  await unmount();
});

const minnieId = '11111111-1111-4111-8111-111111111111';
const maleAnimatorId = '22222222-2222-4222-8222-222222222222';
const busyAnimatorId = '33333333-3333-4333-8333-333333333333';

const detailsStepValues = {
  communication_channel: 'facebook',
  contact_phone: '0732652339',
  date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  mascot_ids: [minnieId],
  type: 'aniversare',
};

const scheduleStepValues = {
  location: 'Oradea',
  address: 'Pallazzo sala mica',
  start_time: '16:00',
  end_time: '18:00',
};

const mockTeamResponses = () => {
  const defaultFetch = globalThis.fetch;

  globalThis.fetch = jest.fn((url, init) => {
    const path = String(url);

    if (path.includes('/mascots')) {
      return Promise.resolve(
        paginatedResponse([
          {
            id: minnieId,
            name: 'Minnie Mouse',
            slug: 'minnie',
            price_per_hour: 300,
            is_active: true,
          },
        ]),
      );
    }

    if (path.includes('/employees')) {
      return Promise.resolve(
        paginatedResponse([
          {
            id: maleAnimatorId,
            name: 'Molnar Ghedeon',
            gender: 'male',
            hourly_rate: 50,
            birth_date: '1990-01-01',
            is_active: true,
          },
          {
            id: busyAnimatorId,
            name: 'Alexia Pacurar',
            gender: 'female',
            hourly_rate: 50,
            birth_date: '1992-05-10',
            is_active: true,
          },
        ]),
      );
    }

    if (path.includes('/availability')) {
      return Promise.resolve(
        jsonResponse(200, {
          date: detailsStepValues.date,
          start_time: '16:00',
          end_time: '18:00',
          employees: [
            {
              id: maleAnimatorId,
              name: 'Molnar Ghedeon',
              hourly_rate: 50,
              is_available: true,
              conflict: null,
            },
            {
              id: busyAnimatorId,
              name: 'Alexia Pacurar',
              hourly_rate: 50,
              is_available: false,
              conflict: {
                event_id: 'event-conflict-1',
                start_time: '15:00',
                end_time: '17:00',
                location: 'Tinca',
              },
            },
          ],
          mascots: [],
          events: [],
        }),
      );
    }

    return defaultFetch(url, init);
  }) as unknown as typeof globalThis.fetch;
};

const pressButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    await renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onPress();
  });
};

test('propune statusul Rezervat și trece de primul pas fără animatori', async () => {
  const { renderer, unmount } = await renderForm(detailsStepValues);

  await pressButton(renderer, 'Înainte');

  const renderedText = getRenderedText(renderer.toJSON());

  expect(renderedText).toContain('Eveniment nou · Pas 2/3');
  expect(
    renderer.root.findByProps({ name: 'status' }).props.options[0],
  ).toEqual({ id: 'confirmed', name: 'Rezervat' });
  expect(renderedText).toContain('Rezervat');
  expect(renderedText).not.toContain('detalii parțiale');

  await unmount();
});

test('orice animator liber poate purta orice mascotă, dar nu două deodată', async () => {
  mockTeamResponses();
  const { renderer, unmount } = await renderForm({
    ...detailsStepValues,
    ...scheduleStepValues,
  });

  await settleLookup();
  await pressButton(renderer, 'Înainte');
  await pressButton(renderer, 'Înainte');
  await settleLookup(renderer, 'Minnie Mouse');

  const animatorOptions = renderer.root.findByProps({
    name: 'assignments.0.employee_id',
  }).props.options;

  expect(animatorOptions).toEqual([
    expect.objectContaining({ id: maleAnimatorId, disabled: false }),
    expect.objectContaining({
      id: busyAnimatorId,
      disabled: true,
      description: 'Ocupat 15:00-17:00, Tinca',
    }),
  ]);
  expect(getRenderedText(renderer.toJSON())).not.toContain(
    'Vreau sa vad toti angajatii',
  );

  await unmount();
});
