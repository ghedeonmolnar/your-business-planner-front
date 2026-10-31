import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-paper';
import { CompanyProfileScreen } from '@/features/company/screens/CompanyProfileScreen';
import { AccountSettingsScreen } from '@/features/company/screens/AccountSettingsScreen';
import { CompanySettingsScreen } from '@/features/company/screens/CompanySettingsScreen';
import { RootStackParamList } from '@/shared/navigation/types';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import { CompanyProfile } from '@/features/company/schemas/companyProfileSchemas';
import { waitForUi } from '@/shared/test/waitForUi';
import {
  jsonResponse,
  paginatedResponse,
} from '@/shared/test/renderWithProviders';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const profileNavigation =
  createNavigationContainerRef<RootStackParamList>();
export const profileCompany: CompanyProfile = {
  ...plannerAccount.company!,
  billing_profile: {
    fiscal_code: '12345678',
    legal_name: 'Firma fiscală SRL',
    address: 'Adresa fiscală',
    trade_register_number: 'J01/123/2020',
    city: 'Oradea',
    county: 'Bihor',
    postal_code: '410000',
    country: 'RO',
    vat_registered: false,
    iban: 'RO49AAAA1B31007593840000',
    bank_name: 'Banca test',
  },
};

export function ProfileTestNavigator() {
  return (
    <NavigationContainer ref={profileNavigation}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
        />
        <Stack.Screen
          name="CompanySettings"
          component={CompanySettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const profileResponse = (url: unknown) => {
  if (String(url).endsWith('/me')) return jsonResponse(200, plannerAccount);
  if (String(url).includes('/subscription-invoices'))
    return paginatedResponse([]);
  return jsonResponse(200, profileCompany);
};

export const pressProfileAction = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  await ReactTestRenderer.act(async () => {
    const button = renderer.root
      .findAllByProps({ accessibilityLabel: label })
      .find(node => typeof node.props.onPress === 'function');
    if (!button) throw new Error(`Acțiune lipsă: ${label}`);
    button.props.onPress();
  });
};

export const profileInput = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const input = renderer.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label);
  if (!input) throw new Error(`Câmp lipsă: ${label}`);
  return input;
};

export const changeProfileInput = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await waitForUi(() => expect(profileInput(renderer, label)).toBeDefined());
  await ReactTestRenderer.act(async () =>
    profileInput(renderer, label).props.onChangeText(value),
  );
};

export const openCompanySettings = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  tab: 'general' | 'billing' = 'general',
) => {
  await pressProfileAction(renderer, 'Firmă și facturare');
  await waitForUi(() =>
    expect(profileInput(renderer, 'Numele companiei')).toBeDefined(),
  );
  if (tab === 'billing') await pressProfileAction(renderer, 'Facturare');
};
