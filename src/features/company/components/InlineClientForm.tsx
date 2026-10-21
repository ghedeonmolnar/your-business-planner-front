import { Card } from '@/shared/components/Card';
import React from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  newClientSchema,
  NewClientValues,
} from '@/features/company/schemas/directorySchema';
import { useSaveDirectory } from '@/features/company/hooks/useCompany';
import { DirectoryItem } from '@/features/company/types';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { AppButton } from '@/shared/components/AppButton';
import { showError } from '@/shared/feedback/showError';

export function InlineClientForm({
  onCreated,
  onCancel,
}: {
  onCreated: (client: DirectoryItem) => void;
  onCancel: () => void;
}) {
  const save = useSaveDirectory();
  const form = useForm<NewClientValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: { name: '', phone: '' },
  });
  const submit = form.handleSubmit(values =>
    save.mutate(
      {
        kind: 'clients',
        payload: { name: values.name, phone: values.phone || null },
      },
      {
        onSuccess: onCreated,
        onError: error => showError(error, 'Nu am putut crea clientul.'),
      },
    ),
  );
  return (
    <Card style={styles.card}>
      <ControlledTextField
        control={form.control}
        name="name"
        label="Numele clientului nou"
        placeholder="Nume complet"
      />
      <ControlledTextField
        control={form.control}
        name="phone"
        label="Telefonul clientului nou"
        placeholder="07…"
        keyboardType="phone-pad"
      />
      <AppButton
        label="Salvează clientul"
        disabled={save.isPending}
        onPress={submit}
      />
      <AppButton
        label="Renunță la clientul nou"
        variant="ghost"
        disabled={save.isPending}
        onPress={onCancel}
      />
    </Card>
  );
}
