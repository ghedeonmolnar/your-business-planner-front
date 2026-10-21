import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { adaptNavigationTheme } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import HomeTabs from '@/app/navigation/HomeTabs';
import { BookingDetailsScreen } from '@/features/bookings/screens/BookingDetailsScreen';
import {
  HallsScreen,
  StaffScreen,
} from '@/features/company/screens/DirectoryScreen';
import { CustomerHistoryScreen } from '@/features/company/screens/CustomerHistoryScreen';
import { TeamScreen } from '@/features/company/screens/TeamScreen';
import { OverviewScreen } from '@/features/company/screens/OverviewScreen';
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
  useNotificationNavigation(active);
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
  return (
    <NavigationContainer
      theme={navigationTheme}
      ref={navigationRef}
      onReady={flushPendingEventNavigation}
      onStateChange={flushPendingEventNavigation}
    >
      {active && user ? <EventRemindersSync enabled role={user.role} /> : null}
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
                  name="CustomerHistory"
                  component={CustomerHistoryScreen}
                />
                <Stack.Screen name="CompanyHalls" component={HallsScreen} />
                <Stack.Screen name="CompanyStaff" component={StaffScreen} />
                <Stack.Screen
                  name="CompanyOverview"
                  component={OverviewScreen}
                />
              </>
            ) : null}
            {user?.role === 'owner' ? (
              <Stack.Screen name="CompanyTeam" component={TeamScreen} />
            ) : null}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
