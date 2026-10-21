import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { getBookingRemindersApi } from '@/features/bookings/api/bookingRemindersApi';
import { queryKeys } from '@/shared/api/queryKeys';

export const useBookingReminders = (enabled: boolean) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.planner.reminders(
      user?.company?.id ?? '',
      user?.id ?? '',
    ),
    queryFn: ({ signal }) => getBookingRemindersApi(signal),
    enabled:
      enabled &&
      Boolean(user?.subscription?.active) &&
      hasCompanyFeature(user, 'reminders'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};
