import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { IconButton } from '@/shared/components/IconButton';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';

export function HallScreenHeader({
  title,
  subtitle,
  onBack,
  trailing,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <IconButton
        icon="arrow-back"
        accessibilityLabel="Înapoi"
        onPress={onBack}
      />
      <View style={styles.labels}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}
