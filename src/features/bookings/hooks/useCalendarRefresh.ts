import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { refreshPlannerCalendar } from '@/shared/api/queryInvalidation';

export const useCalendarRefresh = () => {
  const client = useQueryClient();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await refreshPlannerCalendar(client, user?.company?.id ?? '');
    } finally {
      setRefreshing(false);
    }
  };
  return { refreshing, refresh };
};
