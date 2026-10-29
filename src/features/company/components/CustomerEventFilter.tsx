import React from 'react';
import { StyleSheet, View } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { CustomerDateRange } from '@/features/company/schemas/customerListSchemas';
import { Card } from '@/shared/components/Card';
import { CollapsibleSectionHeader } from '@/shared/components/CollapsibleSectionHeader';
import { ControlledDateRangeFields } from '@/shared/components/ControlledDateRangeFields';
import { FormActions } from '@/shared/components/FormActions';
import { MetaPill } from '@/shared/components/MetaPill';
import { theme } from '@/shared/theme/theme';
import { formatShortDate } from '@/shared/utils/formatDate';

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
  return (
    <View style={styles.container}>
      <Card>
        <CollapsibleSectionHeader
          title="Filtrează după evenimente"
          icon="calendar-outline"
          expanded={expanded}
          onToggle={onToggle}
        />
        {expanded ? (
          <>
            <ControlledDateRangeFields
              required
              control={form.control}
              fromName="date_from"
              toName="date_to"
            />
            <FormActions
              primary={{
                label: 'Aplică filtrul',
                icon: 'filter-outline',
                onPress: onApply,
              }}
              secondary={{
                label: 'Resetează',
                icon: 'refresh-outline',
                onPress: onReset,
              }}
            />
          </>
        ) : null}
      </Card>
      {range && !expanded ? (
        <MetaPill
          tone="primary"
          icon="calendar-outline"
          label={`${formatShortDate(range.date_from)} – ${formatShortDate(range.date_to)}`}
          onRemove={onReset}
          removeLabel="Elimină filtrul de evenimente"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: theme.spacing.sm } });
