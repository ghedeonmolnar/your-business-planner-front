import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { getHallAddressSuggestionsApi } from '@/features/halls/api/hallAddressApi';
import { queryKeys } from '@/shared/api/queryKeys';

const ADDRESS_DEBOUNCE_MS = 400;
const MIN_ADDRESS_LENGTH = 3;

export function useHallAddressSuggestions(query: string, enabled: boolean) {
  const { user } = useAuth();
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(query.trim()),
      ADDRESS_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query]);
  const ready =
    enabled &&
    debounced === query.trim() &&
    debounced.length >= MIN_ADDRESS_LENGTH;
  const result = useQuery({
    queryKey: queryKeys.planner.hallAddresses(
      user?.company?.id ?? '',
      debounced,
    ),
    queryFn: ({ signal }) => getHallAddressSuggestionsApi(debounced, signal),
    enabled: ready && Boolean(user?.company?.id),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  return { ...result, ready };
}
