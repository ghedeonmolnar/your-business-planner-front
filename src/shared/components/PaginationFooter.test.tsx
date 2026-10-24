import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppButton } from '@/shared/components/AppButton';
import { PaginationFooter } from '@/shared/components/PaginationFooter';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';
import { ApiError } from '@/shared/api/apiError';

test('paginarea ignoră apăsările repetate până la terminarea cererii', async () => {
  let resolve: (() => void) | undefined;
  const pending = new Promise<void>(done => {
    resolve = done;
  });
  const load = jest.fn(() => pending);
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <PaginationFooter hasMore loading={false} onLoadMore={load} />
      </AppThemeProvider>,
    );
  });
  let first: Promise<void> | undefined;
  await ReactTestRenderer.act(async () => {
    const press = renderer.root.findByType(AppButton).props.onPress;
    first = press();
    void press();
  });
  expect(load).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => {
    resolve?.();
    await first;
  });
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByType(AppButton).props.onPress();
  });
  expect(load).toHaveBeenCalledTimes(2);
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('retry este disponibil și fără pagini suplimentare după o eroare', async () => {
  const retry = jest.fn();
  const load = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <PaginationFooter
          hasMore={false}
          loading={false}
          error={new Error('Conexiune întreruptă')}
          onLoadMore={load}
          onRetry={retry}
        />
      </AppThemeProvider>,
    );
  });
  expect(renderer!.root.findByType(AppButton).props.label).toBe(
    'Reîncearcă încărcarea',
  );
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByType(AppButton).props.onPress();
  });
  expect(retry).toHaveBeenCalledTimes(1);
  expect(load).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('expirarea sesiunii nu creează o acțiune locală de retry', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <PaginationFooter
          hasMore
          loading={false}
          error={new ApiError('Sesiune expirată', 401)}
          onLoadMore={jest.fn()}
        />
      </AppThemeProvider>,
    );
  });
  expect(renderer!.root.findAllByType(AppButton)).toHaveLength(0);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
