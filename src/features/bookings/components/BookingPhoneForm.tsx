import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DirectoryItem } from '@/features/company/types';
import { useSaveDirectory } from '@/features/company/hooks/useCompany';
import { requiredPhoneSchema } from '@/shared/schemas/phoneSchema';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormActions } from '@/shared/components/FormActions';
import { showError } from '@/shared/feedback/showError';
import { useCustomer } from '@/features/company/hooks/useCustomers';
import { ClientConflictReview } from '@/features/company/components/ClientConflictReview';
import { QueryState } from '@/shared/components/QueryState';
import { ApiError } from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

const schema = z.object({ phone: requiredPhoneSchema });

export function BookingPhoneForm({
  client,
  onSaved,
  onClose,
}: {
  client: DirectoryItem;
  onSaved?: (client: DirectoryItem) => void;
  onClose: () => void;
}) {
  const save = useSaveDirectory();
  const current = useCustomer(client.id);
  const [version, setVersion] = useState(client.version);
  const [conflict, setConflict] = useState(false);
  const [generation] = useState(getSessionGeneration);
  const submitting = useRef(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: client.phone ?? '' },
  });
  useEffect(() => {
    if (version === undefined && current.data?.version)
      setVersion(current.data.version);
  }, [current.data?.version, version]);
  const submit = form.handleSubmit(values => {
    if (
      submitting.current ||
      conflict ||
      !version ||
      generation !== getSessionGeneration()
    )
      return;
    submitting.current = true;
    save.mutate(
      {
        kind: 'clients',
        id: client.id,
        payload: { version, phone: values.phone },
      },
      {
        onSuccess: updated => {
          if (generation !== getSessionGeneration()) return;
          onSaved?.(updated);
          onClose();
        },
        onError: error => {
          if (generation !== getSessionGeneration()) return;
          if (error instanceof ApiError && error.status === 409)
            setConflict(true);
          showError(error, 'Nu am putut salva telefonul clientului.');
        },
        onSettled: () => {
          submitting.current = false;
        },
      },
    );
  });
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      title="Completează telefonul"
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <FormActions
          busy={save.isPending}
          primary={{
            label: 'Salvează telefonul',
            onPress: submit,
            disabled: conflict || !version,
          }}
        />
      }
    >
      <QueryState
        loading={!version && current.isLoading}
        error={!version ? current.error : undefined}
        retry={() => current.refetch()}
      />
      {conflict ? (
        <ClientConflictReview
          clientId={client.id}
          onReload={updated => {
            form.reset({ phone: updated.phone ?? '' });
            setVersion(updated.version);
            setConflict(false);
          }}
        />
      ) : null}
      <ControlledTextField
        control={form.control}
        name="phone"
        label="Telefonul clientului"
        placeholder="Număr real, cu prefix internațional"
        keyboardType="phone-pad"
      />
    </FormModalFrame>
  );
}
