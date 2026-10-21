import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import {
  UseFormGetValues,
  UseFormReset,
  UseFormSetValue,
} from 'react-hook-form';
import { Mascot } from '@/features/mascots/types';
import { EventFormInput } from '@/features/events/schemas/eventSchema';
import { Event } from '@/features/events/types';
import {
  ClientSuggestion,
  SuggestedField,
  suggestedFields,
  suggestionUpdates,
} from '@/features/events/utils/clientSuggestion';
import {
  EventFormStep,
  toEventFormValues,
} from '@/features/events/components/eventForm/eventFormConfig';
import { sumMoney } from '@/shared/utils/money';

type EventFormSyncOptions = {
  getValues: UseFormGetValues<EventFormInput>;
  initialEvent?: Event | null;
  initialValues?: Partial<EventFormInput> | null;
  isPriceDirty: boolean;
  reset: UseFormReset<EventFormInput>;
  selectedMascotIds: string[];
  selectedMascots: Mascot[];
  setCurrentStep: Dispatch<SetStateAction<EventFormStep>>;
  setValue: UseFormSetValue<EventFormInput>;
  suggestion: ClientSuggestion;
  visible: boolean;
};

export const useEventFormSync = ({
  getValues,
  initialEvent,
  initialValues,
  isPriceDirty,
  reset,
  selectedMascotIds,
  selectedMascots,
  setCurrentStep,
  setValue,
  suggestion,
  visible,
}: EventFormSyncOptions) => {
  const proposedValues = useRef<Partial<Record<SuggestedField, string>>>({});

  useEffect(() => {
    if (!visible) {
      return;
    }

    proposedValues.current = {};
    reset(toEventFormValues(initialEvent, initialValues));
    setCurrentStep(1);
  }, [initialEvent, initialValues, reset, setCurrentStep, visible]);

  useEffect(() => {
    if (initialEvent) {
      return;
    }

    const currentValues = suggestedFields.reduce(
      (values, field) => ({ ...values, [field]: getValues(field) ?? '' }),
      {} as Partial<Record<SuggestedField, string>>,
    );
    const updates = suggestionUpdates(
      suggestion,
      currentValues,
      proposedValues.current,
    );

    Object.entries(updates).forEach(([field, proposal]) => {
      proposedValues.current[field as SuggestedField] = proposal;
      setValue(field as SuggestedField, proposal, {
        shouldDirty: false,
        shouldValidate: false,
      });
    });
  }, [getValues, initialEvent, setValue, suggestion]);

  useEffect(() => {
    const currentAssignments = getValues('assignments');
    const nextAssignments = selectedMascotIds.map(mascotId => {
      const existing = currentAssignments.find(
        assignment => assignment.mascot_id === mascotId,
      );

      return existing ?? { mascot_id: mascotId, employee_id: '' };
    });

    if (
      JSON.stringify(currentAssignments) !== JSON.stringify(nextAssignments)
    ) {
      setValue('assignments', nextAssignments, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [getValues, selectedMascotIds, setValue]);

  useEffect(() => {
    if (initialEvent || isPriceDirty || !selectedMascots.length) {
      return;
    }

    const proposedPrice = sumMoney(
      selectedMascots.map(mascot => mascot.price_per_hour),
    );

    if (proposedPrice > 0) {
      setValue('price_per_hour', proposedPrice, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [initialEvent, isPriceDirty, selectedMascots, setValue]);
};
