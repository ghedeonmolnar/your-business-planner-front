import { Event } from '@/features/events/types';

export const eventMascotLabel = (
  event: Event,
  mascotNamesById: Map<string, string>,
  separator = ', ',
) => {
  const loadedNames = event.mascots
    ?.map(mascot => mascot.name)
    .filter((name): name is string => Boolean(name));

  if (loadedNames?.length) {
    return loadedNames.join(separator);
  }

  const ids = event.mascot_ids?.length
    ? event.mascot_ids
    : event.mascot_id
      ? [event.mascot_id]
      : [];
  const names = ids
    .map(id => mascotNamesById.get(id))
    .filter((name): name is string => Boolean(name));

  return names.length ? names.join(separator) : event.mascot?.name;
};
