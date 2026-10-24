import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hall, HallPhotoDraft } from '@/features/halls/types';
import {
  hallFormSchema,
  HallFormValues,
} from '@/features/halls/schemas/hallFormSchema';
import {
  hallFormDefaults,
  hallSaveBody,
} from '@/features/halls/utils/hallFormValues';
import { useHallMutations } from '@/features/halls/hooks/useHalls';
import { useHallFormNavigation } from '@/features/halls/hooks/useHallFormNavigation';
import { HallBasicsFields } from '@/features/halls/components/HallBasicsFields';
import { HallAmenitiesFields } from '@/features/halls/components/HallAmenitiesFields';
import { HallHoursFields } from '@/features/halls/components/HallHoursFields';
import { HallPhotosField } from '@/features/halls/components/HallPhotosField';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { RootStackParamList } from '@/shared/navigation/types';
import { AppButton } from '@/shared/components/AppButton';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormPanel } from '@/shared/components/FormPanel';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';
import { ApiError } from '@/shared/api/apiError';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { showMessage } from '@/shared/feedback/showMessage';
import { createOperationId } from '@/shared/utils/createOperationId';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

const photoDrafts = (hall?: Hall): HallPhotoDraft[] =>
  hall?.images.map(photo => ({
    key: photo.id,
    imageId: photo.id,
    uri: photo.url,
  })) ?? [];

export function HallEditor({
  hall,
  duplicate,
  blocked,
  navigation,
  onBusy,
  onReload,
}: {
  hall?: Hall;
  duplicate: boolean;
  blocked: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList, 'HallForm'>;
  onBusy: (value: boolean) => void;
  onReload: () => Promise<Hall | undefined>;
}) {
  const form = useForm<HallFormValues>({
    resolver: zodResolver(hallFormSchema),
    defaultValues: hallFormDefaults(hall, duplicate),
  });
  const [version, setVersion] = useState(duplicate ? undefined : hall?.version);
  const [photos, setPhotos] = useState<HallPhotoDraft[]>(() =>
    duplicate ? [] : photoDrafts(hall),
  );
  const [photosDirty, setPhotosDirty] = useState(false);
  const [picking, setPicking] = useState(false);
  const [savedHall, setSavedHall] = useState<Hall>();
  const [conflict, setConflict] = useState(false);
  const [operationId] = useState(createOperationId);
  const [sessionGeneration] = useState(getSessionGeneration);
  const submitting = useRef(false);
  const mutations = useHallMutations();
  const busy =
    mutations.save.isPending || form.formState.isSubmitting || picking;
  const editingId = duplicate ? undefined : hall?.id;
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  useHallFormNavigation({
    navigation,
    busy,
    dirty: form.formState.isDirty || photosDirty,
    savedHallId: savedHall?.id,
    editing: Boolean(editingId),
    sessionGeneration,
  });
  const reload = () =>
    confirmAction({
      title: 'Încarci versiunea salvată?',
      message: 'Ciorna ta va fi înlocuită cu datele curente ale sălii.',
      confirmLabel: 'Încarcă versiunea',
      onConfirm: () => {
        onReload()
          .then(current => {
            if (!current || sessionGeneration !== getSessionGeneration())
              return;
            form.reset(hallFormDefaults(current));
            setVersion(current.version);
            setPhotos(photoDrafts(current));
            setPhotosDirty(false);
            setConflict(false);
          })
          .catch(error => {
            if (sessionGeneration === getSessionGeneration())
              showError(error, 'Nu am putut încărca versiunea salvată.');
          });
      },
    });
  const submit = form.handleSubmit(
    async values => {
      if (
        submitting.current ||
        busy ||
        blocked ||
        conflict ||
        sessionGeneration !== getSessionGeneration()
      )
        return;
      submitting.current = true;
      Keyboard.dismiss();
      try {
        const result = await mutations.save.mutateAsync({
          id: editingId,
          body: hallSaveBody(values, photos, operationId, version),
        });
        if (sessionGeneration === getSessionGeneration()) setSavedHall(result);
      } catch (error) {
        if (sessionGeneration !== getSessionGeneration()) return;
        if (error instanceof ApiError && error.status === 409)
          setConflict(true);
        showError(error, 'Nu am putut salva sala.');
      } finally {
        submitting.current = false;
      }
    },
    () =>
      showMessage(
        'Verifică formularul',
        'Corectează câmpurile marcate înainte de salvare.',
      ),
  );
  const currentPhotos = photos.map(photo =>
    photo.imageId
      ? {
          ...photo,
          uri:
            hall?.images.find(image => image.id === photo.imageId)?.url ??
            photo.uri,
        }
      : photo,
  );
  return (
    <>
      <FormInteractionContext.Provider value={busy || blocked}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          {duplicate ? (
            <Text style={styles.subtitle}>
              Ciornă nouă cu datele și facilitățile sălii. Galeria, notele
              interne și rezervările nu sunt copiate.
            </Text>
          ) : null}
          {conflict ? (
            <View style={styles.stack}>
              <Text style={styles.body}>
                Verifică versiunea salvată înainte de a continua. Ciorna ta este
                păstrată.
              </Text>
              {editingId ? (
                <AppButton
                  label="Încarcă versiunea salvată"
                  variant="outline"
                  onPress={reload}
                />
              ) : (
                <Text style={styles.subtitle}>
                  Verifică lista sălilor înainte de a porni o altă creare.
                </Text>
              )}
            </View>
          ) : null}
          <HallBasicsFields control={form.control} />
          <HallPhotosField
            photos={currentPhotos}
            onChange={items => {
              setPhotos(items);
              setPhotosDirty(true);
            }}
            picking={picking}
            onPicking={setPicking}
          />
          <HallAmenitiesFields form={form} />
          <HallHoursFields control={form.control} />
          <FormPanel title="Note interne">
            <ControlledTextField
              control={form.control}
              name="internal_notes"
              label="Note interne"
              placeholder="Observații pentru echipa de administrare"
              multiline
            />
            <Text style={styles.subtitle}>
              Nu se includ în mesajele trimise clientului.
            </Text>
          </FormPanel>
        </ScrollView>
      </FormInteractionContext.Provider>
      <View style={styles.footer}>
        <AppButton
          label={editingId ? 'Salvează modificările' : 'Salvează sala'}
          loadingLabel="Se salvează…"
          loading={mutations.save.isPending}
          fullWidth
          disabled={busy || blocked || conflict || Boolean(savedHall)}
          onPress={submit}
        />
      </View>
    </>
  );
}
