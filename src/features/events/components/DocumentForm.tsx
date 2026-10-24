import React from 'react';
import { StyleSheet } from 'react-native';
import { useWatch } from 'react-hook-form';
import { EventDocumentType } from '@/features/events/types';
import {
  useDocumentForm,
  DocumentFormProps,
} from '@/features/events/hooks/useDocumentForm';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { VersionConflictNotice } from '@/shared/components/VersionConflictNotice';
import { theme } from '@/shared/theme/theme';

const documentTypes: Array<{ value: EventDocumentType; label: string }> = [
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Factură' },
  { value: 'other', label: 'Altul' },
];

export function DocumentForm(props: DocumentFormProps) {
  const { visible, initialDocument, saving, onCancel } = props;
  const state = useDocumentForm(props);
  const { form, file, pickFile, submit } = state;
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    setValue,
  } = form;
  const documentType = useWatch({ control, name: 'document_type' });
  return (
    <FormModalFrame
      footer={
        <FormActions
          busy={saving}
          primary={{
            label: 'Salvează',
            loadingLabel: 'Se salvează…',
            onPress: handleSubmit(submit),
            disabled: state.conflict || state.reloading,
          }}
        />
      }
      busy={saving}
      hasUnsavedChanges={isDirty || file !== null}
      onClose={onCancel}
      title={initialDocument ? 'Editează document' : 'Document nou'}
      visible={visible}
    >
      {state.conflict ? (
        <VersionConflictNotice onReload={state.reloadCurrent} />
      ) : null}
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
