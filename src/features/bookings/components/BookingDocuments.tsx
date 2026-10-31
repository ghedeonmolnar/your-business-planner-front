import { PaginationFooter } from '@/shared/components/PaginationFooter';
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { RecordCard } from '@/shared/components/RecordCard';
import { EventDocument } from '@/features/events/types';
import { DocumentForm } from '@/features/events/components/DocumentForm';
import {
  useBookingDocuments,
  useBookingDownload,
  useDeleteBookingDocument,
  useUpdateBookingDocument,
  useUploadBookingDocument,
} from '@/features/bookings/hooks/useBookingFinance';
import { QueryState } from '@/shared/components/QueryState';
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
      <AppButton
        label="Atașează document"
        loading={editing === 'new'}
        onPress={() => setEditing('new')}
      />
      <QueryState
        loading={query.isLoading}
        hasData={items.length > 0}
        error={query.isFetchNextPageError ? undefined : query.error}
        empty={!items.length}
        retry={() => query.refetch()}
      />
      {items.map(document => (
        <RecordCard key={document.id} title={document.title}>
          <View style={styles.row}>
            <AppButton
              label="Deschide"
              loading={download.isPending}
              onPress={() => open(document.id)}
            />
            <AppButton
              label="Editează"
              loading={editing !== 'new' && editing?.id === document.id}
              variant="outline"
              onPress={() => setEditing(document)}
            />
            <AppButton
              label="Șterge"
              variant="ghost"
              loading={remove.isPending}
              onPress={() =>
                confirmAction({
                  destructive: true,
                  title: 'Ștergi documentul?',
                  message: document.title,
                  confirmLabel: 'Șterge',
                  onConfirm: () =>
                    remove
                      .mutateAsync({
                        id: document.id,
                        version: document.version,
                      })
                      .catch(onError),
                })
              }
            />
          </View>
        </RecordCard>
      ))}
      <PaginationFooter
        hasMore={Boolean(query.hasNextPage)}
        loading={query.isFetchingNextPage}
        error={query.isFetchNextPageError ? query.error : undefined}
        onLoadMore={() => query.fetchNextPage()}
        label="Mai multe documente"
      />
      {editing ? (
        <DocumentForm
          visible
          initialDocument={editing === 'new' ? null : editing}
          saving={upload.isPending || update.isPending}
          onCancel={() => setEditing(null)}
          onCreate={payload =>
            upload
              .mutateAsync(
                { eventId, payload },
                { onSuccess: () => setEditing(null) },
              )
              .then(() => undefined)
          }
          onUpdate={payload => {
            if (editing !== 'new') {
              return update
                .mutateAsync(
                  { id: editing.id, eventId, payload },
                  { onSuccess: () => setEditing(null) },
                )
                .then(() => undefined);
            }
            return Promise.resolve();
          }}
        />
      ) : null}
    </View>
  );
}
