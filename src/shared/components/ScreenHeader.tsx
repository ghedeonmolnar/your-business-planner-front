import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BrandLogo } from '@/shared/components/BrandLogo';
import { theme } from '@/shared/theme/theme';

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandArea}>
        <View style={styles.logoWrap}>
          <BrandLogo size={43} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 50,
    ...theme.shadow,
  },
  textWrap: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  action: { alignItems: 'flex-end' },
  eyebrow: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.micro,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.sectionTitle,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  subtitle: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.caption,
    lineHeight: 16,
    marginTop: theme.spacing.xs,
  },
});
