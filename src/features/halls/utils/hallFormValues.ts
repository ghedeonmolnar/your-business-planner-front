import { Hall, HallPhotoDraft } from '@/features/halls/types';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';

export const hallFormDefaults = (
  hall?: Hall,
  duplicate = false,
): HallFormValues => ({
  name: hall ? `${hall.name}${duplicate ? ' (copie)' : ''}` : '',
  capacity: hall ? String(hall.capacity) : '',
  minimum_guests:
    hall?.minimum_guests == null ? '' : String(hall.minimum_guests),
  address: hall?.address ?? '',
  description: hall?.description ?? '',
  internal_notes: duplicate ? '' : (hall?.internal_notes ?? ''),
  area_sqm: hall?.area_sqm ?? '',
  arrangement: hall?.arrangement ?? '',
  is_active: hall?.is_active === false ? 'no' : 'yes',
  amenities: hall?.amenities ?? [],
  setup_minutes: hall?.setup_minutes == null ? '' : String(hall.setup_minutes),
  cleanup_minutes:
    hall?.cleanup_minutes == null ? '' : String(hall.cleanup_minutes),
  business_hours: Array.from({ length: 7 }, (_, weekday) => {
    const hours = hall?.business_hours.find(item => item.weekday === weekday);
    return {
      weekday,
      enabled: Boolean(hours),
      start_time: hours?.start_time ?? '',
      end_time: hours?.end_time ?? '',
      ends_next_day: hours?.ends_next_day ?? false,
    };
  }),
});

export const hallSaveBody = (
  values: HallFormValues,
  photos: HallPhotoDraft[],
  operationId: string,
  version?: number,
) => {
  const uploaded = photos.filter(photo => photo.file);
  const cover = photos[0];
  const body = new FormData();
  const optionalNumber = (value: string) =>
    value ? Number(value.replace(',', '.')) : null;
  body.append(
    'metadata',
    JSON.stringify({
      ...values,
      capacity: Number(values.capacity),
      minimum_guests: optionalNumber(values.minimum_guests),
      area_sqm: values.area_sqm ? values.area_sqm.replace(',', '.') : null,
      is_active: values.is_active === 'yes',
      setup_minutes: optionalNumber(values.setup_minutes),
      cleanup_minutes: optionalNumber(values.cleanup_minutes),
      business_hours: values.business_hours
        .filter(hours => hours.enabled)
        .map(hours => ({
          weekday: hours.weekday,
          start_time: hours.start_time,
          end_time: hours.end_time,
          ends_next_day: hours.ends_next_day,
        })),
      image_ids: photos.flatMap(photo =>
        photo.imageId ? [photo.imageId] : [],
      ),
      cover_image_id: cover?.imageId ?? null,
      cover_upload_index: cover?.file
        ? uploaded.findIndex(photo => photo.key === cover.key)
        : null,
      version,
      operation_id: operationId,
    }),
  );
  if (version !== undefined) body.append('_method', 'PUT');
  uploaded.forEach(photo => {
    if (photo.file) body.append('files[]', photo.file as unknown as Blob);
  });
  return body;
};
