import React, { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { Appbar, Menu, Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { IconName } from '@/shared/types/icon';
import { theme } from '@/shared/theme/theme';
import { bookingDetailsStyles as styles } from '@/features/bookings/components/bookingDetailsStyles';

type Props = {
  onBack: () => void;
  onEdit: () => void;
  onShare: () => void;
  onCancel: () => void;
  canManage: boolean;
  canShare: boolean;
  canCancel: boolean;
  busy: boolean;
};

const MENU_MAX_WIDTH = 320;
const HEADER_SUBTITLE_MIN_WIDTH = 360;

export function BookingDetailsHeader({
  onBack,
  onEdit,
  onShare,
  onCancel,
  canManage,
  canShare,
  canCancel,
  busy,
}: Props) {
  const [visible, setVisible] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const actions: {
    title: string;
    icon: IconName;
    onPress: () => void;
    disabled?: boolean;
    danger?: boolean;
  }[] = [
    { title: 'Editează rezervarea', icon: 'create-outline', onPress: onEdit },
    {
      title: 'Verifică și trimite pe WhatsApp',
      icon: 'logo-whatsapp',
      onPress: onShare,
      disabled: !canShare,
    },
    ...(canCancel
      ? [
          {
            title: 'Anulează rezervarea',
            icon: 'trash-outline' as const,
            onPress: onCancel,
            danger: true,
          },
        ]
      : []),
  ];
  return (
    <Appbar.Header statusBarHeight={0} style={styles.appbar}>
      <Appbar.Action
        accessibilityLabel="Înapoi"
        icon={({ size, color }) => (
          <Ionicons name="arrow-back" size={size} color={color} />
        )}
        color={theme.colors.menu.primary}
        onPress={onBack}
        style={styles.action}
      />
      <View style={styles.headerLabels}>
        <Text accessibilityRole="header" style={styles.headerTitle}>
          Detalii rezervare
        </Text>
        {width / fontScale >= HEADER_SUBTITLE_MIN_WIDTH ? (
          <Text style={styles.subtitle}>Your Business Planner</Text>
        ) : null}
      </View>
      {canManage ? (
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          overlayAccessibilityLabel="Închide meniul rezervării"
          contentStyle={styles.menu}
          style={{
            width: Math.min(width - theme.spacing.xl * 2, MENU_MAX_WIDTH),
          }}
          anchor={
            <Appbar.Action
              accessibilityLabel="Acțiuni rezervare"
              accessibilityState={{ expanded: visible }}
              icon={({ size, color }) => (
                <Ionicons name="ellipsis-vertical" size={size} color={color} />
              )}
              color={theme.colors.menu.primary}
              onPress={() => setVisible(true)}
              style={styles.action}
            />
          }
        >
          {actions.map(action => (
            <Pressable
              key={action.title}
              accessibilityRole="menuitem"
              accessibilityLabel={action.title}
              accessibilityState={{
                disabled: busy || Boolean(action.disabled),
              }}
              disabled={busy || action.disabled}
              style={styles.menuItem}
              onPress={() => {
                setVisible(false);
                action.onPress();
              }}
            >
              <Ionicons
                accessible={false}
                name={action.icon}
                size={theme.typography.title}
                color={
                  busy || action.disabled
                    ? theme.colors.disabled
                    : action.danger
                      ? theme.colors.danger
                      : theme.colors.menu.primary
                }
              />
              <Text
                style={[
                  styles.menuText,
                  action.danger && styles.danger,
                  (busy || action.disabled) && styles.disabled,
                ]}
              >
                {action.title}
              </Text>
            </Pressable>
          ))}
        </Menu>
      ) : null}
    </Appbar.Header>
  );
}
