import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Employee } from '@/features/employees/types';
import { Card } from '@/shared/components/Card';
import { EditIconButton } from '@/shared/components/EditIconButton';
import { IconButton } from '@/shared/components/IconButton';
import { theme } from '@/shared/theme/theme';

type EmployeeCardProps = {
  employee: Employee;
  onDetails: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

export function EmployeeCard({
  employee,
  onDetails,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const rateLabel =
    employee.hourly_rate === null
      ? '-'
      : Math.round(Number(employee.hourly_rate) || 0).toString();

  return (
    <Card
      style={[
        styles.card,
        !employee.is_active ? styles.inactiveCard : undefined,
      ]}
    >
      <View style={styles.cardMain}>
        <TouchableOpacity
          accessibilityLabel={`Deschide profilul angajatului ${employee.name}`}
          accessibilityRole="button"
          activeOpacity={0.72}
          onPress={() => onDetails(employee)}
          style={styles.employeeInfo}
        >
          <View style={styles.nameRow}>
            <Text style={styles.name}>{employee.name}</Text>
            {!employee.is_active ? (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactiv</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.rateText}>{rateLabel} lei/h</Text>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <EditIconButton
            accessibilityLabel={`Editează angajatul ${employee.name}`}
            onPress={() => onEdit(employee)}
          />
          <IconButton
            accessibilityLabel={
              employee.is_active
                ? `Șterge angajatul ${employee.name}`
                : `Șterge definitiv angajatul ${employee.name}`
            }
            backgroundColor={theme.colors.redSoft}
            color={theme.colors.danger}
            icon={employee.is_active ? 'trash-outline' : 'trash'}
            onPress={() => onDelete(employee)}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  inactiveCard: {
    opacity: 0.72,
  },
  cardMain: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  employeeInfo: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    marginRight: theme.spacing.sm,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.redSoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  inactiveText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    fontWeight: '800',
  },
  rateText: {
    color: theme.colors.muted,
    fontSize: theme.typography.bodySmall,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
