import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSourceSelect } from '@/features/clients/components/ClientSourceSelect';
import { LocalitySelectField } from '@/features/catalogs/components/LocalitySelectField';
import {
  ClientFormValues,
  clientSchema,
  emptyClientForm,
} from '@/features/clients/schemas/clientSchema';
import { Client } from '@/features/clients/types';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';

type ClientFormProps = {
  visible: boolean;
  initialClient?: Client | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: ClientFormValues) => void;
};

const toFormValues = (client?: Client | null): ClientFormValues => {
  if (!client) {
    return emptyClientForm;
  }

  return {
    name: client.name ?? '',
    phone: client.phone ?? '',
    oras: client.oras ?? '',
    strada: client.strada ?? '',
    source: client.source ?? '',
    notes: client.notes ?? '',
    last_contract_date: client.last_contract_date ?? null,
  };
};

export function ClientForm({
  visible,
  initialClient,
  saving,
  onCancel,
  onSubmit,
}: ClientFormProps) {
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: emptyClientForm,
  });

  useEffect(() => {
    if (visible) {
      reset(toFormValues(initialClient));
    }
  }, [initialClient, reset, visible]);

  return (
    <FormModalFrame
      footer={
        <AppButton
          disabled={saving}
          fullWidth
          label={saving ? 'Se salvează...' : 'Salvează'}
          onPress={handleSubmit(onSubmit)}
          size="large"
        />
      }
      hasUnsavedChanges={isDirty}
      onClose={onCancel}
      title={initialClient ? 'Editează client' : 'Client nou'}
      visible={visible}
    >
      <ControlledTextField
        control={control}
        label="Nume"
        name="name"
        placeholder="Numele clientului"
      />
      <ControlledTextField
        control={control}
        keyboardType="phone-pad"
        label="Telefon"
        name="phone"
        placeholder="Număr de telefon"
      />
      <LocalitySelectField control={control} label="Oraș" name="oras" />
      <ControlledTextField
        control={control}
        label="Adresă"
        name="strada"
        placeholder="Strada și număr"
      />
      <ClientSourceSelect control={control} />
      <ControlledTextField
        control={control}
        label="Notițe"
        multiline
        name="notes"
        placeholder="Detalii utile"
      />
    </FormModalFrame>
  );
}
