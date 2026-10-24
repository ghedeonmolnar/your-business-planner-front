import React, { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useBooking,
  useCancelBooking,
} from '@/features/bookings/hooks/useBookings';
import { BookingDetailsHeader } from '@/features/bookings/components/BookingDetailsHeader';
import { BookingDetailsLoading } from '@/features/bookings/components/BookingDetailsLoading';
import { BookingSummaryCard } from '@/features/bookings/components/BookingSummaryCard';
import { BookingEventSection } from '@/features/bookings/components/BookingEventSection';
import { BookingFinancialSection } from '@/features/bookings/components/BookingFinancialSection';
import { BookingStaffSection } from '@/features/bookings/components/BookingStaffSection';
import { BookingDetailsSection } from '@/features/bookings/components/BookingDetailsSection';
import { BookingForm } from '@/features/bookings/components/BookingForm';
import { BookingDocuments } from '@/features/bookings/components/BookingDocuments';
import { BookingPayments } from '@/features/bookings/components/BookingPayments';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';
import { bookingMessage } from '@/features/bookings/utils/bookingMessage';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { BookingPhoneForm } from '@/features/bookings/components/BookingPhoneForm';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { QueryState } from '@/shared/components/QueryState';
import { Screen } from '@/shared/components/Screen';
import { RootStackParamList } from '@/shared/navigation/types';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import {
  buildContactUrl,
  openWhatsAppShare,
} from '@/shared/utils/contactLinks';

export function BookingDetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EventDetails'>) {
  const query = useBooking(route.params.eventId);
  const cancel = useCancelBooking();
  const cancelling = useRef(false);
  const { user } = useAuth();
  const manager = Boolean(user && user.role !== 'employee');
  const catalogs = useCatalogs(manager);
  const [editing, setEditing] = useState(false);
  const [completingPhone, setCompletingPhone] = useState(false);
  const booking = query.data;
  const financeEnabled = hasCompanyFeature(user, 'finance');
  const validPhone = Boolean(buildContactUrl('call', booking?.client_phone));
  const share = () => {
    if (!booking || !manager || !validPhone) return;
    const message = bookingMessage(booking, user?.company?.name ?? '');
    confirmAction({
      title: 'Verifică mesajul și destinatarul',
      message: `Către: ${booking.client_name ?? 'Client'} · ${booking.client_phone}\n\n${message}`,
      confirmLabel: 'Deschide WhatsApp',
      cancelLabel: 'Renunță',
      onConfirm: () => {
        openWhatsAppShare(booking.client_phone, message);
      },
    });
  };
  const cancelBooking = () => {
    if (
      !booking ||
      !manager ||
      cancel.isPending ||
      ['cancelled', 'expired'].includes(booking.status)
    )
      return;
    confirmAction({
      title: 'Anulezi rezervarea?',
      message:
        'Sala se eliberează în calendar. Rezervarea și plățile rămân în istoric.',
      confirmLabel: 'Anulează rezervarea',
      cancelLabel: 'Păstrează rezervarea',
      onConfirm: () => {
        if (cancelling.current) return;
        cancelling.current = true;
        cancel.mutate(
          { id: booking.id, version: booking.version },
          {
            onError: error => showError(error, 'Nu am putut anula rezervarea.'),
            onSettled: () => {
              cancelling.current = false;
            },
          },
        );
      },
    });
  };
  const paymentsSummary =
    booking?.incoming_payments_count === undefined ||
    booking.outgoing_payments_count === undefined
      ? 'Încasări și cheltuieli ale rezervării'
      : `${booking.incoming_payments_count} ${booking.incoming_payments_count === 1 ? 'încasare' : 'încasări'} · ${booking.outgoing_payments_count} ${booking.outgoing_payments_count === 1 ? 'cheltuială' : 'cheltuieli'}`;
  return (
    <Screen>
      <BookingDetailsHeader
        onBack={() => navigation.goBack()}
        onEdit={() => setEditing(true)}
        onShare={share}
        onCancel={cancelBooking}
        canManage={manager && Boolean(booking)}
        canShare={validPhone}
        canCancel={Boolean(
          booking && !['cancelled', 'expired'].includes(booking.status),
        )}
        busy={cancel.isPending}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {query.isLoading && !booking ? <BookingDetailsLoading /> : null}
        <QueryState
          loading={false}
          hasData={Boolean(booking)}
          error={query.error}
          retry={() => query.refetch()}
        />
        {booking ? (
          <>
            <BookingSummaryCard
              booking={booking}
              eventType={getCatalogLabel(
                createCatalogLabelMap(catalogs.data?.event_types),
                booking.type,
              )}
              canManage={manager}
              onShare={share}
              onCompletePhone={() => setCompletingPhone(true)}
            />
            <BookingEventSection booking={booking} canManage={manager} />
            {manager ? (
              <BookingFinancialSection
                booking={booking}
                financeEnabled={financeEnabled}
              />
            ) : null}
            {hasCompanyFeature(user, 'staff') ? (
              <BookingStaffSection
                booking={booking}
                showCost={
                  user?.role === 'employee' || (manager && financeEnabled)
                }
              />
            ) : null}
            {manager && financeEnabled ? (
              <BookingDetailsSection
                title="Plăți și cheltuieli"
                icon="card-outline"
                summary={paymentsSummary}
              >
                <BookingPayments eventId={booking.id} />
              </BookingDetailsSection>
            ) : null}
            {manager && hasCompanyFeature(user, 'documents') ? (
              <BookingDetailsSection
                title="Documente"
                icon="document-text-outline"
                summary={
                  booking.documents_count === undefined
                    ? 'Documentele rezervării'
                    : booking.documents_count
                      ? `${booking.documents_count} ${booking.documents_count === 1 ? 'document' : 'documente'}`
                      : 'Nu există documente'
                }
              >
                <BookingDocuments eventId={booking.id} />
              </BookingDetailsSection>
            ) : null}
            {manager ? (
              <BookingDetailsSection
                title="Note interne"
                icon="chatbox-outline"
                summary={booking.notes || 'Nu există note interne'}
              >
                <Text style={styles.body}>
                  {booking.notes || 'Nu există note interne.'}
                </Text>
              </BookingDetailsSection>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      {editing && booking && manager ? (
        <BookingForm
          date={booking.date}
          booking={booking}
          onClose={() => setEditing(false)}
        />
      ) : null}
      {completingPhone && booking && manager ? (
        <BookingPhoneForm
          client={{
            id: booking.client_id,
            name: booking.client_name ?? '',
            phone: booking.client_phone,
            version: booking.client_version ?? undefined,
          }}
          onClose={() => setCompletingPhone(false)}
        />
      ) : null}
    </Screen>
  );
}
