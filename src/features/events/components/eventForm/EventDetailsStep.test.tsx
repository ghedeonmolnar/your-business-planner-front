import React from 'react';
import { useForm } from 'react-hook-form';
import { EventDetailsStep } from '@/features/events/components/eventForm/EventDetailsStep';
import { fallbackChannels } from '@/features/events/components/eventForm/eventFormConfig';
import {
  emptyEventForm,
  EventFormInput,
  EventFormValues,
} from '@/features/events/schemas/eventSchema';
import { ControlledSelectField } from '@/shared/components/ControlledSelectField';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve(null)),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

function DetailsStep({
  channel,
}: {
  channel: EventFormInput['communication_channel'];
}) {
  const { control } = useForm<EventFormInput, unknown, EventFormValues>({
    defaultValues: { ...emptyEventForm, communication_channel: channel },
  });

  return (
    <EventDetailsStep
      catalogsLoading={false}
      channelOptions={fallbackChannels}
      control={control}
      maximumEventDate={new Date('2028-10-08')}
      minimumEventDate={new Date('2026-10-08')}
      mascotsLoading={false}
      mascotOptions={[]}
      showLegacyContactHint={false}
    />
  );
}

test.each([
  '',
  'whatsapp',
  'call',
  'olx',
  'facebook',
  'instagram',
  'email',
  'tiktok',
] as const)(
  'keeps the contact phone immediately after the channel %s',
  async channel => {
    const { renderer, unmount } = await renderWithProviders(
      <DetailsStep channel={channel} />,
    );
    const contactFields = renderer.root.findAll(
      instance =>
        instance.type === ControlledSelectField ||
        instance.type === ControlledTextField,
    );

    expect(contactFields.slice(0, 2).map(field => field.props.name)).toEqual([
      'communication_channel',
      'contact_phone',
    ]);
    expect(renderer.root.findByType(ControlledTextField).props).toMatchObject({
      name: 'contact_phone',
      label: 'Telefon de contact',
      keyboardType: 'phone-pad',
    });
    expect(
      renderer.root.findAllByProps({ name: 'contact_value' }),
    ).toHaveLength(0);

    await unmount();
  },
);
