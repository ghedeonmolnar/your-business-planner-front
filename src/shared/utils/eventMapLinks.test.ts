import { Linking } from 'react-native';
import { buildEventMapUrl, openEventMap } from '@/shared/utils/eventMapLinks';
import { EventMapFields } from '@/shared/types/mapLocation';

const event: EventMapFields = {
  location: 'Oradea',
  address: 'Loc de joacă',
  map_location: {
    kind: 'manual_pin',
    latitude: 47.0465,
    longitude: 21.9189,
    place_id: null,
    confirmed: true,
    confirmed_at: '2026-10-08T15:00:00Z',
  },
};

test('deschide coordonatele exacte prin URL HTTPS compatibil cu browserul', async () => {
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await openEventMap(event);
  const url = new URL(
    jest.mocked(Linking.openURL).mock.calls.at(-1)?.[0] ?? '',
  );
  expect(url.origin).toBe('https://www.google.com');
  expect(url.pathname).toBe('/maps/search/');
  expect(url.searchParams.get('query')).toBe('47.0465,21.9189');
  expect(url.searchParams.get('api')).toBe('1');
});

test('foloseste identificatorul Google fara a cere sau stoca coordonatele', () => {
  const url = new URL(
    buildEventMapUrl({
      ...event,
      map_location: {
        kind: 'google_place',
        place_id: 'ChIJ_test',
        latitude: null,
        longitude: null,
        confirmed: true,
        confirmed_at: '2026-10-08T15:00:00Z',
      },
    }) ?? '',
  );
  expect(url.searchParams.get('query_place_id')).toBe('ChIJ_test');
  expect(url.searchParams.get('query')).toContain('Loc de joacă');
});

test('ascunde destinatia pana la confirmare inclusiv dupa modificarea adresei', () => {
  expect(buildEventMapUrl({ ...event, map_location: null })).toBeNull();
  expect(
    buildEventMapUrl({
      ...event,
      map_location: {
        kind: 'manual_pin',
        place_id: null,
        latitude: 47,
        longitude: 22,
        confirmed: false,
        confirmed_at: null,
      },
    }),
  ).toBeNull();
});
