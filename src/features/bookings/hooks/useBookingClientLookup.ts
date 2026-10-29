import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { lookupClientApi } from '@/features/clients/api/clientsApi';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { normalizePhone } from '@/shared/utils/contactLinks';
import { queryKeys } from '@/shared/api/queryKeys';

const PHONE_LOOKUP_DELAY_MS = 400;
const PHONE_LOOKUP_STALE_TIME_MS = 30_000;

export const useBookingClientLookup = (value: string, enabled: boolean) => {
  const { user } = useAuth();
  const phone = normalizePhone(value);
  const debouncedPhone = useDebouncedValue(phone, PHONE_LOOKUP_DELAY_MS);
  const ready = Boolean(phone && phone === debouncedPhone);
  const query = useQuery({
    queryKey: queryKeys.planner.customerLookup(
      user?.company?.id ?? '',
      phone ?? '',
    ),
    queryFn: ({ signal }) => lookupClientApi('call', phone ?? '', signal),
    enabled: enabled && ready && Boolean(user?.subscription?.active),
    staleTime: PHONE_LOOKUP_STALE_TIME_MS,
    retry: false,
  });
  return {
    phone,
    data: ready ? query.data : undefined,
    error: ready ? query.error : null,
    checking:
      enabled &&
      Boolean(phone) &&
      (!ready || query.isPending || query.isFetching),
    retry: () => query.refetch(),
  };
};

export type BookingClientLookup = ReturnType<typeof useBookingClientLookup>;
