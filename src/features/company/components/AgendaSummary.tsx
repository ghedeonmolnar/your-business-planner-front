import { companyNow } from '@/shared/utils/formatDate';
import React from 'react';

import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { useOverview } from '@/features/company/hooks/useCompany';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { formatExactMoney } from '@/shared/utils/money';

export function AgendaSummary() {
  const query = useOverview(
    companyNow().startOf('month').format('YYYY-MM-DD'),
    companyNow().endOf('month').format('YYYY-MM-DD'),
  );
  return (
    <Card style={styles.card}>
      <Text style={styles.subtitle}>Luna curentă</Text>
      <QueryNotice
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data ? (
        <>
          <Text style={styles.text}>
            Încasări: {formatExactMoney(query.data.received_amount)}
          </Text>
          <Text style={styles.text}>
            Cheltuieli: {formatExactMoney(query.data.outgoing_amount)}
          </Text>
          <Text style={styles.text}>
            Resturi pentru evenimentele lunii:{' '}
            {formatExactMoney(query.data.balance_due)}
          </Text>
          <Text style={styles.text}>
            Rezervări provizorii active: {query.data.tentative_count}
          </Text>
        </>
      ) : null}
    </Card>
  );
}
