import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { useCompanyProfile } from '@/features/company/hooks/useCompanyProfile';
import { CompanySettingsForm } from '@/features/company/components/CompanySettingsForm';
import { RootStackParamList } from '@/shared/navigation/types';
import { FormScreenFrame } from '@/shared/components/FormScreenFrame';
import { QueryState } from '@/shared/components/QueryState';

export function CompanySettingsScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, 'CompanySettings'>) {
  const { user } = useAuth();
  const query = useCompanyProfile();
  if (user?.role !== 'owner') return null;
  if (!query.data)
    return (
      <FormScreenFrame title="Editează firma">
        <QueryState
          loading={query.isLoading}
          error={query.error}
          retry={() => query.refetch()}
        />
      </FormScreenFrame>
    );
  return (
    <CompanySettingsForm
      key={`${user.id}:${query.data.id}`}
      company={query.data}
      initialTab={route.params?.tab}
      loadError={query.error}
      onReload={() => {
        void query.refetch();
      }}
    />
  );
}
