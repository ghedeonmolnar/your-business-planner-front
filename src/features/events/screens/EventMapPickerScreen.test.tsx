import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Platform } from 'react-native';
import { API_URL } from '@env';
import { EventMapPickerScreen } from '@/features/events/screens/EventMapPickerScreen';
import { Event } from '@/features/events/types';
import { eventFixture } from '@/shared/test/apiFixtures';
import {
  getVisibleDialog,
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { queryKeys } from '@/shared/api/queryKeys';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { LoadingState } from '@/shared/components/LoadingState';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  getAuthToken: jest.fn(() => Promise.resolve('test-token')),
  clearAuthToken: jest.fn(() => Promise.resolve()),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const mockInject = jest.fn();
jest.mock('react-native-webview', () => {
  const ReactModule = jest.requireActual('react');
  const { View: MockView } = jest.requireActual('react-native');
  return {
    WebView: ReactModule.forwardRef(
      (props: object, ref: React.Ref<unknown>) => {
        ReactModule.useImperativeHandle(ref, () => ({
          injectJavaScript: mockInject,
        }));
        return ReactModule.createElement(MockView, {
          ...props,
          testID: 'map-web-view',
        });
      },
    ),
  };
});

const eventId = '11111111-1111-4111-8111-111111111111';
const sessionUrl = `${new URL(API_URL).origin}/event-map-picker/22222222-2222-4222-8222-222222222222/${eventId}?expires=2000000000&signature=test`;
const revision = 'a'.repeat(64);
const navigation = { goBack: jest.fn() };
const props = {
  navigation,
  route: { params: { eventId } },
} as unknown as React.ComponentProps<typeof EventMapPickerScreen>;
let loadedEvent: Event;
let resolveStatus: number;
let selectorStatus: number;

const writes = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(
      ([, options]) =>
        options?.method === 'PUT' || options?.method === 'DELETE',
    );
const flush = () =>
  ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 5));
  });
const mount = async () => {
  const result = await renderWithProviders(<EventMapPickerScreen {...props} />);
  await flush();
  return result;
};
const message = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  data: object,
  sourceUrl = sessionUrl,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ testID: 'map-web-view' }).props.onMessage({
      nativeEvent: { url: sourceUrl, data: JSON.stringify(data) },
    });
  });
  await flush();
};

afterEach(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  loadedEvent = { ...eventFixture, id: eventId, map_location: null };
  resolveStatus = 200;
  selectorStatus = 200;
  globalThis.fetch = jest.fn((input, options) => {
    const url = String(input);
    if (url.endsWith('/me'))
      return Promise.resolve(
        jsonResponse(200, {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
          employee_id: null,
        }),
      );
    if (url.endsWith('/map-selector'))
      return Promise.resolve(
        jsonResponse(
          selectorStatus,
          selectorStatus === 200
            ? { url: sessionUrl, location_revision: revision }
            : { error: { code: 'MAP_CONFIGURATION_MISSING' } },
        ),
      );
    if (url.endsWith('/map-resolve'))
      return Promise.resolve(
        jsonResponse(
          resolveStatus,
          resolveStatus === 200
            ? { latitude: 47.0465, longitude: 21.9189 }
            : { error: { code: 'MAP_OUTSIDE_BIHOR' } },
        ),
      );
    if (url.endsWith('/map-location') && options?.method === 'PUT') {
      const payload = JSON.parse(String(options.body)) as {
        place_id?: string;
        latitude?: number;
        longitude?: number;
      };
      loadedEvent = {
        ...loadedEvent,
        map_location: payload.place_id
          ? {
              kind: 'google_place',
              place_id: payload.place_id,
              latitude: null,
              longitude: null,
              confirmed: true,
              confirmed_at: '2026-10-08T15:00:00Z',
            }
          : {
              kind: 'manual_pin',
              place_id: null,
              latitude: payload.latitude ?? 0,
              longitude: payload.longitude ?? 0,
              confirmed: true,
              confirmed_at: '2026-10-08T15:00:00Z',
            },
      };
      return Promise.resolve(
        jsonResponse(200, { map_location: loadedEvent.map_location }),
      );
    }
    return Promise.resolve(jsonResponse(200, loadedEvent));
  }) as typeof globalThis.fetch;
});

test('selecteaza Google, ajusteaza pinul si confirma o singura data explicit', async () => {
  const { renderer, queryClient, unmount } = await mount();
  await message(renderer, { type: 'ready' });
  await message(renderer, { type: 'place_selected', place_id: 'ChIJ_test' });
  expect(writes()).toHaveLength(0);
  await message(renderer, {
    type: 'pin_selected',
    latitude: 47.0465,
    longitude: 21.9189,
  });
  expect(mockInject).toHaveBeenCalledWith(
    expect.stringContaining('show_point'),
  );
  await ReactTestRenderer.act(async () => {
    const confirm = renderer.root.findByProps({ label: 'Confirmă locația' });
    confirm.props.onPress();
    confirm.props.onPress();
  });
  expect(writes()).toHaveLength(1);
  expect(JSON.parse(String(writes()[0][1]?.body))).toEqual({
    latitude: 47.0465,
    longitude: 21.9189,
    location_revision: revision,
  });
  expect(
    queryClient.getQueryData<Event>(queryKeys.events.detail(eventId))
      ?.map_location?.confirmed,
  ).toBe(true);
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  await unmount();
});

