import React, { useState } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingPaymentForm } from '@/features/bookings/components/BookingPaymentForm';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const fillAmount = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  amount: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Sumă (lei)' })
      .props.onChangeText(amount);
  });
};
const save = async (renderer: ReactTestRenderer.ReactTestRenderer) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Salvează plata' })
      .props.onPress();
  });
};

test('blochează câmpurile pe durata salvării și păstrează suma trimisă', async () => {
  let release: (response: Response) => void = () => undefined;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'POST')
      return new Promise<Response>(resolve => {
        release = resolve;
      });
    return Promise.resolve(jsonResponse(200, {}));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingPaymentForm eventId="event-1" onClose={onClose} />,
  );
  await fillAmount(renderer, '1000');
  await save(renderer);
  expect(renderer.root.findByType(FormModalFrame).props.busy).toBe(true);
  expect(
    renderer.root.findByProps({ accessibilityLabel: 'Sumă (lei)' }).props
      .disabled,
  ).toBe(true);
  await fillAmount(renderer, '1200');
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(([, init]) => init?.method === 'POST');
  const payload = JSON.parse(String(request?.[1]?.body));
  expect(payload.amount).toBe('1000');
  await ReactTestRenderer.act(async () => {
    release(
      jsonResponse(201, {
        ...payload,
        version: 1,
        id: 'payment-1',
        event_id: 'event-1',
        amount: 1000,
      }),
    );
  });
  expect(onClose).toHaveBeenCalledTimes(1);
  await unmount();
});

test('retrimiterea după răspuns pierdut păstrează identitatea și datele operațiunii', async () => {
  let posts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'POST') {
      posts += 1;
      if (posts === 1) return Promise.reject(new Error('Răspuns pierdut'));
      const payload = JSON.parse(String(init.body));
      return Promise.resolve(
        jsonResponse(201, {
          ...payload,
          version: 1,
          id: 'payment-1',
          event_id: 'event-1',
          amount: 1000,
        }),
      );
    }
    return Promise.resolve(jsonResponse(200, {}));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <BookingPaymentForm eventId="event-1" onClose={onClose} />,
  );
  await fillAmount(renderer, '1000');
  await save(renderer);
  expect(onClose).not.toHaveBeenCalled();
  expect(renderer.root.findByType(FormModalFrame).props.readOnly).toBe(true);
  await save(renderer);
  const payloads = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'POST')
    .map(([, init]) => JSON.parse(String(init?.body)));
  expect(payloads).toHaveLength(2);
  expect(payloads[1]).toEqual(payloads[0]);
  expect(payloads[0].operation_id).toMatch(/^[a-f0-9-]{36}$/);
  expect(onClose).toHaveBeenCalledTimes(1);
  await unmount();
});

test('redeschiderea formularului recuperează în aceeași sesiune operațiunea cu rezultat incert', async () => {
  let posts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    if (String(url).endsWith('/me'))
      return Promise.resolve(jsonResponse(200, plannerAccount));
    if (init?.method === 'POST') {
      posts += 1;
      if (posts === 1) return Promise.reject(new Error('Răspuns pierdut'));
      const payload = JSON.parse(String(init.body));
      return Promise.resolve(
        jsonResponse(201, {
          ...payload,
          version: 1,
          id: 'payment-1',
          event_id: 'event-1',
          amount: 1000,
        }),
      );
    }
    return Promise.resolve(jsonResponse(200, {}));
  }) as typeof globalThis.fetch;
  function Probe() {
    const [visible, setVisible] = useState(true);
    return (
      <>
        {visible ? (
          <BookingPaymentForm
            eventId="event-1"
            onClose={() => setVisible(false)}
          />
        ) : (
          <AppButton
            label="Redeschide plata"
            onPress={() => setVisible(true)}
          />
        )}
      </>
    );
  }
  const { renderer, unmount } = await renderWithProviders(<Probe />);
  await fillAmount(renderer, '1000');
  await save(renderer);
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(BookingPaymentForm).props.onClose(),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Redeschide plata' })
      .props.onPress(),
  );
  expect(renderer.root.findByType(FormModalFrame).props.readOnly).toBe(true);
  await save(renderer);
  const payloads = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'POST')
    .map(([, init]) => JSON.parse(String(init?.body)));
  expect(payloads).toHaveLength(2);
  expect(payloads[1]).toEqual(payloads[0]);
  await unmount();
});
