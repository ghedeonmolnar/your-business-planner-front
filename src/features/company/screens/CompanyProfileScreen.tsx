import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { SubscriptionInvoices } from '@/features/company/components/SubscriptionInvoices';
import { ActionList } from '@/shared/components/ActionList';
import { ActionItem } from '@/shared/components/ActionTile';
import { RootStackParamList } from '@/shared/navigation/types';
import { Screen } from '@/shared/components/Screen';
import { Card } from '@/shared/components/Card';
import { IconButton } from '@/shared/components/IconButton';
import { ContentSection } from '@/shared/components/ContentSection';
import { theme } from '@/shared/theme/theme';

export function CompanyProfileScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const owner = user?.role === 'owner';
  const items: ActionItem[] = [
    {
      id: 'account',
      label: 'Contul meu',
      description: 'Date personale și securitate',
      icon: 'person-outline',
      onPress: () => navigation.navigate('AccountSettings', { tab: 'profile' }),
    },
  ];
  if (owner)
    items.push({
      id: 'company',
      label: 'Firmă și facturare',
      description: 'Datele companiei și profilul fiscal',
      icon: 'business-outline',
      onPress: () => navigation.navigate('CompanySettings', { tab: 'general' }),
    });
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ContentSection
          title={owner ? 'Profil și facturare' : 'Profilul meu'}
          subtitle={
            owner
              ? 'Setările contului și ale companiei'
              : 'Datele și securitatea contului'
          }
          size="page"
          titleStyle={styles.title}
          leading={
            <IconButton
              icon="arrow-back"
              accessibilityLabel="Înapoi"
              onPress={() => navigation.goBack()}
            />
          }
        />
        <ActionList items={items} />
        {owner ? (
          <Card>
            <SubscriptionInvoices />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: theme.typography.title },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
});
