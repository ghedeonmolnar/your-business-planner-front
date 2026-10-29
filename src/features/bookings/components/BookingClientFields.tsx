import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { UseFormReturn } from 'react-hook-form';
import { Booking } from '@/features/bookings/types';
import { BookingFormValues } from '@/features/bookings/schemas/bookingFormSchema';
import { BookingClientLookup } from '@/features/bookings/hooks/useBookingClientLookup';
import { bookingClientStyles as styles } from '@/features/bookings/components/bookingClientStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { normalizePhone } from '@/shared/utils/contactLinks';
import { theme } from '@/shared/theme/theme';

export function BookingClientFields({
  form,
  booking,
  lookup,
}: {
  form: UseFormReturn<BookingFormValues>;
  booking?: Booking;
  lookup: BookingClientLookup;
}) {
  const retained =
    booking &&
    ((lookup.phone &&
      lookup.phone === normalizePhone(booking.client_phone ?? '')) ||
      (!lookup.phone &&
        booking.client_id === form.getValues('client_id') &&
        !form.getFieldState('client_phone').isDirty));
  const client = lookup.data?.client ?? (retained ? booking : undefined);
  const newClient = !client && lookup.data?.matched === false;
  const name =
    lookup.data?.client?.name ?? (retained ? booking?.client_name : null);
  return (
    <View style={styles.content}>
      <View style={styles.introduction}>
        <Text style={styles.title}>Adaugă numărul de telefon</Text>
        <Text style={styles.description}>
          Căutăm automat dacă acest client este deja în lista ta.
        </Text>
      </View>
      <ControlledTextField
        control={form.control}
        name="client_phone"
        label="Număr de telefon"
        required={!retained || Boolean(lookup.phone)}
        placeholder="07xx xxx xxx"
        keyboardType="phone-pad"
        autoCapitalize="none"
        leftIcon="call-outline"
        onValueChange={value => {
          if (normalizePhone(value) !== lookup.phone) {
            form.setValue('client_id', '', { shouldDirty: true });
            form.setValue('client_name', '', { shouldDirty: true });
          }
          form.clearErrors(['client_id', 'client_phone', 'client_name']);
        }}
      />
      {lookup.checking ? (
        <View style={styles.status} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={theme.colors.menu.primary} />
          <Text style={styles.description}>Căutăm clientul…</Text>
        </View>
      ) : lookup.error ? (
        <ErrorBanner
          message="Nu am putut verifica numărul. Reîncearcă pentru a continua."
          onRetry={lookup.retry}
        />
      ) : client ? (
        <View accessible style={[styles.result, styles.existing]}>
          <Ionicons
            accessible={false}
            name="checkmark-circle-outline"
            size={theme.typography.title}
            color={theme.colors.menu.success}
          />
          <View style={styles.resultContent}>
            <Text style={styles.resultLabel}>Client existent</Text>
            <Text style={styles.clientName}>
              {name || 'Clientul rezervării'}
            </Text>
            <Text
              style={[
                styles.description,
                styles.resultDescription,
                styles.existingDescription,
              ]}
            >
              Rezervarea va fi asociată acestui client.
            </Text>
          </View>
        </View>
      ) : newClient ? (
        <>
          <View style={styles.result} accessibilityLiveRegion="polite">
            <Ionicons
              accessible={false}
              name="person-add-outline"
              size={theme.typography.title}
              color={theme.colors.menu.primary}
            />
            <View style={styles.resultContent}>
              <Text style={styles.clientName}>Număr nou</Text>
              <Text style={[styles.description, styles.resultDescription]}>
                Clientul se va salva odată cu rezervarea.
              </Text>
            </View>
          </View>
          <ControlledTextField
            control={form.control}
            name="client_name"
            label="Numele clientului (opțional)"
            placeholder="Nume și prenume"
            autoCapitalize="words"
            leftIcon="person-outline"
          />
          <Text style={styles.note}>
            Poți continua doar cu numărul de telefon. Numele poate fi completat
            mai târziu.
          </Text>
        </>
      ) : (
        <Text style={styles.note}>
          Introdu numărul complet pentru a identifica un client existent sau
          pentru a adăuga unul nou.
        </Text>
      )}
    </View>
  );
}