test('accepta mesajele cand WebView raporteaza URL-ul fara query (Android)', async () => {
  const bareUrl = `${new URL(API_URL).origin}/event-map-picker/22222222-2222-4222-8222-222222222222/${eventId}`;
  const { renderer, unmount } = await mount();
  await message(renderer, { type: 'ready' }, bareUrl);
  await message(
    renderer,
    { type: 'pin_selected', latitude: 47.0465, longitude: 21.9189 },
    bareUrl,
  );
  expect(mockInject).toHaveBeenCalledWith(
    expect.stringContaining('show_point'),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.onPress();
  });
  expect(writes()).toHaveLength(1);
  await unmount();
});

test('originea Android scoate harta din loading si permite confirmarea pinului', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const nativeOrigin = new URL(API_URL).origin;
  const { renderer, unmount } = await mount();
  expect(renderer.root.findAllByType(LoadingState)).toHaveLength(1);
  await message(renderer, { type: 'ready' }, nativeOrigin);
  expect(renderer.root.findAllByType(LoadingState)).toHaveLength(0);
  await message(
    renderer,
    { type: 'pin_selected', latitude: 47.0465, longitude: 21.9189 },
    nativeOrigin,
  );
  expect(
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.disabled,
  ).toBe(false);
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.onPress();
  });
  expect(writes()).toHaveLength(1);
  expect(JSON.parse(String(writes()[0][1]?.body))).toMatchObject({
    latitude: 47.0465,
    longitude: 21.9189,
    location_revision: revision,
  });
  await unmount();
});

test('mesajele din alta origine sau pagina nu schimba starea hartii', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const nativeOrigin = new URL(API_URL).origin;
  const foreignSources = [
    `${nativeOrigin}.attacker.test`,
    `${nativeOrigin}/event-map-picker/other/event`,
    'https://maps.google.com',
    'about:blank',
  ];
  const { renderer, unmount } = await mount();
  for (const source of foreignSources) {
    await message(renderer, { type: 'ready' }, source);
    await message(
      renderer,
      { type: 'pin_selected', latitude: 47.0465, longitude: 21.9189 },
      source,
    );
  }
  expect(mockInject).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType(LoadingState)).toHaveLength(1);
  await message(renderer, { type: 'ready' }, nativeOrigin);
  await message(
    renderer,
    { type: 'pin_selected', latitude: 47.0465, longitude: 21.9189 },
    nativeOrigin,
  );
  for (const source of foreignSources) {
    await message(renderer, { type: 'load_error' }, source);
  }
  expect(renderer.root.findAllByType(ErrorBanner)).toHaveLength(0);
  expect(
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.disabled,
  ).toBe(false);
  expect(writes()).toHaveLength(0);
  await unmount();
});

test('anularea unei propuneri reconfirmabile nu scrie nimic', async () => {
  loadedEvent.map_location = {
    kind: 'manual_pin',
    place_id: null,
    latitude: 47.0465,
    longitude: 21.9189,
    confirmed: false,
    confirmed_at: null,
  };
  const { renderer, unmount } = await mount();
  await message(renderer, { type: 'ready' });
  expect(mockInject).toHaveBeenCalledWith(
    expect.stringContaining('show_point'),
  );
  await message(renderer, { type: 'place_selected', place_id: 'ChIJ_test' });
  await ReactTestRenderer.act(async () =>
    renderer.root.findByProps({ label: 'Anulează' }).props.onPress(),
  );
  expect(writes()).toHaveLength(0);
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  await unmount();
});

test('refuza punctul din afara Bihorului si dezactiveaza confirmarea', async () => {
  resolveStatus = 422;
  const { renderer, unmount } = await mount();
  await message(renderer, { type: 'ready' });
  await message(renderer, {
    type: 'pin_selected',
    latitude: 47.53,
    longitude: 21.63,
  });
  expect(getVisibleDialog(renderer)?.message).toContain('județul Bihor');
  expect(
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.disabled,
  ).toBe(true);
  expect(writes()).toHaveLength(0);
  await unmount();
});

test('ignora mesaje invalide si navigarea catre alte pagini', async () => {
  const { renderer, unmount } = await mount();
  await message(renderer, { type: 'ready' });
  await message(renderer, {
    type: 'pin_selected',
    latitude: '47',
    longitude: 22,
  });
  const web = renderer.root.findByProps({ testID: 'map-web-view' });
  expect(
    web.props.onShouldStartLoadWithRequest({ url: 'https://example.com' }),
  ).toBe(false);
  expect(web.props.onShouldStartLoadWithRequest({ url: sessionUrl })).toBe(
    true,
  );
  expect(
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.disabled,
  ).toBe(true);
  expect(writes()).toHaveLength(0);
  await unmount();
});

test('URL expirat si lipsa configurarii permit reincercarea fara salvare', async () => {
  selectorStatus = 503;
  const { renderer, unmount } = await mount();
  expect(JSON.stringify(renderer.toJSON())).toContain(
    'Harta nu este încă activată',
  );
  selectorStatus = 200;
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(ErrorBanner).props.onRetry(),
  );
  await flush();
  await ReactTestRenderer.act(async () =>
    renderer.root
      .findByProps({ testID: 'map-web-view' })
      .props.onHttpError({ nativeEvent: { statusCode: 403, url: sessionUrl } }),
  );
  expect(
    renderer.root.findByProps({ label: 'Confirmă locația' }).props.disabled,
  ).toBe(true);
  expect(writes()).toHaveLength(0);
  await unmount();
});
