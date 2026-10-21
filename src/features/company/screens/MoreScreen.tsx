import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { plannerStyles as styles } from '@/features/bookings/components/plannerStyles';
import { Screen } from '@/shared/components/Screen';
import { AppButton } from '@/shared/components/AppButton';
import { RootStackParamList } from '@/shared/navigation/types';
import { formatCompanyDateTime } from '@/shared/utils/formatDate';
import { CompanySettingsForm } from '@/features/company/components/CompanySettingsForm';
import { showError } from '@/shared/feedback/showError';

export function MoreScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mai multe</Text>
        <Text style={styles.subtitle}>{user?.company?.name}</Text>
        <Text style={styles.text}>
          {user?.name} · {user?.email}
        </Text>
        {user?.role !== 'employee' ? (
          <>
            <AppButton
              label="Săli"
              onPress={() => navigation.navigate('CompanyHalls')}
            />
            <AppButton
              label="Personal"
              onPress={() => navigation.navigate('CompanyStaff')}
            />
            <AppButton
              label="Financiar și statistici"
              onPress={() => navigation.navigate('CompanyOverview')}
            />
          </>
        ) : null}
        {user?.role === 'owner' ? (
          <AppButton
            label="Conturi și invitații"
            onPress={() => navigation.navigate('CompanyTeam')}
          />
        ) : null}
        {user?.role === 'owner' ? (
          <AppButton label="Setări companie" onPress={() => setEditing(true)} />
        ) : null}
        <Text style={styles.subtitle}>Abonament</Text>
        <Text style={styles.text}>
          Valabil până la {formatCompanyDateTime(user?.subscription?.ends_at)}
        </Text>
        <Text style={styles.text}>
          {user?.support_email ?? ''} {user?.support_phone ?? ''}
        </Text>
        <AppButton
          label="Deconectare"
          variant="outline"
          onPress={() => {
            signOut().catch(error =>
              showError(error, 'Nu am putut închide sesiunea.'),
            );
          }}
        />
      </ScrollView>
      {editing ? (
        <CompanySettingsForm onClose={() => setEditing(false)} />
      ) : null}
    </Screen>
  );
}
