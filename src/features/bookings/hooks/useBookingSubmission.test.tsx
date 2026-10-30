import React from 'react';
import {
  getBookingCreationAttempt,
  forgetBookingCreationAttempt,
} from '@/features/bookings/utils/bookingCreationRecovery';
import {
  plannerAccount,
  plannerBooking,
} from '@/features/bookings/utils/plannerTestFixtures';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import {
  jsonResponse,
  pressDialogButton,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { renderedText } from '@/shared/test/renderedText';
import {
  owner,
  press,
  Probe,
} from '@/features/bookings/hooks/bookingSubmission.testUtils';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
afterEach(() => forgetBookingCreationAttempt(owner));

test.each([['HALL_ALREADY_BOOKED', 'Schimbă sala', { hall_id: 'hall-B' }]])(
  'primul %s permite corectarea si o cheie noua fara pierderea ciornei',
  async (code, correctionLabel, correctedFields) => {
    const bodies: Record<string, unknown>[] = [];
    globalThis.fetch = jest.fn((_url, init) => {
      if (init?.method !== 'POST')
        return Promise.resolve(jsonResponse(200, plannerAccount));
      bodies.push(JSON.parse(String(init.body)));
      return Promise.resolve(
        bodies.length === 1
          ? jsonResponse(409, { error: { code } })
          : jsonResponse(201, plannerBooking),
      );
    }) as typeof globalThis.fetch;
    const onClose = jest.fn();
    const view = await renderWithProviders(<Probe onClose={onClose} />);
    try {
      await waitForUi(() =>
        expect(
          view.renderer.root.findByProps({ accessibilityLabel: 'Trimite' })
            .props.disabled,
        ).toBe(false),
      );
      await press(view.renderer, 'Trimite');
      await waitForUi(() =>
        expect(getBookingCreationAttempt(owner)).toBeUndefined(),
      );
      expect(view.renderer.root.findByType(FormModalFrame).props.readOnly).toBe(
        false,
      );
      expect(renderedText(view.renderer)).toContain(plannerBooking.hall_id);
      await pressDialogButton(view.renderer, 'OK');
      await press(view.renderer, correctionLabel);
      await press(view.renderer, 'Trimite');
      await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(bodies[1]).toMatchObject(correctedFields);
      expect(bodies[1].operation_id).not.toBe(bodies[0].operation_id);
    } finally {
      await view.unmount();
    }
  },
);

test('crearea nu trimite alocări de personal păstrate în valorile formularului', async () => {
  const bodies: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((_url, init) => {
    if (init?.method !== 'POST')
      return Promise.resolve(jsonResponse(200, plannerAccount));
    bodies.push(JSON.parse(String(init.body)));
    return Promise.resolve(jsonResponse(201, plannerBooking));
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const view = await renderWithProviders(<Probe onClose={onClose} />);
  try {
    await waitForUi(() =>
      expect(
        view.renderer.root.findByProps({ accessibilityLabel: 'Trimite' }).props
          .disabled,
      ).toBe(false),
    );
    await press(view.renderer, 'Trimite');
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(bodies[0].staff).toEqual([]);
  } finally {
    await view.unmount();
  }
});

test('dupa primul refuz 409 redeschiderea pentru alta data nu recupereaza vechea incercare', async () => {
  globalThis.fetch = jest.fn((_url, init) =>
    Promise.resolve(
      init?.method === 'POST'
        ? jsonResponse(409, { error: { code: 'HALL_ALREADY_BOOKED' } })
        : jsonResponse(200, plannerAccount),
    ),
  ) as typeof globalThis.fetch;
  const first = await renderWithProviders(<Probe onClose={() => undefined} />);
  try {
    await waitForUi(() =>
      expect(
        first.renderer.root.findByProps({ accessibilityLabel: 'Trimite' }).props
          .disabled,
      ).toBe(false),
    );
    await press(first.renderer, 'Trimite');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'POST' }),
    );
    await waitForUi(() =>
      expect(
        first.renderer.root.findByType(FormModalFrame).props.readOnly,
      ).toBe(false),
    );
    expect(getBookingCreationAttempt(owner)).toBeUndefined();
  } finally {
    await first.unmount();
  }
  const second = await renderWithProviders(
    <Probe date="2027-12-01" onClose={() => undefined} />,
  );
  try {
    expect(second.renderer.root.findByType(FormModalFrame).props.readOnly).toBe(
      false,
    );
    expect(renderedText(second.renderer)).toContain('2027-12-01');
  } finally {
    await second.unmount();
  }
});

