import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAgendaSummary } from '@/features/company/hooks/useAgendaSummary';
import { AgendaMetric } from '@/features/company/components/AgendaMetric';
import { AgendaView } from '@/features/company/schemas/agendaSchemas';
import { RootStackParamList } from '@/shared/navigation/types';
import { QueryState } from '@/shared/components/QueryState';
import { AppButton } from '@/shared/components/AppButton';
import { formatExactAmount } from '@/shared/utils/money';
import { formatMonthLabel } from '@/shared/utils/formatDate';
import { useSingleColumnLayout } from '@/shared/hooks/useSingleColumnLayout';
import { theme } from '@/shared/theme/theme';

export function AgendaSummary() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const singleColumn = useSingleColumnLayout();
  const query = useAgendaSummary();
  const data = query.data;
  const open = (view: AgendaView) => {
    if (data) navigation.navigate('AgendaDetails', { view, month: data.month });
  };
  return (
    <View style={styles.summary}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>
          Pe scurt
        </Text>
        {data ? (
          <Text style={styles.period}>{formatMonthLabel(data.month)}</Text>
        ) : null}
      </View>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        hasData={Boolean(data)}
        retry={() => query.refetch()}
      />
      {data ? (
        <>
          <View style={styles.grid}>
            <AgendaMetric
              label="Evenimente luna aceasta"
              title="Evenimente"
              value={data.events_count}
              caption={`${data.remaining_count} rămase`}
              icon="calendar-outline"
              onPress={() => open('events')}
              style={singleColumn ? styles.full : styles.metric}
            />
            <AgendaMetric
              label="De rezolvat"
              value={data.attention_count}
              caption={
                data.overdue_advances_count
                  ? `${data.overdue_advances_count} ${data.overdue_advances_count === 1 ? 'avans restant' : 'avansuri restante'}`
                  : data.menus_due_count
                    ? `${data.menus_due_count} ${data.menus_due_count === 1 ? 'eveniment cu meniuri de confirmat' : 'evenimente cu meniuri de confirmat'}`
                    : data.overdue_payments_count
                      ? `${data.overdue_payments_count} ${data.overdue_payments_count === 1 ? 'încasare restantă' : 'încasări restante'}`
                      : 'Totul este la zi'
              }
              icon="clipboard-outline"
              attention={data.attention_count > 0}
              onPress={() => open('attention')}
              style={singleColumn ? styles.full : styles.metric}
            />
            {data.received_amount !== null ? (
              <AgendaMetric
                label="Încasat luna aceasta"
                title="Încasat"
                value={formatExactAmount(data.received_amount)}
                currency
                caption="Luna aceasta · bani primiți"
                icon="wallet-outline"
                onPress={() => open('received')}
                style={singleColumn ? styles.full : styles.metric}
              />
            ) : null}
            {data.due_amount !== null ? (
              <AgendaMetric
                label="Scadent în următoarele 7 zile"
                title="Scadent"
                value={formatExactAmount(data.due_amount)}
                currency
                caption={`${data.due_count} ${data.due_count === 1 ? 'plată' : 'plăți'} în următoarele 7 zile`}
                icon="time-outline"
                onPress={() => open('due')}
                style={singleColumn ? styles.full : styles.metric}
              />
            ) : null}
          </View>
          <AppButton
            label="Verifică sălile libere în weekend"
            icon="calendar-clear-outline"
            variant="outline"
            multiline
            onPress={() =>
              navigation.navigate('AgendaWeekend', { date: data.weekend_date })
            }
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.menu.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.subtitle,
  },
  period: {
    color: theme.colors.menu.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.label,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
  },
  metric: { flexBasis: '45%', flexGrow: 1 },
  full: { width: '100%' },
});
