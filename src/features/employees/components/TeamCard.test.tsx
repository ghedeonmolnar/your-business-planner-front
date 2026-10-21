import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeCard } from '@/features/employees/components/EmployeeCard';
import { MascotCard } from '@/features/mascots/components/MascotCard';

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

test('employee card shows only the name, hourly rate and actions', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onDetails = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <EmployeeCard
        employee={{
          birth_date: '2026-07-28',
          gender: 'female',
          hourly_rate: 50,
          id: '1',
          is_active: true,
          name: 'Abi Bulcau',
        }}
        onDelete={() => undefined}
        onDetails={onDetails}
        onEdit={() => undefined}
      />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());

  expect(renderedText).toContain('Abi Bulcau');
  expect(renderedText).toContain('50 lei/h');
  expect(renderedText).not.toContain('Data nasterii');
  expect(renderedText).not.toContain('Sex:');
  expect(renderedText).toContain('✎');
  expect(
    renderer?.root.findAllByProps({ name: 'person-circle-outline' }),
  ).toHaveLength(0);
  expect(renderer?.root.findByProps({ name: 'trash-outline' })).toBeDefined();

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityRole: 'button', activeOpacity: 0.72 })
      .props.onPress();
  });

  expect(onDetails).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('mascot card keeps its image area and replaces the slug with the rate', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onDetails = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <MascotCard
        mascot={{
          id: '1',
          image_url: null,
          is_active: true,
          name: 'Alba ca zapada',
          price_per_hour: 150,
          slug: 'alba-ca-zapada',
        }}
        onDelete={() => undefined}
        onDetails={onDetails}
        onEdit={() => undefined}
      />,
    );
  });

  const renderedText = getRenderedText(renderer?.toJSON());

  expect(renderedText).toContain('Alba ca zapada');
  expect(renderedText).toContain('150 lei/h');
  expect(renderedText).not.toContain('alba-ca-zapada');
  expect(renderedText).toContain('✎');
  expect(
    renderer?.root.findByProps({ name: 'sparkles-outline' }),
  ).toBeDefined();
  expect(renderer?.root.findByProps({ name: 'trash-outline' })).toBeDefined();

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({
        accessibilityLabel: 'Deschide profilul mascotei Alba ca zapada',
      })
      .props.onPress();
  });

  expect(onDetails).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});

test('inactive cards keep the trash action for the permanent delete step', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  const onDeleteEmployee = jest.fn();
  const onDeleteMascot = jest.fn();

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <>
        <EmployeeCard
          employee={{
            birth_date: '2026-07-28',
            gender: 'female',
            hourly_rate: 50,
            id: '1',
            is_active: false,
            name: 'Abi Bulcau',
          }}
          onDelete={onDeleteEmployee}
          onDetails={() => undefined}
          onEdit={() => undefined}
        />
        <MascotCard
          mascot={{
            id: '1',
            image_url: null,
            is_active: false,
            name: 'Alba ca zapada',
            price_per_hour: 150,
            slug: 'alba-ca-zapada',
          }}
          onDelete={onDeleteMascot}
          onDetails={() => undefined}
          onEdit={() => undefined}
        />
      </>,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer?.root
      .findByProps({ accessibilityLabel: 'Șterge definitiv angajatul Abi Bulcau' })
      .props.onPress();
    renderer?.root
      .findByProps({
        accessibilityLabel: 'Șterge definitiv mascota Alba ca zapada',
      })
      .props.onPress();
  });

  expect(onDeleteEmployee).toHaveBeenCalledTimes(1);
  expect(onDeleteMascot).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
