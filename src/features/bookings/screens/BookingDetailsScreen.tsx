import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useBooking,
  useCancelBooking,
} from '@/features/bookings/hooks/useBookings';
import { BookingCommercialSummary } from '@/features/bookings/components/BookingCommercialSummary';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingDocuments } from '@/features/bookings/components/BookingDocuments';
import { BookingPayments } from '@/features/bookings/components/BookingPayments';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import {
  bookingStatusLabels,
  staffRoleOptions,
} from '@/features/bookings/utils/bookingLabels';
import { bookingMessage } from '@/features/bookings/utils/bookingMessage';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { RootStackParamList } from '@/shared/navigation/types';
import {
  formatCompanyDateTime,
  formatLongDate,
} from '@/shared/utils/formatDate';
import { formatExactMoney } from '@/shared/utils/money';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { openWhatsAppShare } from '@/shared/utils/contactLinks';

export function BookingDetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EventDetails'>) {
  const query = useBooking(route.params.eventId);
  const cancel = useCancelBooking();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const booking = query.data;
  const manager = user?.role !== 'employee';
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <AppButton
          label="Înapoi"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <QueryNotice
          loading={query.isLoading}
          error={query.error}
          retry={() => query.refetch()}
        />
        {booking ? (
          <>
            <Text style={styles.title}>
              {booking.client_name} · {booking.hall_name}
            </Text>
            <Text style={styles.text}>
              {formatLongDate(booking.date)} ·{' '}
              {bookingStatusLabels[booking.status]}
            </Text>
            <Text style={styles.text}>
              Început: {formatCompanyDateTime(booking.starts_at)}
            </Text>
            <Text style={styles.text}>
              Sfârșit: {formatCompanyDateTime(booking.ends_at)}
            </Text>
            {manager ? (
              <>
                {booking.expires_at ? (
                  <Text style={styles.text}>
                    Termen provizoriu:{' '}
                    {formatCompanyDateTime(booking.expires_at)}
                  </Text>
                ) : null}
                <Text style={styles.text}>
                  Telefon: {booking.client_phone || 'Necompletat'}
                </Text>
                <BookingCommercialSummary booking={booking} />
                <AppButton
                  label="Editează rezervarea"
                  onPress={() => setEditing(true)}
                />
                <AppButton
                  label="Verifică și trimite pe WhatsApp"
                  variant="outline"
                  onPress={() =>
                    confirmAction({
                      title: 'Verifică mesajul',
                      message: bookingMessage(
                        booking,
                        user?.company?.name ?? '',
                      ),
                      confirmLabel: 'Deschide WhatsApp',
                      onConfirm: () => {
                        openWhatsAppShare(
                          booking.client_phone,
                          bookingMessage(booking, user?.company?.name ?? ''),
                        );
                      },
                    })
                  }
                />
                {!['cancelled', 'expired'].includes(booking.status) ? (
                  <AppButton
                    label="Anulează rezervarea"
                    variant="ghost"
                    disabled={cancel.isPending}
                    onPress={() =>
                      confirmAction({
                        title: 'Anulezi rezervarea?',
                        message:
                          'Sala se eliberează. Plățile rămân în istoric.',
                        confirmLabel: 'Anulează rezervarea',
                        onConfirm: () =>
                          cancel.mutate(
                            { id: booking.id, version: booking.version },
                            {
                              onError: error =>
                                showError(
                                  error,
                                  'Nu am putut anula rezervarea.',
                                ),
                            },
                          ),
                      })
                    }
                  />
                ) : null}
              </>
            ) : null}
            {hasCompanyFeature(user, 'staff') ? (
              <Text style={styles.subtitle}>Personal alocat</Text>
            ) : null}
            {hasCompanyFeature(user, 'staff') &&
              booking.staff.map(person => (
                <Card key={person.employee_id} style={styles.card}>
                  <Text style={styles.text}>
                    {person.employee_name} ·{' '}
                    {
                      staffRoleOptions.find(role => role.id === person.job_role)
                        ?.name
                    }
                  </Text>
                  <Text style={styles.text}>
                    {formatCompanyDateTime(person.starts_at)} –{' '}
                    {formatCompanyDateTime(person.ends_at)}
                  </Text>
                  <Text style={styles.text}>
                    Remunerație estimată:{' '}
                    {formatExactMoney(person.estimated_cost)}
                  </Text>
                </Card>
              ))}
            {manager ? (
              <>
                {hasCompanyFeature(user, 'finance') ? (
                  <BookingPayments eventId={booking.id} />
                ) : null}
                {hasCompanyFeature(user, 'documents') ? (
                  <BookingDocuments eventId={booking.id} />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      {editing && booking ? (
        <BookingForm
          date={booking.date}
          booking={booking}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </Screen>
  );
}
