import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { theme } from '@/shared/theme/theme';

test('shows phone and green WhatsApp actions when the client has a phone', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <ClientCard
        client={{
          id: 'client-1',
          judet: 'Bihor',
          name: 'Client test',
          notes: null,
          oras: 'Oradea',
          phone: '+40732652339',
          source: 'facebook',
          strada: null,
        }}
        onDelete={() => undefined}
        onDetails={() => undefined}
        onEdit={() => undefined}
        sourceLabels={new Map([['facebook', 'Facebook']])}
      />,
    );
  });

  expect(renderer?.root.findByProps({ name: 'call-outline' })).toBeDefined();
  expect(
    renderer?.root.findByProps({ name: 'logo-whatsapp' }).props.color,
  ).toBe(theme.colors.success);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
