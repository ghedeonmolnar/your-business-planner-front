import React, { useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  emptyMascotForm,
  MascotFormInput,
  MascotFormValues,
  mascotSchema,
} from '@/features/mascots/schemas/mascotSchema';
import { Mascot } from '@/features/mascots/types';
import { ControlledSwitchField } from '@/shared/components/ControlledSwitchField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { AppButton } from '@/shared/components/AppButton';
import { showMessage } from '@/shared/feedback/showMessage';
import { theme } from '@/shared/theme/theme';
import { useButtonAction } from '@/shared/hooks/useButtonAction';

type MascotFormProps = {
  visible: boolean;
  initialMascot?: Mascot | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: MascotFormValues) => void;
};

const toFormValues = (mascot?: Mascot | null): MascotFormInput => {
  if (!mascot) {
    return emptyMascotForm;
  }

  return {
    name: mascot.name,
    price_per_hour: Number(mascot.price_per_hour) || 0,
    image: null,
    is_active: mascot.is_active,
  };
};

export function MascotForm({
  visible,
  initialMascot,
  saving,
  onCancel,
  onSubmit,
}: MascotFormProps) {
  const {
    control,
    formState: { isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<MascotFormInput, unknown, MascotFormValues>({
    resolver: zodResolver(mascotSchema),
    defaultValues: emptyMascotForm,
  });
  const selectedImage = useWatch({ control, name: 'image' });
  const previewUri = selectedImage?.uri ?? initialMascot?.image_url ?? null;

  useEffect(() => {
    if (visible) {
      reset(toFormValues(initialMascot));
    }
  }, [initialMascot, reset, visible]);

  const pickImage = async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      showMessage(
        'Eroare',
        response.errorMessage ?? 'Nu am putut deschide galeria.',
      );
      return;
    }

    const asset = response.assets?.[0];

    if (!asset?.uri) {
      return;
    }

    setValue(
      'image',
      {
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
      },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const imageAction = useButtonAction(pickImage, saving);

  return (
    <FormModalFrame
      footer={
        <AppButton
          disabled={saving}
          loading={saving}
          fullWidth
          label={saving ? 'Se salvează...' : 'Salvează'}
          onPress={handleSubmit(onSubmit)}
          size="large"
        />
      }
      hasUnsavedChanges={isDirty}
      onClose={onCancel}
      title={initialMascot ? 'Editează mascota' : 'Mascotă nouă'}
      visible={visible}
      busy={saving}
    >
      <TouchableOpacity
        accessibilityLabel="Alege poza mascotei"
        accessibilityRole="button"
        activeOpacity={0.75}
        accessibilityState={{
          busy: imageAction.pending,
          disabled: saving || imageAction.pending,
        }}
        disabled={saving || imageAction.pending}
        onPress={imageAction.press}
        style={styles.imagePicker}
      >
        <View style={styles.imagePreview}>
          {imageAction.pending ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.image} />
          ) : (
            <Ionicons
              name="image-outline"
              size={28}
              color={theme.colors.accent}
            />
          )}
        </View>
        <View style={styles.imageCopy}>
          <Text style={styles.imageTitle}>Poza mascotei</Text>
          <Text style={styles.imageText}>
            {previewUri ? 'Schimbă poza din galerie' : 'Alege poza din galerie'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      </TouchableOpacity>

      <ControlledTextField
        control={control}
        label="Nume"
        name="name"
        placeholder="Numele mascotei"
      />
      <ControlledTextField
        control={control}
        keyboardType="numeric"
        label="Preț pe oră"
        name="price_per_hour"
        numeric
        placeholder="Ex: 250"
      />

      <ControlledSwitchField
        activeText="Activă"
        control={control}
        inactiveText="Inactivă"
        label="Status"
        name="is_active"
      />
    </FormModalFrame>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  imagePreview: {
    alignItems: 'center',
    backgroundColor: theme.colors.orangeSoft,
    borderRadius: theme.radius.lg,
    height: 62,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    width: 62,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageCopy: {
    flex: 1,
  },
  imageTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  imageText: {
    color: theme.colors.muted,
    fontSize: theme.typography.meta,
    marginTop: theme.spacing.xs,
  },
});
