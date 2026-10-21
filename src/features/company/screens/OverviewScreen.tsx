import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { useOverview } from '@/features/company/hooks/useCompany';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { AppButton } from '@/shared/components/AppButton';
import { Screen } from '@/shared/components/Screen';
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
        <AppButton
          label="Înapoi"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Financiar și statistici · {year}</Text>
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
        <QueryNotice
          loading={query.isLoading}
          error={query.error}
          retry={() => query.refetch()}
        />
        {data ? (
          <Card style={styles.card}>
            <Text style={styles.text}>
              Rezervări confirmate: {data.confirmed_count}
            </Text>
            <Text style={styles.text}>
              Provizorii active: {data.tentative_count}
            </Text>
            <Text style={styles.text}>
              Ocupare săli active:{' '}
              {(data.occupancy_basis_points / 100).toLocaleString('ro-RO')}%
            </Text>
            <Text style={styles.muted}>
              {data.occupied_hall_days} zile rezervate din{' '}
              {data.available_hall_days} zile-sală, raportate la sălile active
              în prezent.
            </Text>
            <Text style={styles.text}>
              Valoare contractată: {formatExactMoney(data.contracted_amount)}
            </Text>
            <Text style={styles.text}>
              Cost estimat personal:{' '}
              {formatExactMoney(data.estimated_staff_cost)}
            </Text>
            <Text style={styles.text}>
              Rest de încasat: {formatExactMoney(data.balance_due)}
            </Text>
            <Text style={styles.text}>
              Încasări efective: {formatExactMoney(data.received_amount)}
            </Text>
            <Text style={styles.text}>
              Cheltuieli efective: {formatExactMoney(data.outgoing_amount)}
            </Text>
            <Text style={styles.text}>
              Diferență încasări − cheltuieli:{' '}
              {formatExactMoney(data.cash_profit_amount)}
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
