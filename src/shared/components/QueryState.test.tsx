import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryState } from '@/shared/components/QueryState';
import { LoadingState } from '@/shared/components/LoadingState';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

test('încărcarea, eroarea și lipsa rezultatelor au stări distincte', async () => {
  const retry = jest.fn();
  const render = (loading: boolean, error?: Error) => (
    <AppThemeProvider>
      <QueryState loading={loading} error={error} empty retry={retry} />
    </AppThemeProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(render(true));
  });
  expect(renderer!.root.findAllByType(LoadingState)).toHaveLength(1);
  expect(renderer!.root.findAllByType(EmptyState)).toHaveLength(0);
  await ReactTestRenderer.act(async () =>
    renderer.update(render(false, new Error('Conexiune întreruptă'))),
  );
  expect(renderer!.root.findAllByType(EmptyState)).toHaveLength(0);
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(ErrorBanner).props.onRetry(),
  );
  expect(retry).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(async () => renderer.update(render(false)));
  expect(renderer!.root.findAllByType(EmptyState)).toHaveLength(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('refresh-ul datelor existente nu afișează încărcare inițială sau listă goală', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AppThemeProvider>
        <QueryState loading hasData empty error={new Error('Refresh eșuat')} />
      </AppThemeProvider>,
    );
  });
  expect(renderer!.root.findAllByType(LoadingState)).toHaveLength(0);
  expect(renderer!.root.findAllByType(EmptyState)).toHaveLength(0);
  expect(renderer!.root.findAllByType(ErrorBanner)).toHaveLength(1);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
