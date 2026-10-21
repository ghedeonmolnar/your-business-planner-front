import { MascotFormValues } from '@/features/mascots/schemas/mascotSchema';

type ReactNativeFormDataFile = {
  uri: string;
  name: string;
  type: string;
};

export const buildMascotFormData = (values: MascotFormValues) => {
  const formData = new FormData();
  formData.append('name', values.name.trim());
  formData.append('price_per_hour', String(values.price_per_hour || 0));
  formData.append('is_active', values.is_active ? '1' : '0');

  if (values.image?.uri) {
    const image: ReactNativeFormDataFile = {
      uri: values.image.uri,
      name: values.image.fileName ?? `mascot-${Date.now()}.jpg`,
      type: values.image.type ?? 'image/jpeg',
    };

    formData.append('image', image as unknown as Blob);
  }

  return formData;
};
