import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { AccountOverviewCard } from '@/features/company/components/AccountOverviewCard';
import { MoreInfoModal } from '@/features/company/components/MoreInfoModal';
import { SubscriptionCard } from '@/features/company/components/SubscriptionCard';
import { useMoreActions } from '@/features/company/hooks/useMoreActions';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { ActionGrid } from '@/shared/components/ActionGrid';
import { ActionList } from '@/shared/components/ActionList';
import { ActionTile, ActionItem } from '@/shared/components/ActionTile';
import { ContentSection } from '@/shared/components/ContentSection';
import { Screen } from '@/shared/components/Screen';
import { RootStackParamList } from '@/shared/navigation/types';
import { theme } from '@/shared/theme/theme';
import { MobileUpdateRecommendation } from '@/features/mobilePolicy/components/MobileUpdateRecommendation';

export function MoreScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const actions = useMoreActions();
  const management: ActionItem[] = [];

  if (user && user.role !== 'employee') {
    management.push({
      id: 'halls',
      label: 'Săli',
      description: 'Adaugă și gestionează sălile de evenimente',
      icon: 'business-outline',
      onPress: () => navigation.navigate('CompanyHalls'),
    });
    if (hasCompanyFeature(user, 'staff')) {
      management.push({
        id: 'staff',
        label: 'Personal',
        description: 'Echipa ta și disponibilitatea',
        icon: 'people-outline',
        tone: 'staff',
        onPress: () => navigation.navigate('CompanyStaff'),
      });
    }
    if (hasCompanyFeature(user, 'finance')) {
      management.push({
        id: 'finance',
        label: 'Financiar și statistici',
        description: 'Încasări, rapoarte și analize',
        icon: 'stats-chart-outline',
        tone: 'finance',
        onPress: () => navigation.navigate('CompanyOverview'),
      });
    }
    if (user.role === 'owner') {
      management.push({
        id: 'team',
        label: 'Conturi și invitații',
        description: 'Gestionează utilizatorii și accesul',
        icon: 'mail-outline',
        tone: 'invitations',
        onPress: () => navigation.navigate('CompanyTeam'),
      });
    }
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ContentSection
          title="Mai multe"
          subtitle="Gestionează contul, setările și alte opțiuni"
          size="page"
        />
        <MobileUpdateRecommendation />
        {user ? (
          <AccountOverviewCard
            name={user.name}
            email={user.email}
            companyName={user.company?.name}
            profileLabel={
              user.role === 'owner' ? 'Profil și facturare' : 'Profilul meu'
            }
            onOpenProfile={() => navigation.navigate('CompanyProfile')}
          />
        ) : null}
        {management.length ? (
          <ContentSection
            title="Administrare"
            subtitle="Gestionează resursele afacerii tale"
          >
            <ActionGrid items={management} />
          </ContentSection>
        ) : null}
        <ContentSection
          title="Abonament"
          subtitle="Detalii despre planul tău actual"
        >
          <SubscriptionCard
            plan={user?.plan}
            subscription={user?.subscription}
            onManage={
              user?.role === 'owner'
                ? () => actions.setPanel('subscription')
                : undefined
            }
          />
        </ContentSection>
        <ContentSection
          title="Suport și contact"
          subtitle="Ai nevoie de ajutor? Suntem aici pentru tine."
        >
          <ActionGrid
            items={[
              {
                id: 'support',
                label: 'Contactează-ne',
                icon: 'headset-outline',
                description:
                  [actions.email, actions.phone].filter(Boolean).join('\n') ||
                  'Ia legătura cu echipa de suport',
                onPress: () => actions.setPanel('support'),
              },
              {
                id: 'help',
                label: 'Ajutor și ghiduri',
                icon: 'help-circle-outline',
                tone: 'help',
                description: 'Răspunsuri la cele mai frecvente întrebări',
                onPress: () => actions.setPanel('help'),
              },
            ]}
          />
        </ContentSection>
        <ContentSection
          title="Setări"
          subtitle="Preferințe și opțiuni ale aplicației"
        >
          <ActionList
            items={[
              {
                id: 'notifications',
                label: 'Notificări',
                icon: 'notifications-outline',
                onPress: () => actions.setPanel('notifications'),
              },
              {
                id: 'about',
                label: 'Despre aplicație',
                icon: 'information-circle-outline',
                onPress: () => actions.setPanel('about'),
              },
            ]}
          />
        </ContentSection>
        <ActionTile
          label="Deconectare"
          icon="log-out-outline"
          variant="danger"
          onPress={actions.requestSignOut}
        />
      </ScrollView>
      {actions.panel && user ? (
        <MoreInfoModal
          panel={actions.panel}
          user={user}
          email={actions.email}
          phone={actions.phone}
          onClose={() => actions.setPanel(null)}
          onEmail={actions.writeEmail}
          onPhone={actions.callSupport}
          onSettings={actions.openSettings}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: theme.colors.menu.background },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
