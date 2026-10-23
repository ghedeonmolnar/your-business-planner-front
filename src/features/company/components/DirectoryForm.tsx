import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DirectoryItem,
  DirectoryKind,
  DirectoryPayload,
} from '@/features/company/types';
import {
  directorySchema,
  DirectoryFormValues,
} from '@/features/company/schemas/directorySchema';
import { useSaveDirectory } from '@/features/company/hooks/useCompany';
import { staffRoleOptions } from '@/features/bookings/utils/bookingLabels';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';

export function DirectoryForm({
  kind,
  item,
  onClose,
}: {
  kind: DirectoryKind;
  item?: DirectoryItem;
  onClose: () => void;
}) {
  const save = useSaveDirectory();
  const submitting = useRef(false);
  const form = useForm<DirectoryFormValues>({
    resolver: zodResolver(directorySchema),
    defaultValues: {
      kind,
      name: item?.name ?? '',
      phone: item?.phone ?? '',
      notes: item?.notes ?? '',
      job_role: item?.job_role ?? 'other',
      hourly_rate: String(item?.hourly_rate ?? 0),
      capacity: String(item?.capacity ?? ''),
      address: item?.address ?? '',
      active: item?.is_active === false ? 'no' : 'yes',
    },
  });
  const submit = form.handleSubmit(values => {
    if (submitting.current) {
      return;
    }
    submitting.current = true;
    const payload: DirectoryPayload = { name: values.name };
    if (kind === 'clients') {
      payload.phone = values.phone || null;
      payload.notes = values.notes || null;
    }
    if (kind === 'halls') {
      payload.capacity = Number(values.capacity);
      payload.address = values.address || null;
    }
    if (kind === 'employees') {
      payload.job_role = values.job_role;
      payload.hourly_rate = values.hourly_rate.replace(',', '.');
    }
    if (kind !== 'clients') {
      payload.is_active = values.active === 'yes';
    }
    save.mutate(
      { kind, id: item?.id, payload },
      {
        onSuccess: onClose,
        onSettled: () => {
          submitting.current = false;
        },
        onError: error => showError(error, 'Nu am putut salva înregistrarea.'),
      },
    );
  });
  return (
    <FormModalFrame
      visible
      busy={save.isPending}
      title={
        kind === 'clients'
          ? item
            ? 'Editează clientul'
            : 'Client nou'
          : kind === 'halls'
            ? item
              ? 'Editează sala'
              : 'Sală nouă'
            : item
              ? 'Editează persoana'
              : 'Persoană nouă'
      }
      onClose={onClose}
      hasUnsavedChanges={form.formState.isDirty}
      footer={
        <AppButton
          label="Salvează"
          disabled={save.isPending}
          onPress={submit}
        />
      }
    >
      <ControlledTextField
        control={form.control}
        name="name"
        label="Nume"
        placeholder="Nume"
      />
      {kind === 'clients' ? (
        <>
          <ControlledTextField
            control={form.control}
            name="phone"
            label="Telefon"
            placeholder="07…"
            keyboardType="phone-pad"
          />
          <ControlledTextField
            control={form.control}
            name="notes"
            label="Discuții și observații"
            placeholder="Detalii discutate"
            multiline
          />
        </>
      ) : null}
      {kind === 'halls' ? (
        <>
          <ControlledTextField
            control={form.control}
            name="capacity"
            label="Capacitate persoane"
            placeholder="200"
            keyboardType="number-pad"
          />
          <ControlledTextField
            control={form.control}
            name="address"
            label="Adresă"
            placeholder="Adresa sălii"
          />
        </>
      ) : null}
      {kind === 'employees' ? (
        <>
          <ControlledSelectField
            control={form.control}
            name="job_role"
            label="Rol operațional"
            single
            options={staffRoleOptions}
            placeholder="Alege rolul"
            searchPlaceholder="Caută rol"
          />
          <ControlledTextField
            control={form.control}
            name="hourly_rate"
            label="Tarif orar implicit (lei)"
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
        </>
      ) : null}
      {kind !== 'clients' ? (
        <ControlledSelectField
          control={form.control}
          name="active"
          label="Stare"
          single
          options={[
            { id: 'yes', name: 'Activă' },
            { id: 'no', name: 'Arhivată / inactivă' },
          ]}
          placeholder="Alege starea"
          searchPlaceholder="Caută stare"
        />
      ) : null}
    </FormModalFrame>
  );
}
