import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  directorySchema,
  DirectoryFormValues,
} from '@/features/company/schemas/directorySchema';
import {
  ClientCreationPayload,
  DirectoryItem,
  DirectoryKind,
  DirectoryPayload,
} from '@/features/company/types';
import { useSaveDirectory } from '@/features/company/hooks/useCompany';
import { useClientCreation } from '@/features/company/hooks/useClientCreation';
import { directoryFormValues } from '@/features/company/utils/directoryFormValues';
import { createOperationId } from '@/shared/utils/createOperationId';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { ApiError } from '@/shared/api/apiError';
import { showError } from '@/shared/feedback/showError';

export function useDirectoryForm(
  kind: DirectoryKind,
  item: DirectoryItem | undefined,
  onClose: () => void,
) {
  const save = useSaveDirectory();
  const create = useClientCreation();
  const creatingClient = kind === 'clients' && !item;
  const recovered = creatingClient ? create.uncertainCreation : undefined;
  const [operationId] = useState(
    () => recovered?.operation_id ?? createOperationId(),
  );
  const [generation] = useState(getSessionGeneration);
  const [version, setVersion] = useState(item?.version);
  const [conflict, setConflict] = useState(false);
  const submitted = useRef<ClientCreationPayload | null>(recovered ?? null);
  const submitting = useRef(false);
  const form = useForm<DirectoryFormValues>({
    resolver: zodResolver(directorySchema),
    defaultValues: directoryFormValues(kind, item ?? recovered),
  });
  const busy = save.isPending || create.isPending;
  const submit = form.handleSubmit(values => {
    if (submitting.current || conflict || generation !== getSessionGeneration())
      return;
    submitting.current = true;
    const payload: DirectoryPayload = { name: values.name };
    if (kind === 'clients') {
      payload.phone = values.phone || null;
      payload.notes = values.notes || null;
      payload.version = item ? version : undefined;
    }
    if (kind === 'halls') {
      payload.capacity = Number(values.capacity);
      payload.address = values.address || null;
      payload.version = item?.version;
    }
    if (kind === 'employees') {
      payload.job_role = values.job_role;
      payload.hourly_rate = values.hourly_rate.replace(',', '.');
    }
    if (kind !== 'clients') payload.is_active = values.active === 'yes';
    const callbacks = {
      onSuccess: () => {
        if (generation === getSessionGeneration()) onClose();
      },
      onSettled: () => {
        submitting.current = false;
      },
      onError: (error: unknown) => {
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
        showError(error, 'Nu am putut salva înregistrarea.');
      },
    };
    if (creatingClient) {
      submitted.current ??= {
        ...payload,
        name: values.name,
        operation_id: operationId,
      };
      create.mutate(submitted.current, callbacks);
    } else save.mutate({ kind, id: item?.id, payload }, callbacks);
  });
  const reload = (current: DirectoryItem) => {
    form.reset(directoryFormValues(kind, current));
    setVersion(current.version);
    setConflict(false);
  };
  return {
    form,
    submit,
    busy,
    conflict,
    reload,
    readOnly: creatingClient && Boolean(submitted.current || recovered),
  };
}
