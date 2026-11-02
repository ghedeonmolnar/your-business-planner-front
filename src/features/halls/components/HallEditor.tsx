import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { HallWizard } from '@/features/halls/components/HallWizard';
import { Hall, HallPhotoDraft } from '@/features/halls/types';
import {
  hallFormSchema,
  HallFormValues,
} from '@/features/halls/schemas/hallFormSchema';
import {
  hallFormDefaults,
  hallSaveBody,
} from '@/features/halls/utils/hallFormValues';
import { useHallSubmission } from '@/features/halls/hooks/useHallSubmission';
import { getHallCreationAttempt } from '@/features/halls/utils/hallCreationRecovery';
import { useAuth } from '@/features/auth/AuthProvider';
import { useHallFormNavigation } from '@/features/halls/hooks/useHallFormNavigation';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { RootStackParamList } from '@/shared/navigation/types';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
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
  title,
  duplicate,
  blocked,
  navigation,
  onBusy,
  onReload,
}: {
  hall?: Hall;
  title: string;
  duplicate: boolean;
  blocked: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList, 'HallForm'>;
  onBusy: (value: boolean) => void;
  onReload: () => Promise<Hall | undefined>;
}) {
  const { user } = useAuth();
  const editingId = duplicate ? undefined : hall?.id;
  const recoveryKey = JSON.stringify([
    user?.company?.id,
    duplicate ? hall?.id : 'new',
  ]);
  const [initialAttempt] = useState(() =>
    editingId ? undefined : getHallCreationAttempt(recoveryKey),
  );
  const form = useAppForm<HallFormValues>({
    resolver: zodResolver(hallFormSchema),
    defaultValues: {
      ...hallFormDefaults(hall, duplicate),
      ...initialAttempt?.values,
    },
  });
  const [version, setVersion] = useState(duplicate ? undefined : hall?.version);
  const [photos, setPhotos] = useState<HallPhotoDraft[]>(
    () => initialAttempt?.photos ?? (duplicate ? [] : photoDrafts(hall)),
  );
  const [photosDirty, setPhotosDirty] = useState(false);
  const [ruleDraftDirty, setRuleDraftDirty] = useState(false);
  const [reloadGeneration, setReloadGeneration] = useState(0);
  const [picking, setPicking] = useState(false);
  const [operationId] = useState(
    () => initialAttempt?.operationId ?? createOperationId(),
  );
  const [sessionGeneration] = useState(getSessionGeneration);
  const submission = useHallSubmission({
    form,
    initialAttempt,
    recoveryKey,
    editingId,
    sessionGeneration,
    blocked,
    busy: picking,
    buildAttempt: values => ({
      values,
      photos,
      operationId,
      body: hallSaveBody(values, photos, operationId, version),
    }),
  });
  const { submit, uncertain, conflict, setConflict, savedHall } = submission;
  const busy = submission.saving || form.formState.isSubmitting || picking;
  useEffect(() => {
    onBusy(busy);
    return () => onBusy(false);
  }, [busy, onBusy]);
  useHallFormNavigation({
    navigation,
    busy,
    dirty: form.formState.isDirty || photosDirty || ruleDraftDirty,
    savedHallId: savedHall?.id,
    editing: Boolean(editingId),
    sessionGeneration,
  });
  const reload = () =>
    confirmAction({
      destructive: true,
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
            setRuleDraftDirty(false);
            setReloadGeneration(currentGeneration => currentGeneration + 1);
            setConflict(false);
          })
          .catch(error => {
            if (sessionGeneration === getSessionGeneration())
              showError(error, 'Nu am putut încărca versiunea salvată.');
          });
      },
    });
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
    <HallWizard
      key={reloadGeneration}
      form={form}
      title={title}
      editing={Boolean(editingId)}
      busy={busy}
      disabled={blocked || conflict || Boolean(savedHall)}
      uncertain={uncertain}
      saving={submission.saving}
      photos={currentPhotos}
      onPhotosChange={items => {
        setPhotos(items);
        setPhotosDirty(true);
      }}
      picking={picking}
      onPicking={setPicking}
      onSubmit={submit}
      ruleDraftDirty={ruleDraftDirty}
      onRuleDraftChange={setRuleDraftDirty}
      onBack={() => navigation.goBack()}
    >
      {duplicate ? (
        <Text style={styles.subtitle}>
          Ciornă nouă cu datele și facilitățile sălii. Galeria, notele interne
          și rezervările nu sunt copiate.
        </Text>
      ) : null}
      {uncertain && !conflict ? (
        <Text style={styles.body}>
          Rezultatul creării nu este încă sigur. Reîncearcă salvarea pentru a
          recupera sala folosind aceleași date și fotografii.
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
    </HallWizard>
  );
}
