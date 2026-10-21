import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { EventDocument } from '@/features/events/types';
import { DocumentForm } from '@/features/events/components/DocumentForm';
import {
  useBookingDocuments,
  useBookingDownload,
  useDeleteBookingDocument,
  useUpdateBookingDocument,
  useUploadBookingDocument,
} from '@/features/bookings/hooks/useBookingFinance';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export function BookingDocuments({ eventId }: { eventId: string }) {
  const query = useBookingDocuments(eventId);
  const upload = useUploadBookingDocument();
  const update = useUpdateBookingDocument();
  const remove = useDeleteBookingDocument(eventId);
  const download = useBookingDownload();
  const [editing, setEditing] = useState<EventDocument | 'new' | null>(null);
  const onError = (error: unknown) =>
    showError(error, 'Nu am putut procesa documentul.');
  const open = async (id: string) => {
    try {
      const result = await download.mutateAsync(id);
      await Linking.openURL(result.download_url);
    } catch (error) {
      onError(error);
    }
  };
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  return (
    <View style={styles.content}>
      <Text style={styles.subtitle}>Documente</Text>
      <AppButton label="Atașează document" onPress={() => setEditing('new')} />
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(document => (
        <Card key={document.id} style={styles.card}>
          <Text style={styles.text}>{document.title}</Text>
          <View style={styles.row}>
            <AppButton
              label="Deschide"
              disabled={download.isPending}
              onPress={() => open(document.id)}
            />
            <AppButton
              label="Editează"
              variant="outline"
              onPress={() => setEditing(document)}
            />
            <AppButton
              label="Șterge"
              variant="ghost"
              disabled={remove.isPending}
              onPress={() =>
                confirmAction({
                  title: 'Ștergi documentul?',
                  message: document.title,
                  confirmLabel: 'Șterge',
                  onConfirm: () => remove.mutate(document.id, { onError }),
                })
              }
            />
          </View>
        </Card>
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe documente"
          disabled={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
      {editing ? (
        <DocumentForm
          visible
          initialDocument={editing === 'new' ? null : editing}
          saving={upload.isPending || update.isPending}
          onCancel={() => setEditing(null)}
          onCreate={payload =>
            upload.mutate(
              { eventId, payload },
              { onSuccess: () => setEditing(null), onError },
            )
          }
          onUpdate={payload => {
            if (editing !== 'new') {
              update.mutate(
                { id: editing.id, payload },
                { onSuccess: () => setEditing(null), onError },
              );
            }
          }}
        />
      ) : null}
    </View>
  );
}
