import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
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
  EventDocumentType,
} from '@/features/events/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { theme } from '@/shared/theme/theme';
import {
  DocumentFormInput,
  DocumentFormValues,
  documentSchema,
  emptyDocumentForm,
} from '@/features/events/schemas/documentSchema';

type DocumentFormProps = {
  visible: boolean;
  initialDocument?: EventDocument | null;
  saving: boolean;
  onCancel: () => void;
  onCreate: (payload: FormData) => void;
  onUpdate: (payload: EventDocumentMetadataPayload) => void;
};

type ReactNativeDocumentFile = {
  uri: string;
  name: string;
  type: string;
};

const documentTypes: Array<{ value: EventDocumentType; label: string }> = [
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Factură' },
  { value: 'other', label: 'Altul' },
];

const acceptedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'text/plain',
];

export function DocumentForm({
  visible,
  initialDocument,
  saving,
  onCancel,
  onCreate,
  onUpdate,
}: DocumentFormProps) {
  const [file, setFile] = useState<DocumentPickerResponse | null>(null);
  const {
    control,
    formState: { isDirty },
    getValues,
    handleSubmit,
    reset,
    setValue,
  } = useForm<
    DocumentFormInput,
    unknown,
    DocumentFormValues
  >({
    resolver: zodResolver(documentSchema),
    defaultValues: emptyDocumentForm,
  });
  const documentType = useWatch({ control, name: 'document_type' });

  useEffect(() => {
    if (!visible) {
      return;
    }

    reset({
      document_type: initialDocument?.document_type ?? 'contract',
      title: initialDocument?.title ?? '',
      document_date: initialDocument?.document_date ?? '',
      notes: initialDocument?.notes ?? '',
    });
    setFile(null);
  }, [initialDocument, reset, visible]);

  const pickFile = async () => {
    try {
      const [selectedFile] = await pick({
        allowMultiSelection: false,
        mode: 'import',
        type: acceptedTypes,
      });

      if (!selectedFile.hasRequestedType) {
        showMessage('Fișier invalid', 'Alege PDF, Word, imagine sau text.');
        return;
      }

      setFile(selectedFile);
      if (!getValues('title').trim() && selectedFile.name) {
        setValue('title', selectedFile.name, { shouldValidate: true });
      }
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }

      showError(error, 'Nu am putut alege fișierul.');
    }
  };

  const submit = (values: DocumentFormValues) => {
    const metadata: EventDocumentMetadataPayload = {
      document_type: values.document_type,
      title: values.title,
      document_date: values.document_date || null,
      notes: values.notes || null,
    };

    if (initialDocument) {
      onUpdate(metadata);
      return;
    }

    if (!file) {
      showMessage('Fișier lipsă', 'Alege un fișier pentru încărcare.');
      return;
    }

    const formData = new FormData();
    const uploadFile: ReactNativeDocumentFile = {
      uri: file.uri,
      name: file.name ?? `document-${Date.now()}`,
      type: file.type ?? 'application/octet-stream',
    };

    formData.append('file', uploadFile as unknown as Blob);
    formData.append('document_type', metadata.document_type);
    formData.append('title', metadata.title);

    if (metadata.document_date) {
      formData.append('document_date', metadata.document_date);
    }

    if (metadata.notes) {
      formData.append('notes', metadata.notes);
    }

    onCreate(formData);
  };

  return (
    <FormModalFrame
      footer={
        <AppButton
          disabled={saving}
          fullWidth
          label={saving ? 'Se salvează...' : 'Salvează'}
          onPress={handleSubmit(submit)}
          size="large"
        />
      }
      hasUnsavedChanges={isDirty || file !== null}
      onClose={onCancel}
      title={initialDocument ? 'Editează document' : 'Document nou'}
      visible={visible}
    >
      <AppSegmentedControl
        containerStyle={styles.typeRow}
        onChangeIndex={index =>
          setValue('document_type', documentTypes[index].value, {
            shouldDirty: true,
          })
        }
        selectedIndex={documentTypes.findIndex(
          option => option.value === documentType,
        )}
        segments={documentTypes.map(option => ({ label: option.label }))}
      />

      {!initialDocument ? (
        <AppButton
          fullWidth
          icon="document-attach-outline"
          label={file?.name ?? 'Alege fișier'}
          onPress={pickFile}
          shape="rounded"
          style={styles.fileButton}
          variant="soft"
        />
      ) : null}

      <ControlledTextField
        control={control}
        label="Titlu"
        name="title"
        placeholder="Titlul documentului"
      />
      <ControlledDateField
        control={control}
        label="Data"
        name="document_date"
        placeholder="Alege data"
      />
      <ControlledTextField
        control={control}
        label="Note"
        multiline
        name="notes"
        placeholder="Observații"
      />
    </FormModalFrame>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    marginBottom: theme.spacing.md,
  },
  fileButton: {
    marginBottom: theme.spacing.md,
  },
});
