import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmployeeTabParamList } from '@/shared/navigation/types';
import { EmployeeAgendaScreen } from '@/features/employeeWorkspace/screens/EmployeeAgendaScreen';
import { EmployeeEventsScreen } from '@/features/employeeWorkspace/screens/EmployeeEventsScreen';
import { EmployeeStatisticsScreen } from '@/features/employeeWorkspace/screens/EmployeeStatisticsScreen';
import { createResettingTabScreen } from '@/shared/navigation/createResettingTabScreen';
import { theme } from '@/shared/theme/theme';

const Tab = createBottomTabNavigator<EmployeeTabParamList>();
const EmployeeAgendaTabScreen = createResettingTabScreen(EmployeeAgendaScreen);
const EmployeeStatisticsTabScreen = createResettingTabScreen(
  EmployeeStatisticsScreen,
);
const EmployeeEventsTabScreen = createResettingTabScreen(EmployeeEventsScreen);
const TAB_BAR_BASE_HEIGHT = 68;
const TAB_BAR_TOP_PADDING = 10;
const TAB_ICON_SIZE = 22;

export default function EmployeeHomeTabs() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, theme.spacing.md);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subtle,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: true,
        tabBarLabel: ({ color }) => (
          <View style={styles.labelWrap}>
            <Text style={[styles.label, { color }]}>
              {route.name === 'Agenda'
                ? 'Agenda'
                : route.name === 'Statistics'
                  ? 'Statistici'
                  : 'Evenimente'}
            </Text>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          minHeight: TAB_BAR_BASE_HEIGHT * fontScale + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: TAB_BAR_TOP_PADDING,
        },
        tabBarIcon: ({ color, focused }) => (
          <Ionicons
            color={color}
            name={
              route.name === 'Agenda'
                ? focused
                  ? 'home'
                  : 'home-outline'
                : route.name === 'Statistics'
                  ? focused
                    ? 'stats-chart'
                    : 'stats-chart-outline'
                  : focused
                    ? 'calendar'
                    : 'calendar-outline'
            }
            size={TAB_ICON_SIZE}
          />
        ),
      })}
    >
      <Tab.Screen name="Agenda" component={EmployeeAgendaTabScreen} />
      <Tab.Screen name="Statistics" component={EmployeeStatisticsTabScreen} />
      <Tab.Screen name="Events" component={EmployeeEventsTabScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  labelWrap: { alignItems: 'center' },
  label: {
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.caption,
  },
});
