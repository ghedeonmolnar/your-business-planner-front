import React from 'react';
import { Text } from 'react-native-paper';
import { FiscalProfile } from '@/features/company/schemas/companyProfileSchemas';
import { contentStyles as styles } from '@/shared/components/contentStyles';

export function BillingProfileSummary({ profile }: { profile: FiscalProfile }) {
  return (
    <>
      <Text style={styles.subtitle}>{profile.legal_name}</Text>
      <Text style={styles.text}>
        CUI: {profile.vat_registered ? 'RO' : ''}
        {profile.fiscal_code}
      </Text>
      {profile.trade_register_number ? (
        <Text style={styles.text}>
          Reg. com.: {profile.trade_register_number}
        </Text>
      ) : null}
      <Text style={styles.text}>{profile.address}</Text>
      <Text style={styles.muted}>
        {[profile.city, profile.county, profile.postal_code, 'România']
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <Text style={styles.muted}>
        {profile.vat_registered ? 'Plătitoare de TVA' : 'Neplătitoare de TVA'}
      </Text>
      {profile.iban ? <Text style={styles.text}>{profile.iban}</Text> : null}
      {profile.bank_name ? (
        <Text style={styles.muted}>{profile.bank_name}</Text>
      ) : null}
    </>
  );
}
