import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { useOverview } from '@/features/company/hooks/useCompany';
import { contentStyles as styles } from '@/shared/components/contentStyles';
import { QueryState } from '@/shared/components/QueryState';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
import { ContentSection } from '@/shared/components/ContentSection';
import { IconButton } from '@/shared/components/IconButton';
import { InfoRow } from '@/shared/components/InfoRow';
import { formatExactMoney } from '@/shared/utils/money';
import { companyNow, formatMonthLabel } from '@/shared/utils/formatDate';
import { useNavigation } from '@react-navigation/native';

export function OverviewScreen() {
  const navigation = useNavigation();
  const [year, setYear] = useState(companyNow().year());
  const query = useOverview(year + '-01-01', year + '-12-31');
  const data = query.data;
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ContentSection
          title={`Financiar și statistici · ${year}`}
          size="page"
          leading={
            <IconButton
              icon="arrow-back"
              accessibilityLabel="Înapoi"
              onPress={() => navigation.goBack()}
            />
          }
        />
        <View style={styles.row}>
          <AppButton
            label="Anul anterior"
            onPress={() => setYear(current => current - 1)}
          />
          <AppButton
            label="Anul următor"
            onPress={() => setYear(current => current + 1)}
          />
        </View>
        <QueryState
          loading={query.isLoading}
          error={query.error}
          retry={() => query.refetch()}
        />
        {data ? (
          <Card style={styles.card}>
            {[
              { label: 'Rezervări confirmate', value: data.confirmed_count },
              { label: 'Cereri fără avans', value: data.tentative_count },
              {
                label: 'Ocupare săli active',
                value: `${(data.occupancy_basis_points / 100).toLocaleString('ro-RO')}%`,
              },
              {
                label: 'Valoare contractată',
                value: formatExactMoney(data.contracted_amount),
              },
              {
                label: 'Cost estimat personal',
                value: formatExactMoney(data.estimated_staff_cost),
              },
              {
                label: 'Rest de încasat',
                value: formatExactMoney(data.balance_due),
              },
              {
                label: 'Încasări efective',
                value: formatExactMoney(data.received_amount),
              },
              {
                label: 'Cheltuieli efective',
                value: formatExactMoney(data.outgoing_amount),
              },
              {
                label: 'Diferență încasări − cheltuieli',
                value: formatExactMoney(data.cash_profit_amount),
              },
            ].map(item => (
              <InfoRow key={item.label} {...item} />
            ))}
            <Text style={styles.muted}>
              {data.occupied_hall_days} zile rezervate din{' '}
              {data.available_hall_days} zile-sală, raportate la sălile active
              în prezent.
            </Text>
            <Text style={styles.muted}>
              Încasările și cheltuielile sunt grupate după data plății.
              Contractele sunt grupate după data evenimentului.
            </Text>
          </Card>
        ) : null}
        {data?.monthly.map(month => (
          <Card key={month.month} style={styles.card}>
            <Text style={styles.subtitle}>{formatMonthLabel(month.month)}</Text>
            <Text style={styles.text}>
              {month.events_count} evenimente ·{' '}
              {formatExactMoney(month.contracted_amount)} contractat
            </Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
