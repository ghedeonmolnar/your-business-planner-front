import React from 'react';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { eventDetailsStyles } from '@/features/events/components/eventDetailsStyles';
import { EventDocument } from '@/features/events/types';
import { AppButton } from '@/shared/components/AppButton';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { IconButton } from '@/shared/components/IconButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { isUnauthorizedError } from '@/shared/api/client';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { formatLongDate } from '@/shared/utils/formatDate';

const documentTypeLabel = {
  contract: 'Contract',
  invoice: 'Factură',
  other: 'Altul',
};

type EventDocumentsSectionProps = {
  documents: EventDocument[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onAdd: () => void;
  onOpen: (document: EventDocument) => void;
  onEdit: (document: EventDocument) => void;
  onDelete: (document: EventDocument) => void;
};

export function EventDocumentsSection({
  documents,
  loading,
  error,
  onRetry,
  onAdd,
  onOpen,
  onEdit,
  onDelete,
}: EventDocumentsSectionProps) {
  return (
    <>
      <AppButton
        fullWidth
        label="Adaugă document"
        onPress={onAdd}
        size="large"
      />
      {loading ? <LoadingState /> : null}
      {error && !isUnauthorizedError(error) ? (
        <ErrorBanner
          message={getErrorMessage(error, 'Nu am putut încărca documentele.')}
          onRetry={onRetry}
        />
      ) : null}
      {documents.map(document => (
        <Card key={document.id} style={eventDetailsStyles.row}>
          <View style={eventDetailsStyles.rowMain}>
            <Text style={eventDetailsStyles.rowTitle}>{document.title}</Text>
            <Text style={eventDetailsStyles.rowMeta}>
              {documentTypeLabel[document.document_type]} /{' '}
              {formatLongDate(document.document_date) || 'Fără dată'}
            </Text>
          </View>
          <IconButton
            accessibilityLabel="Deschide document"
            icon="open-outline"
            onPress={() => onOpen(document)}
          />
          <EditIconButton
            accessibilityLabel="Editează document"
            onPress={() => onEdit(document)}
            style={eventDetailsStyles.rowAction}
          />
          <IconButton
            accessibilityLabel="Șterge document"
            backgroundColor={theme.colors.redSoft}
            color={theme.colors.danger}
            icon="trash-outline"
            onPress={() => onDelete(document)}
            style={eventDetailsStyles.rowAction}
          />
        </Card>
      ))}
      {!loading && !documents.length ? (
        <Text style={eventDetailsStyles.emptyText}>
          Nu există documente pentru eveniment.
        </Text>
      ) : null}
    </>
  );
}
