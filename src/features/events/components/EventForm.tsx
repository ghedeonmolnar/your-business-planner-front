import React, { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCatalogs } from '@/features/catalogs/hooks/useCatalogs';
import { useClientLookup } from '@/features/clients/hooks/useClients';
import { AssignmentsStep } from '@/features/events/components/eventForm/AssignmentsStep';
import { EventDetailsStep } from '@/features/events/components/eventForm/EventDetailsStep';
import { EventFormFooter } from '@/features/events/components/eventForm/EventFormFooter';
import { ScheduleStep } from '@/features/events/components/eventForm/ScheduleStep';
import { StepIndicator } from '@/features/events/components/eventForm/StepIndicator';
import {
  eventDateBounds,
  EventFormStep,
  fallbackChannels,
  MIN_CONTACT_LENGTH,
  stepFields,
} from '@/features/events/components/eventForm/eventFormConfig';
import { useEventFormSync } from '@/features/events/components/eventForm/useEventFormSync';
import {
  createEventSchema,
  emptyEventForm,
  EventFormInput,
  EventFormValues,
  eventSchema,
} from '@/features/events/schemas/eventSchema';
import { Event } from '@/features/events/types';
import { useAvailability } from '@/features/events/hooks/useEvents';
import {
  eventHourOptions,
  eventTimeRegex,
  eventTimeToMinutes,
} from '@/features/events/utils/eventTimes';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useMascots } from '@/features/mascots/hooks/useMascots';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { eventContactPhone } from '@/shared/utils/contactLinks';

type EventFormProps = {
  visible: boolean;
  initialEvent?: Event | null;
  initialValues?: Partial<EventFormInput> | null;
  saving: boolean;
  onCancel: () => void;
  onDismiss?: () => void;
  onSubmit: (values: EventFormValues) => void;
};

export function EventForm({
  visible,
  initialEvent,
  initialValues,
  saving,
  onCancel,
  onDismiss,
  onSubmit,
}: EventFormProps) {
  const isEdit = Boolean(initialEvent);
  const catalogsQuery = useCatalogs();
  const employeesQuery = useEmployees();
  const mascotsQuery = useMascots();
  const [currentStep, setCurrentStep] = useState<EventFormStep>(1);
  const {
    control,
    formState: { dirtyFields, isDirty },
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
  } = useAppForm<EventFormInput, unknown, EventFormValues>({
    resolver: zodResolver(isEdit ? eventSchema : createEventSchema),
    defaultValues: emptyEventForm,
  });
  const watchedMascotIds = useWatch({ control, name: 'mascot_ids' });
  const selectedMascotIds = useMemo(
    () => watchedMascotIds ?? [],
    [watchedMascotIds],
  );
  const assignments = useWatch({ control, name: 'assignments' }) ?? [];
  const selectedDate = useWatch({ control, name: 'date' });
  const contactPhone = useWatch({ control, name: 'contact_phone' }) ?? '';
  const debouncedContact = useDebouncedValue(contactPhone.trim(), 600);
  const selectedStartTime = useWatch({ control, name: 'start_time' });
  const selectedEndTime = useWatch({ control, name: 'end_time' });
  const selectedStartMinutes = eventTimeToMinutes(selectedStartTime ?? '');
  const hourOptions = catalogsQuery.data?.event_hour_times?.length
    ? catalogsQuery.data.event_hour_times
    : eventHourOptions;
  const endTimeOptions =
    selectedStartMinutes === null
      ? hourOptions
      : hourOptions.filter(option => {
          const optionMinutes = eventTimeToMinutes(option.id);

          return optionMinutes !== null && optionMinutes > selectedStartMinutes;
        });
  const isAvailabilityRangeValid =
    eventTimeRegex.test(selectedStartTime ?? '') &&
    eventTimeRegex.test(selectedEndTime ?? '') &&
    selectedEndTime > selectedStartTime;
  const availabilityQuery = useAvailability(
    {
      date: selectedDate || '',
      start_time: selectedStartTime || '',
      end_time: selectedEndTime || '',
      exclude_event_id: initialEvent?.id,
    },
    visible && Boolean(selectedDate) && isAvailabilityRangeValid,
  );
  const communicationOptions = catalogsQuery.data?.communication_channels
    ?.length
    ? catalogsQuery.data.communication_channels
    : fallbackChannels;
  const selectedMascots = useMemo(
    () =>
      (mascotsQuery.data ?? []).filter(mascot =>
        selectedMascotIds.includes(mascot.id),
      ),
    [mascotsQuery.data, selectedMascotIds],
  );
  const clientLookupQuery = useClientLookup(
    'call',
    debouncedContact,
    visible && !isEdit && debouncedContact.length >= MIN_CONTACT_LENGTH,
  );
  const knownClient = clientLookupQuery.data?.matched
    ? clientLookupQuery.data
    : null;
  const suggestion = knownClient?.suggestion ?? null;
  useEventFormSync({
    getValues,
    initialEvent,
    initialValues,
    isPriceDirty: Boolean(dirtyFields.price_per_hour),
    reset,
    selectedMascotIds,
    selectedMascots,
    setCurrentStep,
    setValue,
    suggestion,
    visible,
  });
  const { maximumDate: maximumEventDate, minimumDate: minimumEventDate } =
    eventDateBounds(initialEvent);

  const goForward = async () => {
    if (currentStep === 3) {
      return;
    }

    const isValid = await trigger(stepFields[currentStep]);

    if (isValid) {
      setCurrentStep(step => Math.min(step + 1, 3) as 1 | 2 | 3);
    }
  };

  const footer = (
    <EventFormFooter
      currentStep={currentStep}
      isEdit={isEdit}
      knownClientEventsCount={knownClient?.events_count ?? 0}
      onBack={() =>
        setCurrentStep(step => Math.max(step - 1, 1) as EventFormStep)
      }
      onContinue={currentStep === 3 ? handleSubmit(onSubmit) : goForward}
      saving={saving}
    />
  );

  return (
    <FormModalFrame
      footer={footer}
      hasUnsavedChanges={isDirty}
      onClose={onCancel}
      onDismiss={onDismiss}
      title={`${
        isEdit ? 'Editează eveniment' : 'Eveniment nou'
      } · Pas ${currentStep}/3`}
      visible={visible}
      busy={saving}
    >
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <EventDetailsStep
          catalogsLoading={catalogsQuery.isLoading}
          channelOptions={communicationOptions}
          control={control}
          maximumEventDate={maximumEventDate}
          minimumEventDate={minimumEventDate}
          mascotsLoading={mascotsQuery.isLoading}
          mascotOptions={(mascotsQuery.data ?? [])
            .filter(
              mascot =>
                mascot.is_active || selectedMascotIds.includes(mascot.id),
            )
            .map(mascot => ({ id: mascot.id, name: mascot.name }))}
          showLegacyContactHint={Boolean(
            initialEvent && !eventContactPhone(initialEvent),
          )}
        />
      )}

      {currentStep === 2 && (
        <ScheduleStep
          control={control}
          endTimeOptions={endTimeOptions}
          hourOptions={hourOptions}
          isEdit={isEdit}
        />
      )}

      {currentStep === 3 && (
        <AssignmentsStep
          assignments={assignments}
          availability={availabilityQuery.data?.employees ?? []}
          availabilityLoading={availabilityQuery.isLoading}
          control={control}
          employees={employeesQuery.data ?? []}
          mascots={selectedMascots}
          scheduleComplete={isAvailabilityRangeValid}
        />
      )}
    </FormModalFrame>
  );
}
