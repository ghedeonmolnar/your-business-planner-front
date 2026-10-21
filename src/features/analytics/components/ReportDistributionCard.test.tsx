import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ReportDistributionCard } from '@/features/analytics/components/ReportDistributionCard';

const items = ['Oradea', 'Beius', 'Ioanis', 'Alesd', 'Salonta', 'Marghita'].map(
  (label, index) => ({ label, count: 6 - index, percent: (6 - index) * 10 }),
);

function renderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(renderedText).join('');
  }
  if (value && typeof value === 'object' && 'children' in value) {
    return renderedText((value as { children?: unknown }).children);
  }
  return '';
}

test('afișează inițial cinci localități și permite extinderea listei', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <ReportDistributionCard title="Localități" items={items} />,
    );
  });

  expect(renderedText(renderer?.toJSON())).not.toContain('Marghita');
  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Vezi toate Localități' })
      .props.onPress();
  });
  expect(renderedText(renderer?.toJSON())).toContain('Marghita');

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Restrânge Localități' })
      .props.onPress();
  });
  expect(renderedText(renderer?.toJSON())).not.toContain('Marghita');

  await ReactTestRenderer.act(async () => renderer?.unmount());
});
