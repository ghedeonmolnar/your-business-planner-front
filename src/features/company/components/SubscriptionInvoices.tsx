import React from 'react';
import { Linking, View } from 'react-native';
import { Text } from 'react-native-paper';
import {
  useSubscriptionInvoices,
  useSubscriptionInvoiceDownload,
} from '@/features/company/hooks/useSubscriptionInvoices';
import { AppButton } from '@/shared/components/AppButton';
import { QueryState } from '@/shared/components/QueryState';
import { formatExactMoney } from '@/shared/utils/money';
import { formatLongDate } from '@/shared/utils/formatDate';
import { showError } from '@/shared/feedback/showError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { IconBadge } from '@/shared/components/IconBadge';
import { contentStyles as styles } from '@/shared/components/contentStyles';

const invoiceStatusLabels = {
  pending: 'În pregătire',
  processing: 'Emiterea este în curs',
  issued: 'Emisă',
  uncertain: 'Emiterea se verifică',
  rejected: 'Emiterea necesită verificare',
};

export function SubscriptionInvoices() {
  const query = useSubscriptionInvoices();
  const download = useSubscriptionInvoiceDownload();
  const items = query.data?.pages.flatMap(page => page.items) ?? [];
  const open = async (id: string) => {
    if (download.isPending) return;
    const generation = getSessionGeneration();
    try {
      const result = await download.mutateAsync(id);
      if (generation === getSessionGeneration())
        await Linking.openURL(result.download_url);
    } catch (error) {
      if (generation === getSessionGeneration())
        showError(error, 'Nu am putut deschide factura abonamentului.');
    }
  };
  return (
    <>
      <Text style={styles.eyebrow}>Facturile abonamentului</Text>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        hasData={items.length > 0}
        retry={() => query.refetch()}
      />
      {query.isSuccess && !items.length ? (
        <View style={styles.row}>
          <IconBadge icon="document-text-outline" />
          <View style={styles.grow}>
            <Text style={styles.text}>Nu există facturi disponibile</Text>
            <Text style={styles.muted}>
              Facturile emise pentru abonamentul Gatify vor apărea aici.
            </Text>
          </View>
        </View>
      ) : null}
      {items.map(invoice => (
        <View key={invoice.id} style={styles.section}>
          <Text style={styles.text}>
            {invoice.series && invoice.number
              ? `${invoice.series} ${invoice.number}`
              : invoiceStatusLabels[invoice.status]}{' '}
            · {formatExactMoney(invoice.amount)} ·{' '}
            {formatLongDate(invoice.issued_on)}
          </Text>
          {invoice.status === 'issued' ? (
            <AppButton
              label={`Deschide factura ${invoice.series} ${invoice.number}`}
              variant="outline"
              loading={download.isPending}
              onPress={() => open(invoice.id)}
            />
          ) : (
            <Text style={styles.muted}>
              {invoiceStatusLabels[invoice.status]}
            </Text>
          )}
        </View>
      ))}
      {query.hasNextPage ? (
        <AppButton
          label="Mai multe facturi"
          variant="ghost"
          loading={query.isFetchingNextPage}
          onPress={() => query.fetchNextPage()}
        />
      ) : null}
    </>
  );
}
