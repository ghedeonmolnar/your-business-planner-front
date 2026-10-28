import { useState } from 'react';
import {
  BookingFilters,
  BookingSort,
  BookingTimeframe,
} from '@/features/bookings/types';
import {
  BookingAdvancedFilterValues,
  EMPTY_BOOKING_ADVANCED_FILTERS,
} from '@/features/bookings/schemas/bookingFilterSchema';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

const SEARCH_DELAY_MS = 300;

export function useBookingFilters(financeEnabled: boolean) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<BookingTimeframe>('upcoming');
  const [status, setStatus] = useState('');
  const [hallId, setHallId] = useState('');
  const [manualSort, setManualSort] = useState<BookingSort | null>(null);
  const [advanced, setAdvanced] = useState(EMPTY_BOOKING_ADVANCED_FILTERS);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);
  const sort =
    manualSort ?? (timeframe === 'upcoming' ? 'date_asc' : 'date_desc');
  const paymentStatus = financeEnabled ? advanced.payment_status : '';
  const advancedCount =
    Number(Boolean(advanced.date_from || advanced.date_to)) +
    Number(Boolean(advanced.type)) +
    Number(Boolean(paymentStatus));
  const queryFilters: BookingFilters = {
    search: debouncedSearch || undefined,
    timeframe,
    status: status || undefined,
    hall_id: hallId || undefined,
    sort,
    date_from: advanced.date_from || undefined,
    date_to: advanced.date_to || undefined,
    type: advanced.type || undefined,
    payment_status: paymentStatus || undefined,
  };

  const resetAll = () => {
    setSearch('');
    setSearchOpen(false);
    setTimeframe('upcoming');
    setStatus('');
    setHallId('');
    setManualSort(null);
    setAdvanced(EMPTY_BOOKING_ADVANCED_FILTERS);
    setAdvancedOpen(false);
  };

  return {
    search,
    setSearch,
    searchOpen,
    toggleSearch: () => {
      setSearchOpen(!searchOpen);
      if (searchOpen) setSearch('');
    },
    timeframe,
    setTimeframe,
    status,
    setStatus,
    hallId,
    setHallId,
    sort,
    setSort: setManualSort,
    advanced,
    advancedCount,
    advancedOpen,
    openAdvanced: () => setAdvancedOpen(true),
    closeAdvanced: () => setAdvancedOpen(false),
    applyAdvanced: (values: BookingAdvancedFilterValues) => {
      setAdvanced(values);
      setAdvancedOpen(false);
    },
    resetAll,
    queryFilters,
    hasActiveFilters: Boolean(
      search.trim() ||
      status ||
      hallId ||
      manualSort ||
      advancedCount ||
      timeframe !== 'upcoming',
    ),
    searchPending: search.trim() !== debouncedSearch,
  };
}