test('timeout urmat de 409 pastreaza identic payloadul la redeschidere', async () => {
  const bodies: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((_url, init) => {
    if (init?.method !== 'POST')
      return Promise.resolve(jsonResponse(200, plannerAccount));
    bodies.push(JSON.parse(String(init.body)));
    return bodies.length === 1
      ? Promise.reject(new Error('Raspuns pierdut'))
      : Promise.resolve(
          jsonResponse(409, { error: { code: 'HALL_ALREADY_BOOKED' } }),
        );
  }) as typeof globalThis.fetch;
  const first = await renderWithProviders(<Probe onClose={() => undefined} />);
  try {
    await waitForUi(() =>
      expect(
        first.renderer.root.findByProps({ accessibilityLabel: 'Trimite' }).props
          .disabled,
      ).toBe(false),
    );
    await press(first.renderer, 'Trimite');
    await waitForUi(() =>
      expect(getBookingCreationAttempt(owner)).toBeDefined(),
    );
  } finally {
    await first.unmount();
  }
  const second = await renderWithProviders(
    <Probe date="2027-12-01" onClose={() => undefined} />,
  );
  try {
    await press(second.renderer, 'Trimite');
    await waitForUi(() => expect(bodies).toHaveLength(2));
    expect(bodies[1]).toEqual(bodies[0]);
    expect(second.renderer.root.findByType(FormModalFrame).props.readOnly).toBe(
      true,
    );
    expect(renderedText(second.renderer)).toContain(plannerBooking.date);
  } finally {
    await second.unmount();
  }
});

test('conflictul operation_id necesita reconciliere explicita si nu produce o retrimitere automata', async () => {
  const bodies: Record<string, unknown>[] = [];
  globalThis.fetch = jest.fn((_url, init) => {
    if (init?.method !== 'POST')
      return Promise.resolve(jsonResponse(200, plannerAccount));
    bodies.push(JSON.parse(String(init.body)));
    return Promise.resolve(
      bodies.length === 1
        ? jsonResponse(409, { error: { code: 'BOOKING_OPERATION_CONFLICT' } })
        : jsonResponse(201, plannerBooking),
    );
  }) as typeof globalThis.fetch;
  const onClose = jest.fn();
  const view = await renderWithProviders(<Probe onClose={onClose} />);
  try {
    await waitForUi(() =>
      expect(
        view.renderer.root.findByProps({ accessibilityLabel: 'Trimite' }).props
          .disabled,
      ).toBe(false),
    );
    await press(view.renderer, 'Trimite');
    await waitForUi(() =>
      expect(getBookingCreationAttempt(owner)?.requiresReconciliation).toBe(
        true,
      ),
    );
    expect(
      view.renderer.root.findByProps({ accessibilityLabel: 'Trimite' }).props
        .disabled,
    ).toBe(true);
    await pressDialogButton(view.renderer, 'OK');
    await press(view.renderer, 'Am verificat lista rezervărilor');
    await pressDialogButton(view.renderer, 'Anulează');
    expect(bodies).toHaveLength(1);
    expect(getBookingCreationAttempt(owner)).toBeDefined();
    await press(view.renderer, 'Am verificat lista rezervărilor');
    await pressDialogButton(view.renderer, 'Permite o creare nouă');
    expect(getBookingCreationAttempt(owner)).toBeUndefined();
    await press(view.renderer, 'Trimite');
    await waitForUi(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(bodies[1].operation_id).not.toBe(bodies[0].operation_id);
  } finally {
    await view.unmount();
  }
});
