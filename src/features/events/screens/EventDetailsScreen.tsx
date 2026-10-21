import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { DocumentForm } from '@/features/events/components/DocumentForm';
import { EventDocumentsSection } from '@/features/events/components/EventDocumentsSection';
import { EventForm } from '@/features/events/components/EventForm';
import { EventPaymentsSection } from '@/features/events/components/EventPaymentsSection';
import { EventRatingSection } from '@/features/events/components/EventRatingSection';
import { EventReviewSection } from '@/features/events/components/EventReviewSection';
import { EventSummaryHeader } from '@/features/events/components/EventSummaryHeader';
import { EventMapSection } from '@/features/events/components/EventMapSection';
import { EventReservationShareButton } from '@/features/events/components/EventReservationShareButton';
import { PaymentForm } from '@/features/events/components/PaymentForm';
import {
  useEvent,
  useEventDocuments,
  useEventPayments,
  useEventReview,
} from '@/features/events/hooks/useEvents';
import { useEventDetailsActions } from '@/features/events/hooks/useEventDetailsActions';
import { useSendEventReviewLink } from '@/features/events/hooks/useSendEventReviewLink';
import { eventDetailsScreenStyles as styles } from '@/features/events/screens/eventDetailsScreenStyles';
import {
  buildContactUrl,
  eventContactPhone,
  openContact,
} from '@/shared/utils/contactLinks';
import { hasEventEnded } from '@/features/events/utils/eventCompletion';
import { isUnauthorizedError } from '@/shared/api/client';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { SectionDivider } from '@/shared/components/SectionDivider';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type EventDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EventDetails'
>;

type DetailsTab = 'payments' | 'documents';

export function EventDetailsScreen({
  navigation,
  route,
}: EventDetailsScreenProps) {
  const eventId = route.params.eventId;
  const eventQuery = useEvent(eventId);
  const event = eventQuery.data ?? null;
  const paymentsQuery = useEventPayments(eventId, true);
  const documentsQuery = useEventDocuments(eventId, true);
  const isFinished = Boolean(
    event && event.status !== 'cancelled' && hasEventEnded(event),
  );
  const reviewQuery = useEventReview(eventId, isFinished);
  const { sendReviewLink, isSending } = useSendEventReviewLink();
  const actions = useEventDetailsActions(eventId);
  const [activeTab, setActiveTab] = useState<DetailsTab>('payments');
  const paidAmount = event?.paid_amount ?? 0;
  const totalAmount = event?.total_amount ?? 0;
  const balanceDue = event?.balance_due ?? 0;
  const cashProfit = event?.cash_profit_amount ?? 0;
  const hasRatingSection = Boolean(event?.rating || event?.notes?.trim());
  const whatsAppPhone = event ? eventContactPhone(event) : null;
  const hasWhatsApp = Boolean(buildContactUrl('whatsapp', whatsAppPhone));

  const renderPayments = () => (
    <EventPaymentsSection
      error={paymentsQuery.error}
      loading={paymentsQuery.isLoading}
      onAdd={actions.openCreatePayment}
      onDelete={actions.confirmDeletePayment}
      onEdit={actions.openEditPayment}
      onRetry={() => paymentsQuery.refetch()}
      payments={paymentsQuery.data ?? []}
      totals={{ totalAmount, paidAmount, balanceDue, cashProfit }}
    />
  );

  const renderDocuments = () => (
    <EventDocumentsSection
      documents={documentsQuery.data ?? []}
      error={documentsQuery.error}
      loading={documentsQuery.isLoading}
      onAdd={actions.openCreateDocument}
      onDelete={actions.confirmDeleteDocument}
      onEdit={actions.openEditDocument}
      onOpen={actions.openDocument}
      onRetry={() => documentsQuery.refetch()}
    />
  );

  return (
    <Screen>
      <View style={styles.navigationRow}>
        <IconButton
          accessibilityLabel="Înapoi la evenimente"
          icon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.navigationTitle}>Detalii eveniment</Text>
        {event && hasWhatsApp ? (
          <IconButton
            accessibilityLabel="Deschide conversația WhatsApp"
            color={theme.colors.success}
            icon="logo-whatsapp"
            onPress={() => openContact('whatsapp', whatsAppPhone)}
            style={styles.navigationAction}
          />
        ) : null}
        {event ? (
          <EditIconButton
            accessibilityLabel="Editează evenimentul"
            onPress={actions.openEventForm}
          />
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.contentScroll}
      >
        {eventQuery.isLoading ? <LoadingState /> : null}

        {eventQuery.error && !isUnauthorizedError(eventQuery.error) ? (
          <ErrorBanner
            message={getErrorMessage(
              eventQuery.error,
              'Nu am putut încărca evenimentul.',
            )}
            onRetry={() => eventQuery.refetch()}
          />
        ) : null}

        {event ? (
          <>
            <EventSummaryHeader event={event}>
              <EventReservationShareButton event={event} />
            </EventSummaryHeader>
            <EventMapSection
              event={event}
              onEdit={() => navigation.navigate('EventMapPicker', { eventId })}
            />

            {hasRatingSection ? (
              <>
                <SectionDivider />
                <EventRatingSection notes={event.notes} rating={event.rating} />
              </>
            ) : null}

            {isFinished ? (
              <>
                <SectionDivider />
                <EventReviewSection
                  loading={reviewQuery.isLoading}
                  onSend={() => sendReviewLink(event)}
                  review={reviewQuery.data ?? null}
                  sending={isSending}
                />
              </>
            ) : null}

            <SectionDivider />

            <AppSegmentedControl
              containerStyle={styles.segmentedControl}
              onChangeIndex={index =>
                setActiveTab(index === 0 ? 'payments' : 'documents')
              }
              selectedIndex={activeTab === 'payments' ? 0 : 1}
              segments={[{ label: 'Plăți' }, { label: 'Documente' }]}
            />

            {activeTab === 'payments' ? renderPayments() : renderDocuments()}
          </>
        ) : null}
      </ScrollView>

      <EventForm
        initialEvent={event}
        onCancel={actions.closeEventForm}
        onSubmit={actions.saveEvent}
        saving={actions.isSavingEvent}
        visible={actions.isEventFormVisible}
      />
      <PaymentForm
        event={event}
        defaultAmount={balanceDue}
        eventRating={event?.rating ?? null}
        initialPayment={actions.editingPayment}
        onCancel={actions.closePaymentForm}
        onSubmit={actions.savePayment}
        saving={actions.isSavingPayment}
        visible={actions.paymentFormVisible}
      />
      <DocumentForm
        initialDocument={actions.editingDocument}
        onCancel={actions.closeDocumentForm}
        onCreate={actions.saveDocumentCreate}
        onUpdate={actions.saveDocumentUpdate}
        saving={actions.isSavingDocument}
        visible={actions.documentFormVisible}
      />
    </Screen>
  );
}
