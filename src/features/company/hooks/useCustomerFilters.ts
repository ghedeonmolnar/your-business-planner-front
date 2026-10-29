import { useState } from 'react';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CustomerDateRange,
  customerDateRangeSchema,
} from '@/features/company/schemas/customerListSchemas';
import { CustomerSort } from '@/features/company/types';
import { ApiError } from '@/shared/api/apiError';
import { showError } from '@/shared/feedback/showError';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

const SEARCH_DELAY_MS = 300;
const EMPTY_RANGE: CustomerDateRange = { date_from: '', date_to: '' };

export function useCustomerFilters() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<CustomerSort>('name_asc');
  const [range, setRange] = useState<CustomerDateRange | null>(null);
  const [expanded, setExpanded] = useState(false);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DELAY_MS);
  const form = useAppForm<CustomerDateRange>({
    resolver: zodResolver(customerDateRangeSchema),
    defaultValues: EMPTY_RANGE,
  });

  const resetDates = () => {
    form.reset(EMPTY_RANGE);
    setRange(null);
  };

  const apply = form.handleSubmit(
    values => {
      setRange(values);
      setExpanded(false);
    },
    errors => {
      const message =
        errors.date_from?.message ??
        errors.date_to?.message ??
        'Verifică intervalul evenimentelor.';
      showError(new ApiError(message, 422), message);
    },
  );

  return {
    search,
    setSearch,
    searchOpen,
    toggleSearch: () => {
      setSearchOpen(!searchOpen);
      if (searchOpen) setSearch('');
    },
    sort,
    setSort,
    range,
    form,
    expanded,
    toggleExpanded: () => setExpanded(value => !value),
    apply,
    resetDates,
    resetAll: () => {
      resetDates();
      setSearch('');
      setSearchOpen(false);
      setSort('name_asc');
    },
    queryFilters: { search: debouncedSearch, sort, ...range },
  };
}
