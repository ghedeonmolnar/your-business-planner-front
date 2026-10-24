import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import { useCustomer } from '@/features/company/hooks/useCustomers';
import { DirectoryItem } from '@/features/company/types';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function ClientConflictReview({
  clientId,
  onReload,
}: {
  clientId: string;
  onReload: (client: DirectoryItem) => void;
}) {
  const query = useCustomer(clientId);
  const [generation] = useState(getSessionGeneration);
  return (
    <>
      <Text>
        Clientul a fost modificat. Ciorna ta este păstrată până alegi să încarci
        versiunea salvată.
      </Text>
      <AppButton
        label="Încarcă versiunea salvată"
        variant="outline"
        loading={query.isFetching}
        onPress={() =>
          confirmAction({
            title: 'Încarci versiunea salvată?',
            message:
              'Ciorna ta va fi înlocuită cu datele curente ale clientului.',
            confirmLabel: 'Încarcă versiunea',
            onConfirm: () => {
              query
                .refetch()
                .then(result => {
                  if (generation !== getSessionGeneration()) return;
                  if (result.error) throw result.error;
                  if (result.data) onReload(result.data);
                })
                .catch(error => {
                  if (generation === getSessionGeneration())
                    showError(error, 'Nu am putut încărca clientul.');
                });
            },
          })
        }
      />
    </>
  );
}
