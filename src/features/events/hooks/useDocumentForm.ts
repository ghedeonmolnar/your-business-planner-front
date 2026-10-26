import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DocumentPickerResponse,
  errorCodes,
  isErrorWithCode,
  pick,
} from '@react-native-documents/picker';
import {
  EventDocument,
  EventDocumentMetadataPayload,
} from '@/features/events/types';
import {
  DocumentFormInput,
  DocumentFormValues,
  documentSchema,
  emptyDocumentForm,
} from '@/features/events/schemas/documentSchema';
import { useReloadEventDocument } from '@/features/events/hooks/useEventDocuments';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { apiErrorCode } from '@/shared/api/apiError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { assertCurrentRequestSession } from '@/shared/api/requestSession';

const acceptedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
];
const formValues = (document?: EventDocument | null): DocumentFormInput => ({
  document_type: document?.document_type ?? 'contract',
  title: document?.title ?? '',
  document_date: document?.document_date ?? '',
  notes: document?.notes ?? '',
});

export type DocumentFormProps = {
  visible: boolean;
  initialDocument?: EventDocument | null;
  saving: boolean;
  onCancel: () => void;
  onCreate: (payload: FormData) => Promise<void>;
  onUpdate: (payload: EventDocumentMetadataPayload) => Promise<void>;
};

export const useDocumentForm = ({
  visible,
  initialDocument,
  saving,
  onCreate,
  onUpdate,
}: DocumentFormProps) => {
  const [file, setFile] = useState<DocumentPickerResponse | null>(null);
  const [conflict, setConflict] = useState(false);
  const [generation] = useState(getSessionGeneration);
  const version = useRef(initialDocument?.version);
  const submitting = useRef(false);
  const initial = useRef(initialDocument);
  initial.current = initialDocument;
  const reload = useReloadEventDocument();
  const form = useForm<DocumentFormInput, unknown, DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: emptyDocumentForm,
  });
  const { reset } = form;
  const documentId = initialDocument?.id;
  useEffect(() => {
    if (!visible) return;
    reset(formValues(initial.current));
    version.current = initial.current?.version;
    setFile(null);
    setConflict(false);
  }, [documentId, reset, visible]);
  const pickFile = async () => {
    try {
      const [selected] = await pick({
        allowMultiSelection: false,
        mode: 'import',
        type: acceptedTypes,
      });
      assertCurrentRequestSession(generation);
      if (!selected.hasRequestedType) {
        showMessage('Fișier invalid', 'Alege PDF, Word, imagine sau text.');
        return;
      }
      setFile(selected);
      if (!form.getValues('title').trim() && selected.name)
        form.setValue('title', selected.name, { shouldValidate: true });
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      )
        return;
      showError(error, 'Nu am putut alege fișierul.');
    }
  };
  const submit = async (values: DocumentFormValues) => {
    if (
      generation !== getSessionGeneration() ||
      conflict ||
      saving ||
      submitting.current
    )
      return;
    submitting.current = true;
    try {
      if (initialDocument && version.current) {
        await onUpdate({
          version: version.current,
          ...values,
          document_date: values.document_date || null,
          notes: values.notes || null,
        });
        return;
      }
      if (!file) {
        showMessage('Fișier lipsă', 'Alege un fișier pentru încărcare.');
        return;
      }
      const data = new FormData();
      data.append('file', {
        uri: file.uri,
        name: file.name ?? `document-${Date.now()}`,
        type: file.type ?? 'application/octet-stream',
      } as unknown as Blob);
      data.append('document_type', values.document_type);
      data.append('title', values.title);
      if (values.document_date)
        data.append('document_date', values.document_date);
      if (values.notes) data.append('notes', values.notes);
      await onCreate(data);
    } catch (error) {
      if (generation !== getSessionGeneration()) return;
      if (apiErrorCode(error) === 'RESOURCE_VERSION_CONFLICT')
        setConflict(true);
      showError(error, 'Nu am putut salva documentul.');
    } finally {
      submitting.current = false;
    }
  };
  const reloadCurrent = async () => {
    if (!documentId) return;
    const current = await reload.mutateAsync(documentId);
    assertCurrentRequestSession(generation);
    if (documentId !== initial.current?.id) return;
    reset(formValues(current));
    version.current = current.version;
    setConflict(false);
  };
  return {
    form,
    file,
    pickFile,
    submit,
    conflict,
    reloadCurrent,
    reloading: reload.isPending,
  };
};
