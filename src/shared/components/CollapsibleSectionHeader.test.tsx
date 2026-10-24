import React, { useState } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CollapsibleSectionHeader } from '@/shared/components/CollapsibleSectionHeader';

function Section() {
  const [expanded, setExpanded] = useState(true);
  return (
    <CollapsibleSectionHeader
      title="Octombrie"
      countLabel="2 rezervări"
      expanded={expanded}
      onToggle={() => setExpanded(value => !value)}
    />
  );
}

test('antetul anunță starea și poate restrânge și redeschide secțiunea', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Section />);
  });
  const toggle = () =>
    renderer.root.findByProps({ accessibilityLabel: 'Octombrie, 2 rezervări' });
  expect(toggle().props.accessibilityLabel).toBe('Octombrie, 2 rezervări');
  expect(toggle().props.accessibilityState.expanded).toBe(true);
  await ReactTestRenderer.act(async () => toggle().props.onPress());
  expect(toggle().props.accessibilityState.expanded).toBe(false);
  await ReactTestRenderer.act(async () => toggle().props.onPress());
  expect(toggle().props.accessibilityState.expanded).toBe(true);
  await ReactTestRenderer.act(async () => renderer.unmount());
});
