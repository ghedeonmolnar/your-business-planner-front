import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { adaptNavigationTheme } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import HomeTabs from '@/app/navigation/HomeTabs';
import { BookingDetailsScreen } from '@/features/bookings/screens/BookingDetailsScreen';
import { StaffScreen } from '@/features/company/screens/DirectoryScreen';
import { HallsScreen } from '@/features/halls/screens/HallsScreen';
import { HallDetailsScreen } from '@/features/halls/screens/HallDetailsScreen';
import { HallFormScreen } from '@/features/halls/screens/HallFormScreen';
import { HallAvailabilityScreen } from '@/features/halls/screens/HallAvailabilityScreen';
import { HallBookingsScreen } from '@/features/halls/screens/HallBookingsScreen';
import { CustomerHistoryScreen } from '@/features/company/screens/CustomerHistoryScreen';
import { TeamScreen } from '@/features/company/screens/TeamScreen';
import { OverviewScreen } from '@/features/company/screens/OverviewScreen';
import { AgendaDetailsScreen } from '@/features/company/screens/AgendaDetailsScreen';
import { AgendaWeekendScreen } from '@/features/company/screens/AgendaWeekendScreen';
import { CompanyProfileScreen } from '@/features/company/screens/CompanyProfileScreen';
import { SubscriptionBlockedScreen } from '@/features/company/screens/SubscriptionBlockedScreen';
import { EventRemindersSync } from '@/features/events/notifications/EventRemindersSync';
import { useNotificationNavigation } from '@/features/events/notifications/useNotificationNavigation';
import {
  navigationRef,
  flushPendingEventNavigation,
} from '@/shared/navigation/navigationRef';
import { RootStackParamList } from '@/shared/navigation/types';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Screen } from '@/shared/components/Screen';
import { paperTheme } from '@/shared/theme/theme';
import { useMobilePolicy } from '@/features/mobilePolicy/hooks/useMobilePolicy';
import { ClientUpdateScreen } from '@/features/mobilePolicy/screens/ClientUpdateScreen';

const { LightTheme: navigationTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  materialLight: paperTheme,
});

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function RootNavigator() {
  const {
    isAuthenticated,
    isBootstrapping,
    user,
    bootstrapError,
    retryBootstrap,
  } = useAuth();
  const active =
    isAuthenticated && Boolean(user?.company && user.subscription?.active);
  if (isBootstrapping) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (bootstrapError) {
    return (
      <Screen>
        <ErrorBanner
          message="Nu am putut verifica sesiunea. Verifică conexiunea."
          onRetry={retryBootstrap}
        />
      </Screen>
    );
  }
  if (isAuthenticated && !active) {
    return <SubscriptionBlockedScreen />;
  }
  return active ? (
    <MobilePolicyGate>
      <ApplicationNavigation />
    </MobilePolicyGate>
  ) : (
    <ApplicationNavigation />
  );
}

function MobilePolicyGate({ children }: { children: React.ReactNode }) {
  const mobilePolicy = useMobilePolicy(true);
  useNotificationNavigation(!mobilePolicy.blocked);
  if (mobilePolicy.blocked) {
    return (
      <ClientUpdateScreen
        storeUrl={mobilePolicy.data?.store_url}
        onRetry={() => {
          void mobilePolicy.refetch();
        }}
      />
    );
  }
  return children;
}

function ApplicationNavigation() {
  const { isAuthenticated, user } = useAuth();
  const active =
    isAuthenticated && Boolean(user?.company && user.subscription?.active);
  return (
    <NavigationContainer
      key={user ? `${user.company?.id}:${user.id}:${user.role}` : 'signed-out'}
      theme={{ ...DefaultTheme, ...navigationTheme }}
      ref={navigationRef}
      onReady={flushPendingEventNavigation}
      onStateChange={flushPendingEventNavigation}
    >
      {active && user ? (
        <EventRemindersSync
          enabled={hasCompanyFeature(user, 'reminders')}
          role={user.role}
        />
      ) : null}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={HomeTabs} />
            <Stack.Screen
              name="EventDetails"
              component={BookingDetailsScreen}
            />
            {user?.role !== 'employee' ? (
              <>
                <Stack.Screen
                  name="AgendaDetails"
                  component={AgendaDetailsScreen}
                />
                <Stack.Screen
                  name="AgendaWeekend"
                  component={AgendaWeekendScreen}
                />
                <Stack.Screen
                  name="CustomerHistory"
                  component={CustomerHistoryScreen}
                />
                <Stack.Screen name="CompanyHalls" component={HallsScreen} />
                <Stack.Screen
                  name="HallDetails"
                  component={HallDetailsScreen}
                />
                <Stack.Screen name="HallForm" component={HallFormScreen} />
                <Stack.Screen
                  name="HallAvailability"
                  component={HallAvailabilityScreen}
                />
                <Stack.Screen
                  name="HallBookings"
                  component={HallBookingsScreen}
                />
                {hasCompanyFeature(user, 'staff') ? (
                  <Stack.Screen name="CompanyStaff" component={StaffScreen} />
                ) : null}
                {hasCompanyFeature(user, 'finance') ? (
                  <Stack.Screen
                    name="CompanyOverview"
                    component={OverviewScreen}
                  />
                ) : null}
              </>
            ) : null}
            {user?.role === 'owner' ? (
              <>
                <Stack.Screen name="CompanyTeam" component={TeamScreen} />
                <Stack.Screen
                  name="CompanyProfile"
                  component={CompanyProfileScreen}
                />
              </>
            ) : null}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
