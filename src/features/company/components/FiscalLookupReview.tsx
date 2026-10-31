import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { FiscalProfile } from '@/features/company/schemas/companyProfileSchemas';
import { BillingProfileSummary } from '@/features/company/components/BillingProfileSummary';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { FormActions } from '@/shared/components/FormActions';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function FiscalLookupReview({
  proposal,
  onApply,
  onClose,
}: {
  proposal: FiscalProfile;
  onApply: () => void;
  onClose: () => void;
}) {
  return (
    <FormModalFrame
      visible
      title="Date de la ANAF"
      size="review"
      onClose={onClose}
      footer={
        <FormActions
          primary={{
            label: 'Aplică în formular',
            onPress: onApply,
          }}
          secondary={{ label: 'Renunță', onPress: onClose }}
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.muted}>
          Verifică propunerea înainte să înlocuiești datele fiscale din
          formular.
        </Text>
        <View style={styles.card}>
          <BillingProfileSummary profile={proposal} />
        </View>
        <Text style={styles.muted}>
          IBAN-ul și banca rămân neschimbate. Salvează apoi datele fiscale din
          ecranul firmei.
        </Text>
      </View>
    </FormModalFrame>
  );
}
