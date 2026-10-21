import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EventPaymentsSection } from '@/features/events/components/EventPaymentsSection';
import { EventPayment } from '@/features/events/types';

const payment: EventPayment = {
  id: 'payment-1',
  event_id: 'event-1',
  type: 'incoming',
  category: 'cash',
  amount: 500,
  paid_at: '2026-09-18',
  status: 'completed',
};

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

const renderSection = async (
  totals: {
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    cashProfit: number;
  },
  onEdit = jest.fn(),
) => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EventPaymentsSection
        error={null}
        loading={false}
        onAdd={jest.fn()}
        onDelete={jest.fn()}
        onEdit={onEdit}
        onRetry={jest.fn()}
        payments={[payment]}
        totals={totals}
      />,
    );
  });

  return renderer as ReactTestRenderer.ReactTestRenderer;
};

test('arată restul de plată cât timp evenimentul nu e achitat', async () => {
  const renderer = await renderSection({
    totalAmount: 500,
    paidAmount: 0,
    balanceDue: 500,
    cashProfit: 0,
  });
  const text = getRenderedText(renderer.toJSON());

  expect(text).toContain('Rest plată500 lei');
  expect(text).not.toContain('Încasat0 lei');
  expect(text).toContain('Profit cash');

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('înlocuiește restul de plată cu încasarea după achitare', async () => {
  const renderer = await renderSection({
    totalAmount: 500,
    paidAmount: 500,
    balanceDue: 0,
    cashProfit: 400,
  });
  const text = getRenderedText(renderer.toJSON());

  expect(text).not.toContain('Rest plată');
  expect(text).toContain('Încasat500 lei');
  expect(text).toContain('Profit cash400 lei');
  expect(text).toContain('Adaugă plată');

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('deschide editarea la click pe cardul de plată', async () => {
  const onEdit = jest.fn();
  const renderer = await renderSection(
    { totalAmount: 500, paidAmount: 500, balanceDue: 0, cashProfit: 400 },
    onEdit,
  );

  const card = renderer.root
    .findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === 'Editează încasat de 500 lei',
    )
    .at(0);

  await ReactTestRenderer.act(async () => {
    card?.props.onPress();
  });

  expect(onEdit).toHaveBeenCalledWith(payment);

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});
