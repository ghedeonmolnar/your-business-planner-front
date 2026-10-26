import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { EmployeeCard } from '@/features/employees/components/EmployeeCard';
import { EmployeeForm } from '@/features/employees/components/EmployeeForm';
import { useEmployeeAdmin } from '@/features/employees/hooks/useEmployeeAdmin';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { Employee } from '@/features/employees/types';
import { MascotCard } from '@/features/mascots/components/MascotCard';
import { MascotForm } from '@/features/mascots/components/MascotForm';
import { useMascotAdmin } from '@/features/mascots/hooks/useMascotAdmin';
import { useMascots } from '@/features/mascots/hooks/useMascots';
import { Mascot } from '@/features/mascots/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { AppButton } from '@/shared/components/AppButton';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/components/Screen';
import { ScreenHeader } from '@/shared/components/ScreenHeader';
import { isUnauthorizedError } from '@/shared/api/client';
import { theme } from '@/shared/theme/theme';
import { getErrorMessage } from '@/shared/utils/errorMessage';

type TeamTab = 'employees' | 'mascots';

const TAB_TRANSITION_DURATION_MS = 300;

const isEmployee = (item: Employee | Mascot): item is Employee =>
  'birth_date' in item;

export function EmployeesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const employeesQuery = useEmployees();
  const mascotsQuery = useMascots();
  const employeeAdmin = useEmployeeAdmin();
  const mascotAdmin = useMascotAdmin();
  const [activeTab, setActiveTab] = useState<TeamTab>('employees');
  const [isTabTransitioning, setTabTransitioning] = useState(false);
  const tabTransitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const showsEmployees = activeTab === 'employees';
  const employees = employeesQuery.data ?? [];
  const mascots = mascotsQuery.data ?? [];
  const activeError = showsEmployees
    ? employeesQuery.error
    : mascotsQuery.error;
  const listData: Array<Employee | Mascot> = showsEmployees
    ? employees
    : mascots;
  const isRefetching = showsEmployees
    ? employeesQuery.isRefetching
    : mascotsQuery.isRefetching;
  const showTabLoader =
    (showsEmployees ? employeesQuery.isLoading : mascotsQuery.isLoading) ||
    isTabTransitioning;
  const activeSubtitle = showsEmployees
    ? `${employees.length} angajați`
    : `${mascots.length} mascote`;

  useEffect(
    () => () => {
      if (tabTransitionTimeout.current) {
        clearTimeout(tabTransitionTimeout.current);
      }
    },
    [],
  );

  const changeTab = (nextTab: TeamTab) => {
    if (nextTab === activeTab) {
      return;
    }

    if (tabTransitionTimeout.current) {
      clearTimeout(tabTransitionTimeout.current);
    }

    setTabTransitioning(true);
    setActiveTab(nextTab);
    tabTransitionTimeout.current = setTimeout(() => {
      setTabTransitioning(false);
      tabTransitionTimeout.current = null;
    }, TAB_TRANSITION_DURATION_MS);
  };

  const refetchCurrentTab = () => {
    if (showsEmployees) {
      employeesQuery.refetch();
      return;
    }

    mascotsQuery.refetch();
  };

  return (
    <Screen>
      <FlatList<Employee | Mascot>
        ListHeaderComponent={
          <>
            <ScreenHeader
              action={
                <AppButton
                  accessibilityLabel={
                    showsEmployees ? 'Adaugă angajat' : 'Adaugă mascotă'
                  }
                  icon="add"
                  label={showsEmployees ? 'Angajat' : 'Mascotă'}
                  onPress={
                    showsEmployees
                      ? employeeAdmin.openCreate
                      : mascotAdmin.openCreate
                  }
                  size="small"
                  variant="outline"
                />
              }
              eyebrow="Echipă"
              subtitle={activeSubtitle}
              title="Echipă"
            />
            <AppSegmentedControl
              containerStyle={styles.segmentedControl}
              onChangeIndex={index =>
                changeTab(index === 0 ? 'employees' : 'mascots')
              }
              selectedIndex={showsEmployees ? 0 : 1}
              segments={[{ label: 'Angajați' }, { label: 'Mascote' }]}
            />
            {activeError && !isUnauthorizedError(activeError) ? (
              <ErrorBanner
                message={getErrorMessage(
                  activeError,
                  showsEmployees
                    ? 'Nu am putut încărca angajații.'
                    : 'Nu am putut încărca mascotele.',
                )}
                onRetry={refetchCurrentTab}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          showTabLoader ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={showsEmployees ? 'people-outline' : 'sparkles-outline'}
              message={
                showsEmployees
                  ? 'Adaugă persoane pentru a le asocia evenimentelor.'
                  : 'Adaugă mascote pentru formulare și evenimente.'
              }
              title={
                showsEmployees ? 'Nu ai angajați încă' : 'Nu ai mascote încă'
              }
            />
          )
        }
        contentContainerStyle={styles.listContent}
        data={showTabLoader ? [] : listData}
        keyExtractor={item => item.id.toString()}
        onRefresh={refetchCurrentTab}
        refreshing={isRefetching}
        renderItem={({ item }) =>
          isEmployee(item) ? (
            <EmployeeCard
              employee={item}
              onDelete={employeeAdmin.confirmDelete}
              onDetails={employee =>
                navigation.navigate('EmployeeDetails', {
                  employeeId: employee.id,
                })
              }
              onEdit={employeeAdmin.openEdit}
            />
          ) : (
            <MascotCard
              mascot={item}
              onDelete={mascotAdmin.confirmDelete}
              onDetails={mascot =>
                navigation.navigate('MascotDetails', { mascotId: mascot.id })
              }
              onEdit={mascotAdmin.openEdit}
            />
          )
        }
      />
      <EmployeeForm
        conflict={employeeAdmin.conflict}
        onReload={employeeAdmin.reloadCurrent}
        initialEmployee={employeeAdmin.editingEmployee}
        onCancel={employeeAdmin.closeForm}
        onSubmit={employeeAdmin.save}
        saving={employeeAdmin.isSaving}
        visible={employeeAdmin.isFormVisible}
      />
      <MascotForm
        initialMascot={mascotAdmin.editingMascot}
        onCancel={mascotAdmin.closeForm}
        onSubmit={mascotAdmin.save}
        saving={mascotAdmin.isSaving}
        visible={mascotAdmin.isFormVisible}
      />
      {employeeAdmin.isDeleting || mascotAdmin.isDeleting ? (
        <Text style={styles.pendingText}>Se arhivează...</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  segmentedControl: {
    marginBottom: theme.spacing.lg,
  },
  pendingText: {
    bottom: theme.spacing.lg,
    color: theme.colors.muted,
    fontSize: theme.typography.label,
    position: 'absolute',
    right: theme.spacing.lg,
  },
});
