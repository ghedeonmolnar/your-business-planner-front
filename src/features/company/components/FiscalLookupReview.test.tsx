import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { FiscalLookupReview } from '@/features/company/components/FiscalLookupReview';
import {
  profileCompany,
  profileResponse,
  pressProfileAction,
} from '@/features/company/utils/profileScreenTestUtils';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('revizuirea afișează un singur rezumat și permite aplicarea directă în formular', async () => {
  globalThis.fetch = jest.fn(url =>
    Promise.resolve(profileResponse(url)),
  ) as typeof globalThis.fetch;
  const apply = jest.fn();
  const close = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <FiscalLookupReview
      proposal={profileCompany.billing_profile!}
      onApply={apply}
      onClose={close}
    />,
  );
  try {
    await waitForUi(() =>
      expect(JSON.stringify(renderer.toJSON())).toContain('Date de la ANAF'),
    );
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      'Datele din formular',
    );
    expect(apply).not.toHaveBeenCalled();
    const panel = renderer.root
      .findAllByType(Surface)
      .find(
        node => StyleSheet.flatten(node.props.style)?.maxHeight !== undefined,
      )!;
    const panelStyle = StyleSheet.flatten(panel.props.style);
    expect(panelStyle.height).toBeUndefined();
    expect(panelStyle.flex).toBe(0);
    expect(panelStyle.maxHeight).toBeGreaterThan(0);
    expect(
      panel
        .findByType(ScrollView)
        .findAllByProps({ accessibilityLabel: 'Aplică în formular' }),
    ).toHaveLength(0);
    await pressProfileAction(renderer, 'Aplică în formular');
    expect(apply).toHaveBeenCalledTimes(1);
    await pressProfileAction(renderer, 'Renunță');
    expect(close).toHaveBeenCalledTimes(1);
  } finally {
    await unmount();
  }
});
