import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { UseFormReturn } from 'react-hook-form';
import { CustomerDateRange } from '@/features/company/schemas/customerListSchemas';
import { AppButton } from '@/shared/components/AppButton';
import { Card } from '@/shared/components/Card';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { theme } from '@/shared/theme/theme';
import { formatShortDate } from '@/shared/utils/formatDate';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';

type CustomerEventFilterProps = {
  form: UseFormReturn<CustomerDateRange>;
  expanded: boolean;
  range: CustomerDateRange | null;
  onToggle: () => void;
  onApply: () => void;
  onReset: () => void;
};

export function CustomerEventFilter({
  form,
  expanded,
  range,
  onToggle,
  onApply,
  onReset,
}: CustomerEventFilterProps) {
  const singleColumn = useSingleColumnLayout();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtrează după evenimente"
          accessibilityState={{ expanded }}
          onPress={onToggle}
          style={styles.toggle}
        >
          <Ionicons
            accessible={false}
            name="calendar-outline"
            size={theme.typography.title}
            color={theme.colors.menu.primary}
          />
          <Text style={styles.title}>Filtrează după evenimente</Text>
          <Ionicons
            accessible={false}
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={theme.typography.subtitle}
            color={theme.colors.menu.muted}
          />
        </Pressable>
        {expanded ? (
          <View>
            <View style={singleColumn ? styles.fieldsColumn : styles.fieldsRow}>
              <ControlledDateField
                control={form.control}
                name="date_from"
                label="De la"
                placeholder="Alege data"
                displayFormat="numeric"
                style={singleColumn ? undefined : styles.date}
                fieldStyle={styles.dateField}
              />
              <ControlledDateField
                control={form.control}
                name="date_to"
                label="Până la"
                placeholder="Alege data"
                displayFormat="numeric"
                style={singleColumn ? undefined : styles.date}
                fieldStyle={styles.dateField}
              />
            </View>
            <View
              style={singleColumn ? styles.actionsColumn : styles.actionsRow}
            >
              <AppButton
                label="Aplică filtrul"
                icon="filter-outline"
                onPress={onApply}
                shape="rounded"
                backgroundColor={theme.colors.menu.primary}
                color={theme.colors.menu.surface}
                style={singleColumn ? undefined : styles.apply}
              />
              <AppButton
                label="Resetează"
                icon="refresh-outline"
                onPress={onReset}
                shape="rounded"
                variant="soft"
                backgroundColor={theme.colors.menu.primarySoft}
                color={theme.colors.menu.primary}
              />
            </View>
          </View>
        ) : null}
      </Card>
      {range && !expanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Elimină filtrul de evenimente"
          accessibilityHint={`${formatShortDate(range.date_from)} – ${formatShortDate(range.date_to)}`}
          onPress={onReset}
          style={styles.activeFilter}
        >
          <Ionicons
            accessible={false}
            name="calendar-outline"
            size={theme.typography.subtitle}
            color={theme.colors.menu.primary}
          />
          <Text style={styles.filterText}>
            {formatShortDate(range.date_from)} –{' '}
            {formatShortDate(range.date_to)}
          </Text>
          <Ionicons
            accessible={false}
            name="close"
            size={theme.typography.subtitle}
            color={theme.colors.menu.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.menu.surface,
    borderWidth: 0,
    padding: theme.spacing.lg,
  },
  toggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: theme.spacing.xl * 2,
  },
  title: {
    color: theme.colors.menu.text,
    flex: 1,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.body,
  },
  fieldsRow: { flexDirection: 'row', gap: theme.spacing.md },
  fieldsColumn: { flexDirection: 'column' },
  date: { flex: 1 },
  dateField: {
    backgroundColor: theme.colors.menu.surface,
    borderColor: theme.colors.menu.border,
    borderRadius: theme.radius.md,
    minHeight: theme.spacing.xl * 2,
  },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  actionsColumn: { gap: theme.spacing.sm },
  apply: { flex: 1 },
  activeFilter: {
    alignItems: 'center',
    backgroundColor: theme.colors.menu.primarySoft,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: theme.spacing.xl * 2,
    padding: theme.spacing.md,
  },
  filterText: {
    color: theme.colors.menu.primary,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.typography.label,
  },
});
