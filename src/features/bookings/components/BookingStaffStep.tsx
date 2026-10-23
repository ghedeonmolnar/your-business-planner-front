import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { BookingStaffFields } from '@/features/bookings/components/BookingStaffFields';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import {
  useDirectory,
  useStaffAvailability,
} from '@/features/company/hooks/useCompany';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { AppButton } from '@/shared/components/AppButton';
import { toCompanyTimestamp } from '@/shared/utils/formatDate';

export function BookingStaffStep({
  form,
  booking,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
}) {
  const startsAt = form.watch('starts_at');
  const endsAt = form.watch('ends_at');
  const employees = useDirectory('employees');
  const availability = useStaffAvailability(
    toCompanyTimestamp(startsAt),
    toCompanyTimestamp(endsAt),
    booking?.id,
  );
  const query = startsAt && endsAt ? availability : employees;
  return (
    <>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      <BookingStaffFields
        form={form}
        employees={includeDirectorySelections(
          query.data?.pages.flatMap(page => page.items) ?? [],
          booking?.staff.map(person => ({
            id: person.employee_id,
            name: person.employee_name ?? '',
            is_active: false,
          })) ?? [],
        )}
      />
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe persoane"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
    </>
  );
}
