import React from 'react';
import { Control } from 'react-hook-form';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { bookingStatusLabels } from '@/features/bookings/utils/bookingLabels';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';

export function BookingScheduleFields({
  control,
  halls,
  selectedHallId,
}: {
  control: Control<BookingFormValues>;
  halls: DirectoryItem[];
  selectedHallId?: string;
}) {
  const catalogs = useCatalogs();
  return (
    <>
      <ControlledSelectField
        control={control}
        name="hall_id"
        label="Sală"
        single
        options={halls
          .filter(hall => hall.is_active || hall.id === selectedHallId)
          .map(hall => ({
            id: hall.id,
            name: hall.name + (hall.is_active ? '' : ' · Arhivată'),
          }))}
        placeholder="Alege sala"
        searchPlaceholder="Caută sala"
      />
      <ControlledDateField
        control={control}
        name="date"
        label="Data evenimentului"
        placeholder="Alege data"
      />
      <ControlledSelectField
        control={control}
        name="type"
        label="Tip eveniment"
        single
        options={catalogs.data?.event_types ?? []}
        placeholder="Alege tipul"
        searchPlaceholder="Caută tip"
      />
      <ControlledSelectField
        control={control}
        name="status"
        label="Stare rezervare"
        single
        options={Object.entries(bookingStatusLabels)
          .filter(([id]) => id !== 'expired')
          .map(([id, name]) => ({ id, name }))}
        placeholder="Alege starea"
        searchPlaceholder="Caută stare"
      />
      <ControlledTextField
        control={control}
        name="starts_at"
        label="Început — data și ora"
        placeholder="2026-10-24 18:00"
      />
      <ControlledTextField
        control={control}
        name="ends_at"
        label="Sfârșit — data și ora"
        placeholder="2026-10-25 04:00"
      />
      <ControlledTextField
        control={control}
        name="expires_at"
        label="Termen rezervare provizorie"
        placeholder="2026-10-22 12:00"
      />
    </>
  );
}
