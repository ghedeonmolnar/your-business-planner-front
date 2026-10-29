import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookingClientFields } from '@/features/bookings/components/BookingClientFields';
import { useBookingClientLookup } from '@/features/bookings/hooks/useBookingClientLookup';
import {
  bookingFormDefaults,
  bookingPayload,
} from '@/features/bookings/utils/bookingFormValues';
import {
  bookingFormSchema,
  BookingFormValues,
} from '@/features/bookings/schemas/bookingFormSchema';
import { BookingPayload } from '@/features/bookings/types';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { AppButton } from '@/shared/components/AppButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const client = {
  id: 'client-1',
  name: 'Ana Popescu',
  phone: '+40712345678',
  judet: null,
  oras: null,
  strada: null,
  source: null,
  notes: null,
};
const matched = { matched: true, events_count: 2, client, suggestion: null };
const unknown = {
  matched: false,
  events_count: 0,
  client: null,
  suggestion: null,
};
let lookup: (phone: string) => Promise<Response>;

function Probe({ onSubmit }: { onSubmit: (payload: BookingPayload) => void }) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: bookingFormDefaults('2027-11-13', 'hall-1'),
  });
  const phone = useWatch({ control: form.control, name: 'client_phone' });
  const result = useBookingClientLookup(phone ?? '', true);
  return (
    <>
      <BookingClientFields form={form} lookup={result} />
      <AppButton
        label="Verifică formularul"
        onPress={form.handleSubmit(values => onSubmit(bookingPayload(values)))}
      />
    </>
  );
}

const fill = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) =>
  ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: label })
      .props.onChangeText(value);
  });
const submit = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  ReactTestRenderer.act(async () => {
    renderer.root.findByType(AppButton).props.onPress();
  });

beforeEach(() => {
  lookup = () => Promise.resolve(jsonResponse(200, matched));
  globalThis.fetch = jest.fn(url => {
    const path = String(url);
    if (path.endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    return lookup(new URL(path).searchParams.get('contact_value') ?? '');
  }) as typeof globalThis.fetch;
});

test('identifică automat clientul după telefon și nu cere numele', async () => {
  const onSubmit = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <Probe onSubmit={onSubmit} />,
  );
  try {
    await fill(renderer, 'Număr de telefon', '0712 345 678');
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Ana Popescu'),
    );
    expect(
      renderer.root
        .findAllByType(ControlledTextField)
        .some(field => field.props.name === 'client_name'),
    ).toBe(false);
    await submit(renderer);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        client_phone: '+40712345678',
        client_name: undefined,
        client_id: undefined,
      }),
    );
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([, init]) => init?.method === 'POST'),
    ).toBe(false);
  } finally {
    await unmount();
  }
});

test('numărul nou permite continuarea fără nume și păstrează numele opțional când este completat', async () => {
  lookup = () => Promise.resolve(jsonResponse(200, unknown));
  const onSubmit = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <Probe onSubmit={onSubmit} />,
  );
  try {
    await fill(renderer, 'Număr de telefon', '0724111001');
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Număr nou'),
    );
    await submit(renderer);
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        client_phone: '+40724111001',
        client_name: undefined,
      }),
    );
    await fill(renderer, 'Numele clientului (opțional)', 'Ana Ionescu');
    await submit(renderer);
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ client_name: 'Ana Ionescu' }),
    );
    await fill(renderer, 'Număr de telefon', '0724 111 001');
    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Numele clientului (opțional)',
      }).props.value,
    ).toBe('Ana Ionescu');
    await fill(renderer, 'Număr de telefon', '0724111002');
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Număr nou'),
    );
    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Numele clientului (opțional)',
      }).props.value,
    ).toBe('');
  } finally {
    await unmount();
  }
});

test('un răspuns vechi nu asociază clientul primului număr după schimbarea telefonului', async () => {
  let resolveOld: (response: Response) => void = () => undefined;
  lookup = phone =>
    phone === '+40712345678'
      ? new Promise(resolve => {
          resolveOld = resolve;
        })
      : Promise.resolve(jsonResponse(200, unknown));
  const { renderer, unmount } = await renderWithProviders(
    <Probe onSubmit={jest.fn()} />,
  );
  try {
    await fill(renderer, 'Număr de telefon', '0712345678');
    await waitForUi(() =>
      expect(
        jest
          .mocked(globalThis.fetch)
          .mock.calls.some(([url]) => String(url).includes('clients-lookup')),
      ).toBe(true),
    );
    await fill(renderer, 'Număr de telefon', '0724111001');
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Număr nou'),
    );
    await ReactTestRenderer.act(async () =>
      resolveOld(jsonResponse(200, matched)),
    );
    expect(renderedText(renderer)).not.toContain('Ana Popescu');
    expect(renderedText(renderer)).toContain('Număr nou');
  } finally {
    await unmount();
  }
});

test('eroarea de căutare poate fi reîncercată fără crearea clientului', async () => {
  lookup = () =>
    Promise.resolve(
      jsonResponse(503, { error: { code: 'SERVICE_UNAVAILABLE' } }),
    );
  const { renderer, unmount } = await renderWithProviders(
    <Probe onSubmit={jest.fn()} />,
  );
  try {
    await fill(renderer, 'Număr de telefon', '0712345678');
    await waitForUi(() =>
      expect(renderer.root.findAllByType(ErrorBanner)).toHaveLength(1),
    );
    lookup = () => Promise.resolve(jsonResponse(200, matched));
    await ReactTestRenderer.act(async () => {
      await renderer.root.findByType(ErrorBanner).props.onRetry();
    });
    await waitForUi(() =>
      expect(renderedText(renderer)).toContain('Ana Popescu'),
    );
  } finally {
    await unmount();
  }
});
