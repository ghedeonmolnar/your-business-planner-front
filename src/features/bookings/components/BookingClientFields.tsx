import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { DirectoryItem } from '@/features/company/types';
import { useDirectory } from '@/features/company/hooks/useCompany';
import { includeDirectorySelections } from '@/features/company/utils/includeDirectorySelections';
import { InlineClientForm } from '@/features/company/components/InlineClientForm';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { SearchField } from '@/shared/components/SearchField';
import { AppButton } from '@/shared/components/AppButton';
import { Text } from 'react-native-paper';
import { BookingPhoneForm } from '@/features/bookings/components/BookingPhoneForm';
import { buildContactUrl } from '@/shared/utils/contactLinks';

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
  const [editingPhone, setEditingPhone] = useState(false);
  const clients = useDirectory('clients', search);
  const retained = selectedClient ? [selectedClient] : [];
  if (booking) {
    retained.push({
      id: booking.client_id,
      name: booking.client_name ?? 'Clientul rezervării',
      phone: booking.client_phone,
      version: booking.client_version ?? undefined,
    });
  }
  const options = includeDirectorySelections(
    clients.data?.pages.flatMap(page => page.items) ?? [],
    retained,
  );
  const selectedClientId = form.watch('client_id');
  const currentClient =
    selectedClient?.id === selectedClientId
      ? selectedClient
      : options.find(item => item.id === selectedClientId);
  return (
    <>
      <SearchField
        value={search}
        onChange={setSearch}
        label="Caută client în companie"
        placeholder="Nume sau telefon"
      />
      <ControlledSelectField
        control={form.control}
        name="client_id"
        label="Client"
        icon="person-outline"
        optionsState={{
          loading: clients.isLoading,
          error: clients.error,
          onRetry: () => clients.refetch(),
          pagination: {
            hasMore: Boolean(clients.hasNextPage),
            loading: clients.isFetchingNextPage,
            error: clients.isFetchNextPageError ? clients.error : undefined,
            onLoadMore: () => clients.fetchNextPage(),
          },
        }}
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
      {currentClient ? (
        <>
          <Text>{currentClient.phone || 'Telefon lipsă'}</Text>
          {!buildContactUrl('call', currentClient.phone) ? (
            <AppButton
              label="Completează telefonul"
              variant="ghost"
              onPress={() => setEditingPhone(true)}
            />
          ) : null}
        </>
      ) : null}
      {editingPhone && currentClient ? (
        <BookingPhoneForm
          client={currentClient}
          onSaved={updated => {
            onSelected(updated);
            form.clearErrors('client_id');
          }}
          onClose={() => setEditingPhone(false)}
        />
      ) : null}
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
    </>
  );
}
