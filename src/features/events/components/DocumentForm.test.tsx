import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Calendar } from 'react-native-calendars';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { DocumentForm } from '@/features/events/components/DocumentForm';
import { EventDocumentMetadataPayload } from '@/features/events/types';

const insets = { top: 24, right: 0, bottom: 24, left: 0 };

test('alege data documentului din calendar', async () => {
  const onUpdate = jest.fn<void, [EventDocumentMetadataPayload]>();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaInsetsContext.Provider value={insets}>
        <DocumentForm
          initialDocument={{
            id: 'document-1',
            event_id: 'event-1',
            document_type: 'contract',
            title: 'Contract eveniment',
            original_name: 'contract.pdf',
            size_bytes: 100,
            document_date: null,
          }}
          onCancel={jest.fn()}
          onCreate={jest.fn()}
          onUpdate={onUpdate}
          saving={false}
          visible
        />
      </SafeAreaInsetsContext.Provider>,
    );
  });

  if (!renderer) {
    throw new Error('Nu am putut monta formularul de document.');
  }
  const mountedRenderer = renderer;

  await ReactTestRenderer.act(async () => {
    mountedRenderer.root
      .findAllByProps({ accessibilityLabel: 'Data' })
      .find(node => typeof node.props.onPress === 'function')
      ?.props.onPress();
  });

  expect(
    mountedRenderer.root.findAllByProps({ accessibilityLabel: 'Alege anul' }),
  ).toHaveLength(0);

  await ReactTestRenderer.act(async () => {
    mountedRenderer.root.findByType(Calendar).props.onDayPress({
      dateString: '2026-10-05',
    });
  });

  await ReactTestRenderer.act(async () => {
    mountedRenderer.root.findByProps({ label: 'Salvează' }).props.onPress();
  });

  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ document_date: '2026-10-05' }),
  );

  await ReactTestRenderer.act(async () => {
    mountedRenderer.unmount();
  });
});
