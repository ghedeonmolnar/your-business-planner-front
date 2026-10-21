import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { InlineClientForm } from '@/features/company/components/InlineClientForm';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { SearchField } from '@/shared/components/SearchField';
import { AppButton } from '@/shared/components/AppButton';

export function BookingClientFields({
  form,
  booking,
  selectedClient,
  onSelected,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  selectedClient: DirectoryItem | null;
  onSelected: (client: DirectoryItem) => void;
}) {
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const clients = useDirectory('clients', search);
  const retained = selectedClient ? [selectedClient] : [];
  if (booking) {
    retained.push({
      id: booking.client_id,
      name: booking.client_name ?? 'Clientul rezervării',
    });
  }
  const options = includeDirectorySelections(
    clients.data?.pages.flatMap(page => page.items) ?? [],
    retained,
  );
  return (
    <>
      <SearchField
        value={search}
        onChange={setSearch}
        label="Caută client în companie"
        placeholder="Nume sau telefon"
      />
      <QueryNotice
        loading={clients.isLoading}
        error={clients.error}
        retry={() => clients.refetch()}
      />
      <ControlledSelectField
        control={form.control}
        name="client_id"
        label="Client"
        single
        options={options.map(client => ({ id: client.id, name: client.name }))}
        onSelectionChange={values => {
          const item = options.find(client => client.id === values[0]);
          if (item) {
            onSelected(item);
          }
        }}
        placeholder="Alege clientul"
        searchPlaceholder="Caută client"
      />
      {adding ? (
        <InlineClientForm
          onCancel={() => setAdding(false)}
          onCreated={client => {
            form.setValue('client_id', client.id, {
              shouldDirty: true,
              shouldValidate: true,
            });
            onSelected(client);
            setSearch('');
            setAdding(false);
          }}
        />
      ) : (
        <AppButton
          label="Client nou"
          variant="outline"
          onPress={() => setAdding(true)}
        />
      )}
      {clients.hasNextPage ? (
        <AppButton
          label="Mai mulți clienți"
          disabled={clients.isFetchingNextPage}
          onPress={() => clients.fetchNextPage()}
        />
      ) : null}
    </>
  );
}
