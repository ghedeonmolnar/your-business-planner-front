import { z } from 'zod';
import { API_URL } from '@env';
import { mapCoordinatesSchema } from '@/shared/schemas/mapLocationSchema';

export const isTrustedMapSelectorUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    const api = new URL(API_URL);
    return (
      url.origin === api.origin &&
      (url.protocol === 'https:' || (__DEV__ && url.protocol === 'http:')) &&
      /^\/event-map-picker\/[a-f0-9-]+\/[a-f0-9-]+$/.test(url.pathname) &&
      url.searchParams.has('signature') &&
      url.searchParams.has('expires')
    );
  } catch {
    return false;
  }
};

export const mapSelectorSchema = z.object({
  url: z.string().url().refine(isTrustedMapSelectorUrl),
  location_revision: z.string().regex(/^[a-f0-9]{64}$/),
});

export const mapPickerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ready') }),
  z.object({ type: z.literal('load_error') }),
  z.object({
    type: z.literal('place_selected'),
    place_id: z.string().regex(/^[A-Za-z0-9_-]{1,255}$/),
  }),
  z.object({ type: z.literal('pin_selected'), ...mapCoordinatesSchema.shape }),
]);
