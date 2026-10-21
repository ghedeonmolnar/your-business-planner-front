import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useMapPickerSelection } from '@/features/events/hooks/useMapPickerSelection';
import { resolveEventMapApi } from '@/features/events/api/eventMapApi';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { MapCoordinates } from '@/shared/types/mapLocation';

jest.mock('@/features/events/api/eventMapApi', () => ({
  resolveEventMapApi: jest.fn(),
}));

let current: ReturnType<typeof useMapPickerSelection>;
const preview = jest.fn();
function Harness() {
  current = useMapPickerSelection('event-1', preview);
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = jest.fn(() => Promise.resolve(jsonResponse(200, {})));
});

test('o rezolvare Google mai lenta nu suprascrie ultimul pin ales', async () => {
  let finishOld: ((value: MapCoordinates) => void) | undefined;
  jest.mocked(resolveEventMapApi).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finishOld = resolve;
      }),
  );
  jest
    .mocked(resolveEventMapApi)
    .mockResolvedValueOnce({ latitude: 47.05, longitude: 21.92 });
  const { unmount } = await renderWithProviders(<Harness />);
  let first: Promise<void> | undefined;
  await ReactTestRenderer.act(async () => {
    first = current.select({ place_id: 'ChIJ_old' });
  });
  await ReactTestRenderer.act(async () => {
    await current.select({ latitude: 47.05, longitude: 21.92 });
  });
  await ReactTestRenderer.act(async () => {
    finishOld?.({ latitude: 47.1, longitude: 22.1 });
    await first;
  });
  expect(current.selection).toEqual({ latitude: 47.05, longitude: 21.92 });
  expect(preview).toHaveBeenCalledTimes(1);
  expect(preview).toHaveBeenCalledWith({ latitude: 47.05, longitude: 21.92 });
  await unmount();
});

test('inchiderea selectorului anuleaza cererea si ignora raspunsul intarziat', async () => {
  let finish: ((value: MapCoordinates) => void) | undefined;
  jest.mocked(resolveEventMapApi).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const { unmount } = await renderWithProviders(<Harness />);
  let pending: Promise<void> | undefined;
  await ReactTestRenderer.act(async () => {
    pending = current.select({ place_id: 'ChIJ_old' });
  });
  const signal = jest.mocked(resolveEventMapApi).mock.calls[0][2];
  await unmount();
  await ReactTestRenderer.act(async () => {
    finish?.({ latitude: 47, longitude: 22 });
    await pending;
  });
  expect(signal?.aborted).toBe(true);
  expect(preview).not.toHaveBeenCalled();
});
