import { Linking } from 'react-native';
import { EventMapFields } from '@/shared/types/mapLocation';
import { showError } from '@/shared/feedback/showError';

const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/';

export const buildEventMapUrl = (event: EventMapFields): string | null => {
  const point = event.map_location;
  if (!point?.confirmed) return null;

  const parameters = new URLSearchParams({ api: '1' });
  if (point.kind === 'manual_pin') {
    parameters.set('query', `${point.latitude},${point.longitude}`);
  } else {
    parameters.set(
      'query',
      [event.address, event.location, 'Bihor', 'România']
        .filter(Boolean)
        .join(', '),
    );
    parameters.set('query_place_id', point.place_id);
  }
  return `${GOOGLE_MAPS_SEARCH_URL}?${parameters}`;
};

export const openEventMap = async (event: EventMapFields) => {
  const url = buildEventMapUrl(event);
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch (error) {
    showError(error, 'Nu am putut deschide Google Maps. Încearcă din nou.');
  }
};
