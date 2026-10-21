import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { EventCard } from '@/features/events/components/EventCard';
import { event } from '@/features/events/components/eventCardTestFixtures';

test('apasarea Maps pe cardul Home deschide numai harta, inclusiv fara telefon', async () => {
  const onDetails = jest.fn();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventCard
        showMapAction
        event={{
          ...event,
          contact_phone: null,
          map_location: {
            kind: 'manual_pin',
            place_id: null,
            latitude: 47.0465,
            longitude: 21.9189,
            confirmed: true,
            confirmed_at: '2026-10-08T15:00:00Z',
          },
        }}
        onDetails={onDetails}
      />,
    );
  });
  await ReactTestRenderer.act(async () => {
    await renderer?.root
      .findByProps({ accessibilityLabel: 'Deschide Google Maps' })
      .props.onPress();
  });
  expect(Linking.openURL).toHaveBeenCalledWith(
    expect.stringContaining('query=47.0465'),
  );
  expect(onDetails).not.toHaveBeenCalled();
  await ReactTestRenderer.act(async () => renderer?.unmount());
});
