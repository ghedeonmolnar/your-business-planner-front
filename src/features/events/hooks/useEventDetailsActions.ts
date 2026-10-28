import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { useState } from 'react';
import { Linking } from 'react-native';
import {
  useCreateEventDocument,
  useCreateEventPayment,
  useDeleteEventDocument,
  useDeleteEventPayment,
  useEventDocumentDownloadUrl,
  useUpdateEvent,
  useUpdateEventDocument,
  useUpdateEventPayment,
} from '@/features/events/hooks/useEvents';
import { EventFormValues } from '@/features/events/schemas/eventSchema';
import {
  EventDocument,
  EventDocumentMetadataPayload,
  EventPayment,
  EventPaymentPayload,
} from '@/features/events/types';
import { toEventPayload } from '@/features/events/utils/eventPayload';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export const useEventDetailsActions = (eventId: string) => {
  const updateEvent = useUpdateEvent();
  const createPayment = useCreateEventPayment();
  const updatePayment = useUpdateEventPayment();
  const deletePayment = useDeleteEventPayment();
  const createDocument = useCreateEventDocument();
  const updateDocument = useUpdateEventDocument();
  const deleteDocument = useDeleteEventDocument();
  const downloadDocument = useEventDocumentDownloadUrl();
  const [isEventFormVisible, setEventFormVisible] = useState(false);
  const [paymentFormVisible, setPaymentFormVisible] = useState(false);
  const [documentFormVisible, setDocumentFormVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<EventPayment | null>(
    null,
  );
  const [editingDocument, setEditingDocument] = useState<EventDocument | null>(
    null,
  );

  const closeEventForm = () => setEventFormVisible(false);
  const openEventForm = () => setEventFormVisible(true);

  const closePaymentForm = () => {
    setEditingPayment(null);
    setPaymentFormVisible(false);
  };

  const openCreatePayment = () => {
    setEditingPayment(null);
    setPaymentFormVisible(true);
  };

  const openEditPayment = (payment: EventPayment) => {
    setEditingPayment(payment);
    setPaymentFormVisible(true);
  };

  const closeDocumentForm = () => {
    setEditingDocument(null);
    setDocumentFormVisible(false);
  };

  const openCreateDocument = () => {
    setEditingDocument(null);
    setDocumentFormVisible(true);
  };

  const openEditDocument = (document: EventDocument) => {
    setEditingDocument(document);
    setDocumentFormVisible(true);
  };

  const saveEvent = (values: EventFormValues) => {
    updateEvent.mutate(
      { id: eventId, payload: toEventPayload(values) },
      {
        onSuccess: closeEventForm,
        onError: error => showError(error, 'Nu am putut salva evenimentul.'),
      },
    );
  };

  const savePayment = async (payload: EventPaymentPayload) => {
    try {
      if (editingPayment) {
        await updatePayment.mutateAsync({
          id: editingPayment.id,
          eventId,
          payload,
        });
      } else {
        await createPayment.mutateAsync({ eventId, payload });
      }
      closePaymentForm();
    } catch (error) {
      showError(
        error,
        editingPayment
          ? 'Nu am putut salva plata.'
          : 'Nu am putut adăuga plata.',
      );
    }
  };

  const confirmDeletePayment = (payment: EventPayment) => {
    confirmAction({
      title: 'Confirmare',
      message: 'Ștergi această înregistrare?',
      confirmLabel: 'Șterge',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();
        return deletePayment
          .mutateAsync({ id: payment.id, eventId })
          .catch(error => {
            if (actionGeneration !== getSessionGeneration()) return;
            return showError(error, 'Nu am putut șterge plata.');
          });
      },
    });
  };

  const saveDocumentCreate = (payload: FormData) => {
    return createDocument
      .mutateAsync(
        { eventId, payload },
        {
          onSuccess: closeDocumentForm,
        },
      )
      .then(() => undefined);
  };

  const saveDocumentUpdate = (payload: EventDocumentMetadataPayload) => {
    if (!editingDocument) {
      return Promise.resolve();
    }

    return updateDocument
      .mutateAsync(
        { id: editingDocument.id, eventId, payload },
        {
          onSuccess: closeDocumentForm,
        },
      )
      .then(() => undefined);
  };

  const confirmDeleteDocument = (document: EventDocument) => {
    confirmAction({
      title: 'Confirmare',
      message: `Ștergi documentul "${document.title}"?`,
      confirmLabel: 'Șterge',
      onConfirm: () => {
        const actionGeneration = getSessionGeneration();
        return deleteDocument
          .mutateAsync({ id: document.id, eventId })
          .catch(error => {
            if (actionGeneration !== getSessionGeneration()) return;
            return showError(error, 'Nu am putut șterge documentul.');
          });
      },
    });
  };

  const openDocument = (document: EventDocument) => {
    downloadDocument.mutate(document.id, {
      onSuccess: data => {
        Linking.openURL(data.download_url).catch(error => {
          showError(error, 'Nu am putut deschide documentul.');
        });
      },
      onError: error => showError(error, 'Nu am putut pregăti documentul.'),
    });
  };

  return {
    closeDocumentForm,
    closeEventForm,
    closePaymentForm,
    confirmDeleteDocument,
    confirmDeletePayment,
    documentFormVisible,
    editingDocument,
    editingPayment,
    isEventFormVisible,
    isSavingDocument: createDocument.isPending || updateDocument.isPending,
    isSavingEvent: updateEvent.isPending,
    isSavingPayment: createPayment.isPending || updatePayment.isPending,
    openCreateDocument,
    openCreatePayment,
    openDocument,
    openEditDocument,
    openEditPayment,
    openEventForm,
    paymentFormVisible,
    saveDocumentCreate,
    saveDocumentUpdate,
    saveEvent,
    savePayment,
  };
};
