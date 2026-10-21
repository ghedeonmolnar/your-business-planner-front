import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCompanyProfile } from '@/features/company/hooks/useCompanyProfile';
import { CompanySettingsForm } from '@/features/company/components/CompanySettingsForm';
import { OwnerProfileForm } from '@/features/company/components/OwnerProfileForm';
import { BillingProfileSummary } from '@/features/company/components/BillingProfileSummary';
import { QueryNotice } from '@/features/bookings/components/QueryNotice';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { IconButton } from '@/shared/components/IconButton';

export function CompanyProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const query = useCompanyProfile();
  const [editing, setEditing] = useState<'owner' | 'company' | null>(null);
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.between}>
          <IconButton
            icon="arrow-back"
            accessibilityLabel="Înapoi"
            onPress={() => navigation.goBack()}
          />
          <Text style={[styles.title, styles.grow]}>Profil și facturare</Text>
        </View>
        <Card style={styles.card}>
          <Text style={styles.eyebrow}>Profilul meu</Text>
          <Text style={styles.subtitle}>{user?.name}</Text>
          <Text style={styles.muted}>{user?.email}</Text>
          <AppButton
            label="Editează profilul meu"
            variant="ghost"
            icon="person-outline"
            onPress={() => setEditing('owner')}
          />
        </Card>
        <QueryNotice
          loading={query.isLoading}
          error={query.error}
          retry={() => query.refetch()}
        />
        {query.data ? (
          <>
            <Card style={styles.card}>
              <Text style={styles.eyebrow}>Firma mea</Text>
              <Text style={styles.subtitle}>{query.data.name}</Text>
              {query.data.email ? (
                <Text style={styles.text}>{query.data.email}</Text>
              ) : null}
              {query.data.phone ? (
                <Text style={styles.text}>{query.data.phone}</Text>
              ) : null}
              {query.data.address ? (
                <Text style={styles.muted}>{query.data.address}</Text>
              ) : null}
              <AppButton
                label="Editează firma și datele fiscale"
                variant="outline"
                icon="create-outline"
                onPress={() => setEditing('company')}
                multiline
              />
            </Card>
            <Card style={styles.card}>
              <Text style={styles.eyebrow}>Date pentru facturare</Text>
              {query.data.billing_profile ? (
                <BillingProfileSummary profile={query.data.billing_profile} />
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Completează datele fiscale
                  </Text>
                  <Text style={styles.muted}>
                    Introdu CUI-ul firmei și preluăm datele disponibile la ANAF.
                    Profilul salvat precompletează datele de facturare.
                  </Text>
                  <AppButton
                    label="Completează datele fiscale"
                    onPress={() => setEditing('company')}
                  />
                </>
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>
      {editing === 'owner' ? (
        <OwnerProfileForm onClose={() => setEditing(null)} />
      ) : null}
      {editing === 'company' && query.data ? (
        <CompanySettingsForm
          company={query.data}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Screen>
  );
}
