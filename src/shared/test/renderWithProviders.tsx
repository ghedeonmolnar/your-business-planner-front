import React, { ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppDialog, AppDialogContent } from '@/shared/components/AppDialog';
import { DialogHost } from '@/shared/feedback/DialogHost';
import { clearDialogs } from '@/shared/feedback/dialogStore';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

const testInsets = { top: 24, right: 0, bottom: 24, left: 0 };

export const jsonResponse = (status: number, payload: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: () => 'application/json',
    },
    json: () => Promise.resolve(payload),
    text: () => Promise.resolve(JSON.stringify(payload)),
  }) as unknown as Response;

export const paginatedResponse = (
  items: unknown[],
  metadata: { snapshot?: string } = {},
) =>
  jsonResponse(200, {
    data: items,
    meta: { current_page: 1, last_page: 1, total: items.length, ...metadata },
  });

const findVisibleDialog = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(AppDialog)
    .find(instance => instance.props.dialog !== null) ?? null;

export const getVisibleDialog = (
  renderer: ReactTestRenderer.ReactTestRenderer,
): AppDialogContent | null => findVisibleDialog(renderer)?.props.dialog ?? null;

export const pressDialogButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const dialog = findVisibleDialog(renderer);

  if (!dialog) {
    throw new Error(`Nu este deschis niciun dialog cu butonul ${label}.`);
  }

  await ReactTestRenderer.act(async () => {
    dialog.findByProps({ accessibilityLabel: label }).props.onPress();
  });
};

export const renderWithProviders = async (ui: ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={testInsets}>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {ui}
              <DialogHost />
            </AuthProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta componenta de test.');
  }

  return {
    renderer,
    queryClient,
    unmount: async () => {
      await ReactTestRenderer.act(async () => {
        renderer?.unmount();
      });
      queryClient.clear();
      clearDialogs();
    },
  };
};
