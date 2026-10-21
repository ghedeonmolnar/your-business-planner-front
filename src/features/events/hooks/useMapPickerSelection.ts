import { useEffect, useRef, useState } from 'react';
import { useResolveEventMap } from '@/features/events/hooks/useEventMapLocation';
import {
  MapCoordinates,
  MapLocation,
  MapSelection,
} from '@/shared/types/mapLocation';
import { showError } from '@/shared/feedback/showError';

export const useMapPickerSelection = (
  eventId: string,
  preview: (point: MapCoordinates | null) => void,
) => {
  const resolver = useResolveEventMap(eventId);
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const [selection, setSelection] = useState<MapSelection | null>(null);
  const [isResolving, setResolving] = useState(false);

  const reset = () => {
    sequence.current += 1;
    request.current?.abort();
    setSelection(null);
    setResolving(false);
  };

  useEffect(
    () => () => {
      sequence.current += 1;
      request.current?.abort();
    },
    [],
  );

  const select = async (candidate: MapSelection) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const current = ++sequence.current;
    setSelection(null);
    setResolving(true);
    try {
      const coordinates = await resolver.mutateAsync({
        selection: candidate,
        signal: controller.signal,
      });
      if (current !== sequence.current) return;
      setSelection(candidate);
      preview(coordinates);
    } catch (error) {
      if (current !== sequence.current) return;
      preview(null);
      showError(error, 'Nu am putut verifica locația. Încearcă din nou.');
    } finally {
      if (current === sequence.current) setResolving(false);
    }
  };

  const restore = (point: MapLocation | null | undefined) => {
    if (!point) return;
    select(
      point.kind === 'google_place'
        ? { place_id: point.place_id }
        : { latitude: point.latitude, longitude: point.longitude },
    );
  };

  return { selection, isResolving, select, restore, reset };
};
