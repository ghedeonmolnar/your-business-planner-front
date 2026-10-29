import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import React, { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import {
  createCatalogLabelMap,
  getCatalogLabel,
} from '@/features/catalogs/utils/catalogLabels';
import { EventCard } from '@/features/events/components/EventCard';
import { EventForm } from '@/features/events/components/EventForm';
import {
  EventsScreenHeader,
  EventsViewMode,
} from '@/features/events/components/EventsScreenHeader';
import { eventTimeframeCountLabels } from '@/features/events/components/EventTimeframeFilter';
import { EventsCalendarPanel } from '@/features/events/components/EventsCalendarPanel';
import { useEventPlanner } from '@/features/events/hooks/useEventPlanner';
import {
  EventFormInput,
  EventFormValues,
} from '@/features/events/schemas/eventSchema';
import { Event, EventTimeframe } from '@/features/events/types';
import { eventsScreenStyles as styles } from '@/features/events/screens/eventsScreenStyles';
import { eventMascotLabel } from '@/features/events/utils/eventMascotLabel';
import { useEventReservationShare } from '@/features/events/hooks/useEventReservationShare';
import { toEventPayload } from '@/features/events/utils/eventPayload';
import {
  useCreateEvent,
  useDeleteEvent,
  useEventsList,
  useUpdateEvent,
} from '@/features/events/hooks/useEvents';
import { useSendEventReviewLink } from '@/features/events/hooks/useSendEventReviewLink';
import { useMascots } from '@/features/mascots/hooks/useMascots';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { formatLongDate } from '@/shared/utils/formatDate';
import { Screen } from '@/shared/components/Screen';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export function EventsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const catalogsQuery = useCatalogs();
  const mascotsQuery = useMascots();
  const [timeframe, setTimeframe] = useState<EventTimeframe>('upcoming');
  const eventsQuery = useEventsList({ timeframe });
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { sendReviewLink } = useSendEventReviewLink();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formDefaults, setFormDefaults] =
    useState<Partial<EventFormInput> | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [viewMode, setViewMode] = useState<EventsViewMode>('calendar');
  const planner = useEventPlanner(viewMode === 'calendar');

  const events = useMemo(
    () => eventsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [eventsQuery.data],
  );
  const savedEventsCount = eventsQuery.data?.pages[0]?.total ?? events.length;
  const listError =
    eventsQuery.error ?? catalogsQuery.error ?? mascotsQuery.error;
  const eventTypeLabels = useMemo(
    () => createCatalogLabelMap(catalogsQuery.data?.event_types),
    [catalogsQuery.data?.event_types],
  );
  const mascotNamesById = useMemo(
    () =>
      new Map(
        (mascotsQuery.data ?? []).map(mascot => [mascot.id, mascot.name]),
      ),
    [mascotsQuery.data],
  );
  const reservationShare = useEventReservationShare(mascotNamesById);

  const openCreate = (defaults?: Partial<EventFormInput>) => {
    setEditingEvent(null);
    setFormDefaults(defaults ?? null);
    setFormVisible(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setFormDefaults(null);
    setFormVisible(true);
  };

  const openDetails = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const openEventById = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const closeForm = () => {
    setEditingEvent(null);
    setFormDefaults(null);
    setFormVisible(false);
  };

  const startCreateFromCalendar = () => {
    openCreate({ date: planner.selectedDate });
  };

  const saveEvent = (values: EventFormValues) => {
    const onError = (mutationError: unknown) => {
      showError(mutationError, 'Nu am putut salva evenimentul.');
    };

    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, payload: toEventPayload(values) },
        { onSuccess: closeForm, onError },
      );
      return;
    }

    createEvent.mutate(toEventPayload(values), {
      onSuccess: savedEvent =>
        reservationShare.afterSave(savedEvent, closeForm),
      onError,
    });
  };

  const confirmDelete = (event: Event) => {
    confirmAction({
      destructive: true,
      title: 'Confirmare',
      message: `Ștergi evenimentul "${event.location ?? 'Locație necompletată'}" din ${formatLongDate(event.date)}?`,
      confirmLabel: 'Șterge',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();

        return deleteEvent.mutateAsync(event.id).catch(mutationError => {
          if (actionGeneration !== getSessionGeneration()) return;
          showError(mutationError, 'Nu am putut șterge evenimentul.');
        });
      },
    });
  };

  const loadMoreEvents = () => {
    if (eventsQuery.hasNextPage && !eventsQuery.isFetchingNextPage) {
      eventsQuery.fetchNextPage();
    }
  };

  const header = (
    <EventsScreenHeader
      error={listError}
      eventsCount={savedEventsCount}
      onAdd={
        viewMode === 'calendar' ? startCreateFromCalendar : () => openCreate()
      }
      onChangeTimeframe={setTimeframe}
      onChangeViewMode={setViewMode}
      onRetry={() => {
        eventsQuery.refetch();
        catalogsQuery.refetch();
        mascotsQuery.refetch();
      }}
      timeframe={timeframe}
      viewMode={viewMode}
    />
  );

  return (
    <Screen>
      {viewMode === 'calendar' ? (
        <EventsCalendarPanel
          header={header}
          onOpenEvent={openEventById}
          planner={planner}
        />
      ) : (
        <FlatList
          ListEmptyComponent={
            eventsQuery.isLoading ? (
              <LoadingState />
            ) : (
              <EmptyState
                icon="calendar-clear-outline"
                message={
                  timeframe === 'past'
                    ? 'Evenimentele încheiate vor apărea aici.'
                    : 'Adaugă un eveniment și îl vei vedea în agendă.'
                }
                title={`Nu ai ${eventTimeframeCountLabels[timeframe]}`}
              />
            )
          }
          ListFooterComponent={
            eventsQuery.isFetchingNextPage ? <LoadingState /> : undefined
          }
          ListHeaderComponent={header}
          contentContainerStyle={styles.listContent}
          data={events}
          keyExtractor={item => item.id.toString()}
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.4}
          onRefresh={() => eventsQuery.refetch()}
          refreshing={eventsQuery.isRefetching}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              mascotLabel={eventMascotLabel(item, mascotNamesById)}
              onDetails={openDetails}
              onDelete={confirmDelete}
              onEdit={openEdit}
              onSendReviewLink={sendReviewLink}
              typeLabel={getCatalogLabel(eventTypeLabels, item.type)}
            />
          )}
        />
      )}

      <EventForm
        onDismiss={reservationShare.afterDismiss}
        initialValues={formDefaults}
        initialEvent={editingEvent}
        onCancel={closeForm}
        onSubmit={saveEvent}
        saving={createEvent.isPending || updateEvent.isPending}
        visible={isFormVisible}
      />
      {deleteEvent.isPending ? (
        <Text style={styles.pendingText}>Se șterge...</Text>
      ) : null}
    </Screen>
  );
}
