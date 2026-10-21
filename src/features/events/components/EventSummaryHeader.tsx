import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/shared/components/Card';
import { Text } from 'react-native-paper';
import { Event } from '@/features/events/types';
import { theme } from '@/shared/theme/theme';
import { formatEventSchedule } from '@/shared/utils/formatDate';

type EventSummaryHeaderProps = {
  children?: React.ReactNode;
  event: Event;
};

const uniqueNames = (names: (string | null | undefined)[]) =>
  Array.from(new Set(names.filter((name): name is string => Boolean(name))));

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function EventSummaryHeader({
  children,
  event,
}: EventSummaryHeaderProps) {
  const assignments = event.assignments ?? [];
  const characterNames = uniqueNames([
    ...assignments.map(assignment => assignment.mascot_name),
    ...(event.mascots ?? []).map(mascot => mascot.name),
  ]);
  const employeeNames = uniqueNames([
    ...assignments.map(assignment => assignment.employee_name),
    ...(event.employees ?? []).map(employee => employee.name),
  ]);
  const city = event.location ?? 'Locație necompletată';
  const locationValue = event.address ? `${city} - ${event.address}` : city;

  return (
    <Card style={styles.card}>
      <DetailRow label="Locația" value={locationValue} />
      <DetailRow
        label="Data"
        value={formatEventSchedule(
          event.date,
          event.start_time,
          event.end_time,
        )}
      />
      <DetailRow
        label="Personaje"
        value={
          characterNames.length
            ? characterNames.join(', ')
            : 'Fără personaje alese'
        }
      />
      <DetailRow
        label="Angajați"
        value={
          employeeNames.length
            ? employeeNames.join(', ')
            : 'Fără angajați atribuiți'
        }
      />
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.meta,
    lineHeight: 20,
    width: 96,
  },
  value: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.typography.meta,
    lineHeight: 20,
  },
});
