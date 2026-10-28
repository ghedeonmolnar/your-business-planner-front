import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { HallPhotoDraft } from '@/features/halls/types';
import {
  MAX_HALL_PHOTOS,
  MAX_HALL_PHOTO_BYTES,
} from '@/features/halls/schemas/hallFormSchema';
import { HallPhoto } from '@/features/halls/components/HallPhoto';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';
import { FormPanel } from '@/shared/components/FormPanel';
import { useFormBusy } from '@/shared/components/FormInteractionContext';
import { showMessage } from '@/shared/feedback/showMessage';
import { showError } from '@/shared/feedback/showError';
import { createOperationId } from '@/shared/utils/createOperationId';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

const PHOTO_MAX_DIMENSION = 1920;
const PHOTO_QUALITY = 0.8;
const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function HallPhotosField({
  photos,
  onChange,
  picking,
  onPicking,
}: {
  photos: HallPhotoDraft[];
  onChange: (photos: HallPhotoDraft[]) => void;
  picking: boolean;
  onPicking: (value: boolean) => void;
}) {
  const busy = useFormBusy();
  const pick = async () => {
    if (busy || picking || photos.length >= MAX_HALL_PHOTOS) return;
    onPicking(true);
    const sessionGeneration = getSessionGeneration();
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: MAX_HALL_PHOTOS - photos.length,
        maxWidth: PHOTO_MAX_DIMENSION,
        maxHeight: PHOTO_MAX_DIMENSION,
        quality: PHOTO_QUALITY,
        assetRepresentationMode: 'compatible',
      });
      if (result.didCancel || sessionGeneration !== getSessionGeneration())
        return;
      if (result.errorCode) throw new Error('HALL_PHOTO_PICKER_FAILED');
      const selected: HallPhotoDraft[] = [];
      let rejected = false;
      for (const asset of result.assets ?? []) {
        if (
          !asset.uri ||
          !asset.type ||
          !photoTypes.includes(asset.type) ||
          !asset.fileSize ||
          asset.fileSize > MAX_HALL_PHOTO_BYTES
        ) {
          rejected = true;
          continue;
        }
        const key = createOperationId();
        const extension =
          asset.type === 'image/jpeg' ? 'jpg' : asset.type.split('/')[1];
        selected.push({
          key,
          uri: asset.uri,
          file: {
            uri: asset.uri,
            name: `${key}.${extension}`,
            type: asset.type,
          },
        });
      }
      onChange([...photos, ...selected].slice(0, MAX_HALL_PHOTOS));
      if (rejected)
        showMessage(
          'Imagini neacceptate',
          'Alege fotografii JPG, PNG sau WebP de cel mult 4 MB fiecare.',
        );
    } catch (error) {
      if (sessionGeneration === getSessionGeneration())
        showError(
          error,
          'Nu am putut deschide galeria foto. Încearcă din nou.',
        );
    } finally {
      onPicking(false);
    }
  };
  return (
    <FormPanel title="Imagini">
      <Text style={styles.subtitle}>
        Până la 10 imagini, cel mult 4 MB fiecare. Prima imagine este coperta
        sălii.
      </Text>
      <AppButton
        label={picking ? 'Se deschide galeria…' : 'Adaugă imagini'}
        icon="images-outline"
        variant="outline"
        onPress={pick}
        loading={picking}
        disabled={busy || picking || photos.length >= MAX_HALL_PHOTOS}
      />
      {photos.length ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.photoStrip}
          keyboardShouldPersistTaps="handled"
        >
          {photos.map((photo, index) => (
            <View key={photo.key} style={styles.photoDraft}>
              <View style={styles.thumbnail}>
                <HallPhoto uri={photo.uri} label={`Imaginea ${index + 1}`} />
              </View>
              <AppButton
                label={index === 0 ? 'Copertă' : 'Alege copertă'}
                multiline
                variant="ghost"
                disabled={busy || picking || index === 0}
                onPress={() =>
                  onChange([
                    photo,
                    ...photos.filter(item => item.key !== photo.key),
                  ])
                }
              />
              <IconButton
                icon="close-circle-outline"
                accessibilityLabel={`Elimină imaginea ${index + 1}`}
                disabled={busy || picking}
                onPress={() =>
                  onChange(photos.filter(item => item.key !== photo.key))
                }
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.subtitle}>Nu ai adăugat imagini.</Text>
      )}
    </FormPanel>
  );
}
