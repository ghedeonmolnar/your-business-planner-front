import React, { useState } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Menu, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { Hall } from '@/features/halls/types';
import { hallStyles as styles } from '@/features/halls/components/hallStyles';
import { IconButton } from '@/shared/components/IconButton';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';

const MENU_MAX_WIDTH = 320;
export function HallActionsMenu({
  hall,
  busy,
  onEdit,
  onAvailability,
  onDuplicate,
  onStatus,
  onDelete,
}: {
  hall: Hall;
  busy: boolean;
  onEdit: () => void;
  onAvailability: () => void;
  onDuplicate: () => void;
  onStatus: () => void;
  onDelete: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const { width } = useWindowDimensions();
  const actions: {
    title: string;
    icon: IconName;
    onPress: () => void;
    danger?: boolean;
  }[] = [
    ...(hall.permissions.can_edit
      ? [
          {
            title: 'Editează sala',
            icon: 'create-outline' as const,
            onPress: onEdit,
          },
        ]
      : []),
    {
      title: 'Vezi disponibilitatea',
      icon: 'calendar-outline',
      onPress: onAvailability,
    },
    ...(hall.permissions.can_duplicate
      ? [
          {
            title: 'Duplică sala',
            icon: 'copy-outline' as const,
            onPress: onDuplicate,
          },
        ]
      : []),
    ...(hall.permissions.can_deactivate
      ? [
          {
            title: hall.is_active ? 'Dezactivează sala' : 'Reactivează sala',
            icon: 'eye-off-outline' as const,
            onPress: onStatus,
          },
        ]
      : []),
    ...(hall.permissions.can_delete
      ? [
          {
            title: 'Șterge sala',
            icon: 'trash-outline' as const,
            onPress: onDelete,
            danger: true,
          },
        ]
      : []),
  ];
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      overlayAccessibilityLabel="Închide meniul sălii"
      contentStyle={styles.menu}
      style={{ width: Math.min(MENU_MAX_WIDTH, width - theme.spacing.xl * 2) }}
      anchor={
        <IconButton
          icon="ellipsis-vertical"
          accessibilityLabel="Acțiuni sală"
          onPress={() => setVisible(true)}
          disabled={busy}
        />
      }
    >
      {actions.map(action => (
        <Pressable
          key={action.title}
          accessibilityRole="menuitem"
          accessibilityLabel={action.title}
          disabled={busy}
          style={styles.menuItem}
          onPress={() => {
            if (!busy) {
              setVisible(false);
              action.onPress();
            }
          }}
        >
          <Ionicons
            accessible={false}
            name={action.icon}
            size={theme.typography.title}
            color={
              action.danger ? theme.colors.danger : theme.colors.menu.primary
            }
          />
          <Text style={[styles.menuLabel, action.danger && styles.danger]}>
            {action.title}
          </Text>
        </Pressable>
      ))}
      {hall.has_history ? (
        <Text style={[styles.subtitle, styles.content]}>
          Sala are rezervări în istoric și poate fi dezactivată. Ștergerea nu
          este disponibilă.
        </Text>
      ) : null}
    </Menu>
  );
}
