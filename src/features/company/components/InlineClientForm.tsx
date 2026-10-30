import { FormPanel } from '@/shared/components/FormPanel';
import React, { useRef, useState } from 'react';
import { Text } from 'react-native-paper';

import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  newClientSchema,
  NewClientValues,
} from '@/features/company/schemas/directorySchema';
import { useClientCreation } from '@/features/company/hooks/useClientCreation';
import { ClientCreationPayload, DirectoryItem } from '@/features/company/types';
import { createOperationId } from '@/shared/utils/createOperationId';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { ApiError } from '@/shared/api/apiError';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormActions } from '@/shared/components/FormActions';
import { showError } from '@/shared/feedback/showError';

export function InlineClientForm({
  onCreated,
  onCancel,
}: {
  onCreated: (client: DirectoryItem) => void;
  onCancel: () => void;
}) {
  const save = useClientCreation();
  const recovered = save.uncertainCreation;
  const submitted = useRef<ClientCreationPayload | null>(recovered ?? null);
  const submitting = useRef(false);
  const [operationId] = useState(
    () => recovered?.operation_id ?? createOperationId(),
  );
  const [generation] = useState(getSessionGeneration);
  const [conflict, setConflict] = useState(false);
  const form = useAppForm<NewClientValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: recovered?.name ?? '',
      phone: recovered?.phone ?? '',
    },
  });
  const submit = form.handleSubmit(values => {
    if (submitting.current || conflict || generation !== getSessionGeneration())
      return;
    submitting.current = true;
    submitted.current ??= {
      name: values.name,
      phone: values.phone || null,
      operation_id: operationId,
    };
    save.mutate(submitted.current, {
      onSuccess: client => {
        if (generation === getSessionGeneration()) onCreated(client);
      },
      onSettled: () => {
        submitting.current = false;
      },
      onError: error => {
        if (generation !== getSessionGeneration()) return;
        if (error instanceof ApiError && error.status === 409)
          setConflict(true);
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 409
        )
          submitted.current = null;
        showError(error, 'Nu am putut crea clientul.');
      },
    });
  });
  const uncertain = Boolean(submitted.current || recovered);
  return (
    <FormPanel busy={save.isPending}>
      {uncertain ? (
        <Text>
          Reîncearcă salvarea inițială înainte de a schimba datele clientului.
        </Text>
      ) : null}
      <ControlledTextField
        control={form.control}
        name="name"
        required
        label="Numele clientului nou"
        placeholder="Nume complet"
        disabled={uncertain}
      />
      <ControlledTextField
        control={form.control}
        name="phone"
        required
        label="Telefonul clientului nou"
        placeholder="07…"
        keyboardType="phone-pad"
        disabled={uncertain}
      />
      <FormActions
        busy={save.isPending}
        primary={{
          label: 'Salvează clientul',
          onPress: submit,
          disabled: conflict,
        }}
        secondary={{
          label: 'Renunță la clientul nou',
          variant: 'danger',
          onPress: onCancel,
        }}
      />
    </FormPanel>
  );
}
