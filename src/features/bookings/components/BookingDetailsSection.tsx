import React, { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Card } from '@/shared/components/Card';
import { IconBadge } from '@/shared/components/IconBadge';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';

export function BookingDetailsSection({
  title,
  icon,
  summary,
  initiallyExpanded = false,
  children,
}: {
  title: string;
  icon: IconName;
  summary?: string;
  initiallyExpanded?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return (
    <Card style={styles.sectionCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={summary}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(current => !current)}
        style={styles.sectionHeader}
      >
        <IconBadge icon={icon} style={styles.sectionIcon} />
        <View style={styles.sectionLabels}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!expanded && summary ? (
            <Text style={styles.subtitle}>{summary}</Text>
          ) : null}
        </View>
        <Ionicons
          accessible={false}
          name={expanded ? 'chevron-up' : 'chevron-down'}
          color={theme.colors.menu.muted}
          size={theme.typography.sectionTitle}
        />
      </Pressable>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </Card>
  );
}
