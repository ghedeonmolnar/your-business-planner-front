import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { theme } from '@/shared/theme/theme';

export function HallPhoto({
  uri,
  label,
}: {
  uri: string | null;
  label: string;
}) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  return uri && failedUri !== uri ? (
    <Image
      source={{ uri }}
      accessibilityLabel={label}
      style={styles.image}
      onError={() => setFailedUri(uri)}
    />
  ) : (
    <View
      style={[styles.image, styles.placeholder]}
      accessible
      accessibilityLabel={
        uri
          ? 'Imagine indisponibilă. Reîncarcă datele sălii.'
          : 'Nicio imagine adăugată'
      }
    >
      <Ionicons
        accessible={false}
        name="image-outline"
        size={theme.spacing.xxl}
        color={theme.colors.menu.primary}
      />
    </View>
  );
}
